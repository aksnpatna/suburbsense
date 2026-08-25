import { useSyncExternalStore, useCallback } from 'react';

const SAVED_KEY = 'suburbsense:saved';
const RECENT_KEY = 'suburbsense:recent';
const MAX_RECENT = 8;
const MAX_SAVED = 50;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Manual subscription so multiple hook instances stay in sync
const listeners = new Set();
function emit() {
  listeners.forEach((l) => l());
  try {
    window.dispatchEvent(new Event('suburb-library-changed'));
  } catch { /* noop in non-browser */ }
}

function subscribe(cb) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

export function useSavedSuburbs() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(SAVED_KEY) || '[]'
  );
  const saved = (() => { try { return JSON.parse(snapshot); } catch { return []; } })();

  const isSaved = useCallback(
    (slug) => saved.some((s) => s.slug === slug),
    [saved]
  );

  const toggleSaved = useCallback((suburb) => {
    const current = read(SAVED_KEY, []);
    const exists = current.some((s) => s.slug === suburb.slug);
    const next = exists
      ? current.filter((s) => s.slug !== suburb.slug)
      : [{ ...suburb, savedAt: Date.now() }, ...current].slice(0, MAX_SAVED);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch { /* quota exceeded — ignore */ }
    emit();
    return !exists;
  }, []);

  return { saved, isSaved, toggleSaved };
}

export function recordRecentVisit(suburb) {
  const current = read(RECENT_KEY, []).filter((s) => s.slug !== suburb.slug);
  const next = [{ ...suburb, visitedAt: Date.now() }, ...current].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
  emit();
}

export function useRecentSuburbs() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(RECENT_KEY) || '[]'
  );
  const recent = (() => { try { return JSON.parse(snapshot); } catch { return []; } })();

  const removeRecent = useCallback((slug) => {
    const next = read(RECENT_KEY, []).filter((s) => s.slug !== slug);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
    emit();
  }, []);

  return { recent, removeRecent };
}
