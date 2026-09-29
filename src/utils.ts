export function normalizeAnswer(value: string): string {
  return value
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`]/g, "'")
    .replace(/[^\p{L}\p{N}' ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function answerMatches(value: string, expected: string | string[]): boolean {
  const normalized = normalizeAnswer(value);
  if (!normalized) return false;
  const options = Array.isArray(expected) ? expected : [expected];
  return options.some((option) => normalizeAnswer(option) === normalized);
}

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or a full storage quota should not prevent using the demo.
  }
}
