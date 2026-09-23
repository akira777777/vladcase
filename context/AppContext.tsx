'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import type { Case, Item } from '@/types';
import {
  commit,
  initialState,
  readSnapshot,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  type Command,
  type Result,
  type Snapshot,
} from '@/lib/economy';
import {
  initialPreferences,
  readPreferences,
  writePreferences,
  type Preferences,
} from '@/lib/preferences';
import { setSoundMuted } from '@/lib/sound';

function useEconomyController() {
  const [state, setState] = useState<Snapshot>(initialState);
  const [isLoaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = useRef(false);
  const opening = useRef(false);
  const [activeOpening, setActiveOpening] = useState(false);

  const refresh = useCallback(async () => {
    ready.current = false;
    setLoaded(false);
    try {
      if (!navigator.locks)
        throw new Error(
          'Safe storage requires HTTPS and a browser with Web Locks support.'
        );
      await navigator.locks.request(STORAGE_KEY, () => {
        const saved = readSnapshot(localStorage);
        const v1 = {
          version: 1,
          balanceCents: saved.balanceCents,
          xp: saved.xp,
          inventory: saved.inventory,
          history: saved.history,
        };
        if (localStorage.getItem(LEGACY_STORAGE_KEY) === null) {
          localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(v1));
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        setState(saved);
      });
      ready.current = true;
      setLoaded(true);
      setError(null);
    } catch (cause) {
      setError(
        `Progress could not be loaded. Saved data was preserved. ${
          cause instanceof Error
            ? cause.message
            : 'Check browser storage permissions.'
        }`
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
    const sync = (event: StorageEvent) => {
      if (
        event.key === STORAGE_KEY ||
        event.key === LEGACY_STORAGE_KEY ||
        event.key === null
      )
        void refresh();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [refresh]);

  const run = useCallback(async (command: Command): Promise<Result> => {
    if (!ready.current)
      return {
        ok: false,
        code: 'unavailable',
        message: 'Saved progress is not ready.',
      };
    try {
      return await navigator.locks.request(STORAGE_KEY, () => {
        const change = commit(localStorage, command);
        setState(change.state);
        setError(change.result.ok ? null : change.result.message);
        return change.result;
      });
    } catch {
      const message =
        'Changes could not be saved. Nothing was charged or sold. Check available storage and retry.';
      setError(message);
      return { ok: false, code: 'storage', message };
    }
  }, []);

  const actions = useMemo(
    () => ({
      addBalance: (amount: number) => run({ type: 'credit', amount }),
      sellItem: (id: string) => run({ type: 'sell', id }),
      removeItem: (id: string) => run({ type: 'remove', id }),
      sellAll: () => run({ type: 'sellAll' }),
      resetEconomy: () => run({ type: 'reset' }),
      toggleFavorite: (id: string) => run({ type: 'toggleFavorite', id }),
      toggleGoal: (id: string) => run({ type: 'toggleGoal', id }),
      tradeUpContract: (inputIds: string[], rewardItem: Item) =>
        run({ type: 'contract', inputIds, rewardItem }),
      upgradeItem: (inputId: string, targetItem: Item, won: boolean) =>
        run({ type: 'upgrade', inputId, targetItem, won }),
      openCase: async (caseData: Case): Promise<Result> => {
        if (opening.current)
          return {
            ok: false,
            code: 'unavailable',
            message: 'An opening is already active.',
          };
        opening.current = true;
        setActiveOpening(true);
        const result = await run({ type: 'open', caseData });
        if (!result.ok) {
          opening.current = false;
          setActiveOpening(false);
        }
        return result;
      },
      openMany: async (caseData: Case, count: number): Promise<Result> => {
        if (opening.current)
          return {
            ok: false,
            code: 'unavailable',
            message: 'An opening is already active.',
          };
        opening.current = true;
        setActiveOpening(true);
        const result = await run({ type: 'openMany', caseData, count });
        opening.current = false;
        setActiveOpening(false);
        return result;
      },
      finishOpening: () => {
        opening.current = false;
        setActiveOpening(false);
      },
    }),
    [run]
  );
  return { state, isLoaded, error, refresh, activeOpening, actions };
}

type Controller = ReturnType<typeof useEconomyController>;
type Actions = Controller['actions'];
const EconomyContext = createContext<
  | ({
      balance: number;
      xp: number;
      level: number;
      isLoaded: boolean;
      activeOpening: boolean;
    } & Actions)
  | null
>(null);
const InventoryContext = createContext<
  | ({
      inventory: Snapshot['inventory'];
      favoriteIds: string[];
      isLoaded: boolean;
    } & Actions)
  | null
>(null);
const AppStateContext = createContext<
  | (Snapshot & { isLoaded: boolean } & Actions)
  | null
>(null);
const PreferencesContext = createContext<{
  preferences: Preferences;
  setPreference: <Key extends keyof Preferences>(
    key: Key,
    value: Preferences[Key]
  ) => void;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const controller = useEconomyController();
  const { state, isLoaded, error, refresh, activeOpening, actions } =
    controller;
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);

  useEffect(() => {
    try {
      const saved = readPreferences(localStorage);
      setPreferences(saved);
      setSoundMuted(!saved.soundEnabled);
    } catch {
      const defaults = initialPreferences();
      setPreferences(defaults);
      setSoundMuted(false);
    }
  }, []);

  const setPreference = useCallback(
    <Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => {
      setPreferences((previous) => {
        const next = writePreferences(localStorage, { ...previous, [key]: value });
        if (key === 'soundEnabled') setSoundMuted(!next.soundEnabled);
        return next;
      });
    },
    []
  );

  const economy = useMemo(
    () => ({
      balance: state.balanceCents / 100,
      xp: state.xp,
      level: Math.floor(state.xp / 1000) + 1,
      isLoaded,
      activeOpening,
      ...actions,
    }),
    [state.balanceCents, state.xp, isLoaded, activeOpening, actions]
  );

  const inventory = useMemo(
    () => ({ inventory: state.inventory, favoriteIds: state.favoriteIds, isLoaded, ...actions }),
    [state.inventory, state.favoriteIds, isLoaded, actions]
  );
  const appState = useMemo(
    () => ({ ...state, isLoaded, ...actions }),
    [state, isLoaded, actions]
  );
  const preferenceState = useMemo(
    () => ({ preferences, setPreference }),
    [preferences, setPreference]
  );

  return (
    <PreferencesContext.Provider value={preferenceState}>
      <EconomyContext.Provider value={economy}>
        <InventoryContext.Provider value={inventory}>
          <AppStateContext.Provider value={appState}>
            {error && (
              <div
                role="alert"
                className="fixed bottom-4 left-4 right-4 z-[100] rounded-xl bg-red-950 p-4 text-white border border-red-400"
              >
                {error}{' '}
                <button className="underline ml-3" onClick={() => void refresh()}>
                  Retry loading
                </button>
              </div>
            )}
            {children}
          </AppStateContext.Provider>
        </InventoryContext.Provider>
      </EconomyContext.Provider>
    </PreferencesContext.Provider>
  );
}

export function useEconomyState() {
  const value = useContext(EconomyContext);
  if (!value) throw new Error('AppProvider missing');
  return value;
}
export function useInventoryState() {
  const value = useContext(InventoryContext);
  if (!value) throw new Error('AppProvider missing');
  return value;
}
export function useApp() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('AppProvider missing');
  return value;
}
export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('AppProvider missing');
  return value;
}
