import { getFireantToken, cleanTokenString } from './token';

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string | undefined>>();

function normSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

/** Returns cached English issuer name from FireAnt profile if already fetched. */
export function peekInternationalIssuerName(symbol: string): string | undefined {
  const key = normSymbol(symbol);
  if (!key) return undefined;
  return cache.get(key);
}

/**
 * Fetches `internationalName` from GET /symbols/{symbol}/profile (via local proxy).
 * Results are memoized per symbol for the session.
 */
export async function fetchInternationalIssuerName(symbol: string): Promise<string | undefined> {
  const key = normSymbol(symbol);
  if (!key) return undefined;
  if (cache.has(key)) return cache.get(key);

  let pending = inflight.get(key);
  if (!pending) {
    pending = (async () => {
      try {
        const token = getFireantToken();
        if (!token) return undefined;
        const cleanToken = cleanTokenString(token);
        const response = await fetch(`/api/fireant/symbols/${encodeURIComponent(key)}/profile`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${cleanToken}`,
          },
        });
        if (!response.ok) return undefined;
        const data = await response.json();
        const name =
          typeof data.internationalName === 'string' ? data.internationalName.trim() : '';
        if (name) cache.set(key, name);
        return name || undefined;
      } catch {
        return undefined;
      } finally {
        inflight.delete(key);
      }
    })();
    inflight.set(key, pending);
  }
  return pending;
}
