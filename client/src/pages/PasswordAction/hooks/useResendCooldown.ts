
import { useCallback, useEffect, useRef, useState } from "react";

export const useResendCooldown = (durationSeconds = 60) => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();

    const duration = Math.max(0, Math.ceil(durationSeconds));
    deadlineRef.current = Date.now() + duration * 1000;
    setSecondsLeft(duration);

    if (duration === 0) {
      deadlineRef.current = null;
      return;
    }

    intervalRef.current = setInterval(() => {
      const deadline = deadlineRef.current;

      if (deadline === null) {
        clearTimer();
        setSecondsLeft(0);
        return;
      }

      const remaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000)
      );

      setSecondsLeft(remaining);

      if (remaining === 0) {
        clearTimer();
        deadlineRef.current = null;
      }
    }, 250);
  }, [durationSeconds, clearTimer]);

  return {
    secondsLeft,
    isActive: secondsLeft > 0,
    start,
  };
};
