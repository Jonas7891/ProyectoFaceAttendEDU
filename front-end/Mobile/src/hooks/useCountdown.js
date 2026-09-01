import { useState, useEffect, useRef, useCallback } from 'react';

export function useCountdown(initialSeconds = 0) {
    const [remaining, setRemaining] = useState(initialSeconds);
    const timerRef = useRef(null);

    useEffect(() => {
        if (remaining <= 0) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [remaining]);

    const start = useCallback((seconds) => {
        setRemaining(seconds);
    }, []);

    const reset = useCallback(() => {
        setRemaining(0);
    }, []);

    return {
        remaining,
        isActive: remaining > 0,
        start,
        reset,
    };
}