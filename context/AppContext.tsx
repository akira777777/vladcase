'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import type { Case } from '@/types';
import {
  commit,
  initialState,
  readSnapshot,
  STORAGE_KEY,
  type Command,
  type Result,
} from '@/lib/economy';

function useController() {
  const [state, setState] = useState(initialState);
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
        if (localStorage.getItem(STORAGE_KEY) === null)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        setState(saved);
      });
      ready.current = true;
      setLoaded(true);
      setError(null);
    } catch (cause) {
      setError(
        `Progress could not be loaded. Saved data was preserved. ${cause instanceof Error ? cause.message : 'Check browser storage permissions.'}`
      );
    }
  }, []);
  useEffect(() => {
    void refresh();
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) void refresh();
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
        setState((previous) => ({
          ...change.state,
          inventory:
            JSON.stringify(previous.inventory) ===
            JSON.stringify(change.state.inventory)
              ? previous.inventory
              : change.state.inventory,
          history:
            JSON.stringify(previous.history) ===
            JSON.stringify(change.state.history)
              ? previous.history
              : change.state.history,
        }));
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
      finishOpening: () => {
        opening.current = false;
        setActiveOpening(false);
      },
    }),
    [run]
  );
  return { state, isLoaded, error, refresh, activeOpening, actions };
}
type Controller = ReturnType<typeof useController>;
const EconomyContext = createContext<
  | ({
      balance: number;
      xp: number;
      level: number;
      isLoaded: boolean;
      activeOpening: boolean;
    } & Controller['actions'])
  | null
>(null);
const InventoryContext = createContext<
  | ({
      inventory: Controller['state']['inventory'];
      isLoaded: boolean;
    } & Controller['actions'])
  | null
>(null);
const HistoryContext = createContext<Controller['state']['history']>([]);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const { state, isLoaded, error, refresh, activeOpening, actions } =
    useController();
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
    () => ({ inventory: state.inventory, isLoaded, ...actions }),
    [state.inventory, isLoaded, actions]
  );
  return (
    <EconomyContext.Provider value={economy}>
      <InventoryContext.Provider value={inventory}>
        <HistoryContext.Provider value={state.history}>
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
        </HistoryContext.Provider>
      </InventoryContext.Provider>
    </EconomyContext.Provider>
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
  return { history: useContext(HistoryContext) };
}
