// ---------------------------------------------------------------------------
// Scroll memory for browser history. The transitions keep the exiting page
// frozen at its offset, so the browser's own scroll restoration is off
// (history.scrollRestoration = "manual") and this restores it instead: every
// history entry carries a key in its state, and the offset a page had when
// its entry was left (window and, for /work, its own <main> scroller) is kept
// under that key for the next Back/Forward onto it.
//
// Next.js keeps custom history state across traversals and merges it on
// replaceState, and only rewrites an entry wholesale on a fresh push, which
// happens before the new entry is adopted here.
// ---------------------------------------------------------------------------

export type SavedScroll = { y: number; main: number };

const STATE_KEY = "__pageScrollKey";
const STORAGE_KEY = "page-transition:history-scroll";
const MAX_ENTRIES = 50;

let memory: Map<string, SavedScroll> | null = null;
let currentKey: string | null = null;

const isSaved = (value: unknown): value is SavedScroll =>
  typeof value === "object" &&
  value !== null &&
  Number.isFinite((value as SavedScroll).y) &&
  Number.isFinite((value as SavedScroll).main);

const store = () => {
  if (memory) return memory;
  memory = new Map();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const entries: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (Array.isArray(entry) && typeof entry[0] === "string" && isSaved(entry[1])) {
          memory.set(entry[0], entry[1]);
        }
      }
    }
  } catch {
    // Storage unavailable: the memory still covers this document.
  }
  return memory;
};

const persist = (entries: Map<string, SavedScroll>) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(entries)));
  } catch {
    // Storage unavailable or full: keep the in-memory copy only.
  }
};

const keyOf = (state: unknown) => {
  const key = typeof state === "object" && state !== null ? (state as Record<string, unknown>)[STATE_KEY] : null;
  return typeof key === "string" ? key : null;
};

const createKey = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Makes the current history entry the one being viewed, giving it a key on
 * first sight. Call only once the router has written the entry (the URL
 * already shows `pathname`).
 */
export const adoptHistoryEntry = (pathname: string) => {
  if (typeof window === "undefined" || window.location.pathname !== pathname) return;
  const state: unknown = window.history.state;
  let key = keyOf(state);
  if (!key) {
    key = createKey();
    try {
      const base = typeof state === "object" && state !== null ? state : {};
      window.history.replaceState({ ...base, [STATE_KEY]: key }, "");
    } catch {
      return;
    }
  }
  currentKey = key;
};

/** Remembers where the entry being left was scrolled to. */
export const rememberScroll = (saved: SavedScroll) => {
  if (!currentKey) return;
  const entries = store();
  entries.delete(currentKey);
  entries.set(currentKey, { y: Math.max(0, Math.round(saved.y)), main: Math.max(0, Math.round(saved.main)) });
  while (entries.size > MAX_ENTRIES) {
    const oldest = entries.keys().next().value;
    if (oldest === undefined) break;
    entries.delete(oldest);
  }
  persist(entries);
};

/** The offset the entry in `state` was left at, if this session saw it. */
export const savedScrollFor = (state: unknown): SavedScroll | null => {
  const key = keyOf(state);
  return key ? (store().get(key) ?? null) : null;
};
