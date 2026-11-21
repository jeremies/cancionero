import songsData from './songs.json';
import type { Song } from '../types/song';

/** All songs sorted ascending by song number. */
export const SONGS: Song[] = [...(songsData as Song[])].sort(
  (a, b) => a.number - b.number,
);

/** Normalizes text to lowercase without combining diacritics for accent-insensitive search. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Parses a positive integer song number from user input (optional leading '#'). */
export function parseSongNumberInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/^#/, '').trim();
  if (!/^\d+$/.test(cleaned)) {
    return null;
  }
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Returns the song matching the given number, if any. */
export function getSongByNumber(songNumber: number): Song | undefined {
  return SONGS.find((song) => song.number === songNumber);
}

/** Returns the previous and next songs in sorted catalog order. */
export function getAdjacentSongs(songNumber: number): {
  prev?: Song;
  next?: Song;
} {
  const index = SONGS.findIndex((song) => song.number === songNumber);
  if (index === -1) {
    return {};
  }
  return {
    prev: index > 0 ? SONGS[index - 1] : undefined,
    next: index < SONGS.length - 1 ? SONGS[index + 1] : undefined,
  };
}

/** Filters songs by song number prefix/exact match or accent-insensitive title substring. */
export function filterSongs(query: string): Song[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return SONGS;
  }

  const parsedNumber = parseSongNumberInput(trimmed);
  if (parsedNumber !== null) {
    const prefix = String(parsedNumber);
    const exact = SONGS.filter((song) => song.number === parsedNumber);
    const startsWith = SONGS.filter(
      (song) => song.number !== parsedNumber && String(song.number).startsWith(prefix),
    );
    return [...exact, ...startsWith];
  }

  const normalizedQuery = normalizeText(trimmed);
  return SONGS.filter((song) =>
    normalizeText(song.title).includes(normalizedQuery),
  );
}

/** Formats the available song numbers cleanly (e.g., "1–10"). */
export function formatAvailableRange(): string {
  if (SONGS.length === 0) {
    return '';
  }
  if (SONGS.length === 1) {
    return String(SONGS[0].number);
  }
  const isContiguous = SONGS.every(
    (song, idx) => idx === 0 || song.number === SONGS[idx - 1].number + 1,
  );
  if (isContiguous) {
    return `${SONGS[0].number}–${SONGS[SONGS.length - 1].number}`;
  }
  return SONGS.map((song) => song.number).join(', ');
}
