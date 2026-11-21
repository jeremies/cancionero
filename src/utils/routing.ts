export type AppRoute =
  | { view: 'home' }
  | { view: 'song'; songNumber: number };

/** Parses hash fragments like '#/4', '#4', or '#/song/4' into an AppRoute. */
export function parseHashRoute(hash: string): AppRoute {
  const cleaned = hash.replace(/^#\/?/, '').trim();
  if (!cleaned) {
    return { view: 'home' };
  }

  const songPathMatch = cleaned.match(/^(?:song\/)?(\d+)\/?$/);
  if (!songPathMatch) {
    return { view: 'home' };
  }

  const songNumber = Number.parseInt(songPathMatch[1], 10);
  if (!Number.isSafeInteger(songNumber) || songNumber <= 0) {
    return { view: 'home' };
  }

  return { view: 'song', songNumber };
}

/** Builds the hash fragment for a specific song number. */
export function buildSongHash(songNumber: number): string {
  return `#/${songNumber}`;
}

/** Builds the hash fragment for the home index view. */
export function buildHomeHash(): string {
  return '#/';
}

/** Builds an absolute shareable URL for a specific song number. */
export function buildShareUrl(songNumber: number): string {
  if (typeof window === 'undefined') {
    return buildSongHash(songNumber);
  }
  const { origin, pathname, search } = window.location;
  const base = origin && origin !== 'null' ? `${origin}${pathname}${search}` : `${pathname}${search}`;
  return `${base}${buildSongHash(songNumber)}`;
}
