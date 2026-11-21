import { useCallback, useEffect, useState } from 'react';

export const FONT_STEPS = [0.85, 0.95, 1.05, 1.18, 1.32, 1.48, 1.65] as const;
const DEFAULT_STEP = 2;
const STORAGE_KEY = 'cancionero:fontStep';

function clampStep(step: number): number {
  if (!Number.isFinite(step)) {
    return DEFAULT_STEP;
  }
  return Math.min(FONT_STEPS.length - 1, Math.max(0, Math.round(step)));
}

function readInitialStep(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_STEP;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isNaN(parsed)) {
        return clampStep(parsed);
      }
    }
  } catch {
    // Ignore storage access errors.
  }
  return DEFAULT_STEP;
}

/** Manages persistent lyrics font scale steps across songs and sessions. */
export function useFontScale() {
  const [step, setStep] = useState<number>(readInitialStep);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(step));
    } catch {
      // Ignore storage access errors.
    }
  }, [step]);

  const increase = useCallback(() => {
    setStep((prev) => clampStep(prev + 1));
  }, []);

  const decrease = useCallback(() => {
    setStep((prev) => clampStep(prev - 1));
  }, []);

  const reset = useCallback(() => {
    setStep(DEFAULT_STEP);
  }, []);

  return {
    scale: FONT_STEPS[step],
    step,
    increase,
    decrease,
    reset,
    canIncrease: step < FONT_STEPS.length - 1,
    canDecrease: step > 0,
  };
}
