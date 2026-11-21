import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'cancionero:wakeLock';

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
  removeEventListener: (type: 'release', listener: () => void) => void;
}

interface NavigatorWithWakeLock {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
}

function readInitialEnabled(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'false') {
      return false;
    }
  } catch {
    // Ignore storage access errors.
  }
  return true;
}

/** Keeps the device screen awake while singing via the Screen Wake Lock API. */
export function useWakeLock(active: boolean) {
  const isSupported =
    typeof navigator !== 'undefined' &&
    'wakeLock' in navigator &&
    Boolean((navigator as NavigatorWithWakeLock).wakeLock?.request);

  const [enabled, setEnabled] = useState<boolean>(readInitialEnabled);
  const [isActive, setIsActive] = useState<boolean>(false);
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // Ignore storage access errors.
    }
  }, [enabled]);

  useEffect(() => {
    if (!isSupported || !active || !enabled) {
      setIsActive(false);
      const current = sentinelRef.current;
      sentinelRef.current = null;
      if (current && !current.released) {
        void current.release().catch(() => {});
      }
      return;
    }

    let cancelled = false;
    const wakeLockApi = (navigator as NavigatorWithWakeLock).wakeLock;

    const handleSentinelRelease = () => {
      sentinelRef.current = null;
      if (!cancelled) {
        setIsActive(false);
      }
    };

    const requestLock = async () => {
      if (
        cancelled ||
        !wakeLockApi ||
        document.visibilityState === 'hidden' ||
        sentinelRef.current
      ) {
        return;
      }
      try {
        const sentinel = await wakeLockApi.request('screen');
        if (cancelled) {
          void sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener('release', handleSentinelRelease);
        setIsActive(true);
      } catch {
        if (!cancelled) {
          setIsActive(false);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestLock();
      }
    };

    void requestLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      const current = sentinelRef.current;
      sentinelRef.current = null;
      setIsActive(false);
      if (current) {
        current.removeEventListener('release', handleSentinelRelease);
        if (!current.released) {
          void current.release().catch(() => {});
        }
      }
    };
  }, [active, enabled, isSupported]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return { isSupported, isActive, enabled, toggle };
}
