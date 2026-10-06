// ============================================================
//  useSessionTimeout — Hook para gestión automática de timeout de sesión
// ============================================================
//
//  Este hook:
//  ✓ Monitorea la actividad del usuario (movimiento del mouse, teclas, toques)
//  ✓ Reinicia el contador cuando detecta actividad
//  ✓ Ejecuta logout automático cuando se cumple el tiempo configurado
//  ✓ Proporciona tiempo restante para mostrar advertencias
//
//  Uso:
//    const { timeRemaining, isWarning, resetTimer } = useSessionTimeout({
//        timeoutMinutes: 60,
//        onTimeout: logout,
//        warningMinutes: 5
//    });
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';

export function useSessionTimeout({
    timeoutMinutes = 60,
    onTimeout,
    warningMinutes = 5,
    enabled = true
}) {
    const [timeRemaining, setTimeRemaining] = useState(() => timeoutMinutes * 60);
    const [isWarning, setIsWarning] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    
    const intervalRef = useRef(null);
    const lastActivityRef = useRef(() => Date.now());
    const onTimeoutRef = useRef(onTimeout);
    
    // Mantener la referencia actualizada
    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    // Función para resetear el timer de inactividad
    const resetTimer = useCallback(() => {
        if (!enabled) return;
        
        lastActivityRef.current = Date.now();
        setTimeRemaining(timeoutMinutes * 60);
        setIsWarning(false);
        setIsExpired(false);
    }, [enabled, timeoutMinutes]);

    // Función para registrar actividad del usuario
    const handleActivity = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    // Configurar listeners de actividad
    useEffect(() => {
        if (!enabled) return;

        const events = Platform.OS === 'web' 
            ? ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
            : ['touchstart', 'touchmove'];

        const throttledHandler = throttle(handleActivity, 1000); // Throttle a 1 segundo

        events.forEach(event => {
            if (Platform.OS === 'web') {
                document.addEventListener(event, throttledHandler, true);
            }
        });

        return () => {
            events.forEach(event => {
                if (Platform.OS === 'web') {
                    document.removeEventListener(event, throttledHandler, true);
                }
            });
        };
    }, [handleActivity, enabled]);

    // Timer principal que actualiza el tiempo restante
    useEffect(() => {
        if (!enabled) return;

        // Inicializar lastActivityRef si es necesario
        if (typeof lastActivityRef.current === 'function') {
            lastActivityRef.current = lastActivityRef.current();
        }

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastActivityRef.current;
            const timeoutMs = timeoutMinutes * 60 * 1000;
            const remaining = Math.max(0, timeoutMs - elapsed);
            const remainingSeconds = Math.ceil(remaining / 1000);

            setTimeRemaining(remainingSeconds);

            // Verificar si estamos en periodo de advertencia
            const warningThreshold = warningMinutes * 60;
            const isInWarning = remainingSeconds <= warningThreshold && remainingSeconds > 0;
            setIsWarning(isInWarning);

            // Verificar si la sesión ha expirado
            if (remainingSeconds <= 0) {
                setIsExpired(true);
                if (onTimeoutRef.current) {
                    onTimeoutRef.current();
                }
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, warningMinutes, timeoutMinutes]);

    // Función para formatear el tiempo restante
    const formatTimeRemaining = useCallback(() => {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [timeRemaining]);

    return {
        timeRemaining,
        timeRemainingFormatted: formatTimeRemaining(),
        isWarning,
        isExpired,
        resetTimer,
        handleActivity
    };
}

// Función helper para throttling
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}