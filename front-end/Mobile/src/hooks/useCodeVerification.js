import { useState, useCallback } from 'react';
import { MAX_CODE_ATTEMPTS, LOCKOUT_DURATION_MS, VerificationErrorType } from '../services/constants/auths';
import { VerificationService, VerificationError } from '../services/verificationService';

export function useCodeVerification({ email, onSuccess }) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(0);

    const isLockedOut = lockoutUntil > Date.now();
    const lockoutRemaining = isLockedOut ? Math.ceil((lockoutUntil - Date.now()) / 1000) : 0;

    const isComplete = code.replace(/ /g, '').length === 6;
    const canSubmit = isComplete && !isLoading && !isLockedOut;

    const verifyCode = useCallback(async () => {
        if (!canSubmit) {
            console.log('[verifyCode] Bloqueado → canSubmit:', canSubmit, '| code:', JSON.stringify(code));
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const trimmed = code.replace(/ /g, '').toUpperCase();
            await VerificationService.verifyRecoveryCode(email, trimmed);
            onSuccess(); // ← abre el modal de nueva contraseña
        } catch (err) {
            console.log('[verifyCode] Error capturado:', err?.type ?? err?.message);

            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            // ✅ instanceof contra la CLASE correcta
            if (err instanceof VerificationError && err.type === VerificationErrorType.INVALID_CODE) {
                if (newAttempts >= MAX_CODE_ATTEMPTS) {
                    setLockoutUntil(Date.now() + LOCKOUT_DURATION_MS);
                    setError({ type: err.type, message: 'Demasiados intentos fallidos. Espera 30 segundos.' });
                } else {
                    setError({
                        type: err.type,
                        message: `Código incorrecto. Intentos restantes: ${MAX_CODE_ATTEMPTS - newAttempts}`,
                    });
                }
            } else if (err instanceof VerificationError) {
                setError({ type: err.type, message: err.message });
            } else {
                setError({ type: VerificationErrorType.GENERIC, message: err?.message ?? 'Ocurrió un error.' });
            }
        } finally {
            setIsLoading(false);
        }
    }, [code, email, attempts, canSubmit, onSuccess]);

    const resetAttempts = useCallback(() => {
        setAttempts(0);
        setLockoutUntil(0);
        setCode('');
        setError(null);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        code, setCode, isLoading, error, attempts,
        isLockedOut, lockoutRemaining, canSubmit,
        verifyCode, resetAttempts, clearError,
    };
}