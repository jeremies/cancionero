import { useCallback, useEffect, useState } from 'react';
import { getSongByNumber } from '../data/songs';
import {
  buildHomeHash,
  buildSongHash,
  parseHashRoute,
  type AppRoute,
} from '../utils/routing';

/** Synchronizes React navigation state with window.location.hash. */
export function useHashRoute() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseHashRoute(typeof window !== 'undefined' ? window.location.hash : ''),
  );

  useEffect(() => {
    const syncFromHash = () => {
      setRoute(parseHashRoute(window.location.hash));
    };

    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    if (route.view === 'song') {
      const song = getSongByNumber(route.songNumber);
      document.title = song
        ? `${song.number}. ${song.title} — Cancionero`
        : `Canción #${route.songNumber} — Cancionero`;
    } else {
      document.title = 'Cancionero — Villancicos';
    }

    if (typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      } catch {
        // Ignore in environments where scrollTo or ScrollBehavior is unsupported.
      }
    }
  }, [route]);

  const goToSong = useCallback((songNumber: number) => {
    const nextHash = buildSongHash(songNumber);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    } else {
      setRoute({ view: 'song', songNumber });
    }
  }, []);

  const goHome = useCallback(() => {
    const nextHash = buildHomeHash();
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    } else {
      setRoute({ view: 'home' });
    }
  }, []);

  return { route, goToSong, goHome };
}
