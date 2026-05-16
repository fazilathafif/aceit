import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(
  totalSeconds: number,
  onExpire: () => void,
  autoStart = true
) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(autoStart);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setTimeLeft(totalSeconds);
    setRunning(autoStart);
  }, [totalSeconds, autoStart]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      onExpireRef.current();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, running]);

  const stop = useCallback(() => setRunning(false), []);
  const reset = useCallback(
    (s = totalSeconds) => {
      setTimeLeft(s);
      setRunning(autoStart);
    },
    [totalSeconds, autoStart]
  );

  const pct = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const urgent = timeLeft <= 15;

  return { timeLeft, pct, urgent, stop, reset };
}
