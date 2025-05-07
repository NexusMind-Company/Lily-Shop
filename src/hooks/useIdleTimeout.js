import { useEffect, useState, useCallback, useRef } from 'react';

const useIdleTimeout = (onIdle, timeoutDuration = 15 * 60 * 1000) => { // Default 15 minutes
  const [isIdle, setIsIdle] = useState(false);
  const timeoutIdRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    setIsIdle(false);
    timeoutIdRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, timeoutDuration);
  }, [onIdle, timeoutDuration]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer(); // Initialize timer

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);

  return isIdle;
};

export default useIdleTimeout; 