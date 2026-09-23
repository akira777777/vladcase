export type RevealMode = 'full' | 'fast' | 'instant';

export interface Preferences {
  version: 1;
  soundEnabled: boolean;
  revealMode: RevealMode;
  confirmSales: boolean;
  confirmDeletes: boolean;
  compactInventory: boolean;
}

export const PREFERENCES_KEY = 'vladcase_preferences_v1';
export const initialPreferences = (): Preferences => ({
  version: 1,
  soundEnabled: true,
  revealMode: 'full',
  confirmSales: true,
  confirmDeletes: true,
  compactInventory: false,
});

export function validatePreferences(value: unknown): Preferences {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid saved preferences');
  const input = value as Record<string, unknown>;
  if (input.version !== 1) throw new Error('Unsupported preferences version');
  const modes: RevealMode[] = ['full', 'fast', 'instant'];
  if (typeof input.soundEnabled !== 'boolean')
    throw new Error('Invalid sound preference');
  if (!modes.includes(input.revealMode as RevealMode))
    throw new Error('Invalid reveal preference');
  for (const key of ['confirmSales', 'confirmDeletes', 'compactInventory']) {
    if (typeof input[key] !== 'boolean')
      throw new Error(`Invalid ${key} preference`);
  }
  return input as unknown as Preferences;
}

export function readPreferences(storage: Pick<Storage, 'getItem'>): Preferences {
  const raw = storage.getItem(PREFERENCES_KEY);
  return raw === null
    ? initialPreferences()
    : validatePreferences(JSON.parse(raw));
}

export function writePreferences(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  preferences: Preferences
): Preferences {
  const next = validatePreferences(preferences);
  storage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  return next;
}
