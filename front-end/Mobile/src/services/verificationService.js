// Ruta: .../VerifyCodeScreen/services/verificationService.js
import { CODE_EXPIRATION_MS, REQUEST_TIMEOUT_MS, VerificationErrorType } from './constants/auths';
import { generateRecoveryCode } from '../utils/codeGenerator';

/**
 * Error tipado para verificación
 */
export class VerificationError extends Error {
    constructor(type, message) {
        super(message);
        this.type = type;
        this.name = 'VerificationError';
    }
}

// ── ÚNICO almacén de códigos de toda la app ──
const devCodeStore = new Map();
const devCodeTimestamps = new Map();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, ms) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(
                () => reject(new VerificationError(VerificationErrorType.TIMEOUT, 'La verificación tardó demasiado.')),
                ms
            )
        ),
    ]);

export const VerificationService = {
    /**
     * Genera, almacena y loguea un código.
     * Lo usan: ForgotPasswordScreen (envío) y el botón "Reenviar".
     */
    sendRecoveryCode(email) {
        const normalized = email.toLowerCase().trim();
        const code = generateRecoveryCode();

        devCodeStore.set(normalized, code);
        devCodeTimestamps.set(normalized, Date.now()); // ← el servicio es dueño del tiempo

        console.log('─────────────────────────────────────');
        console.log('🔑 CÓDIGO DE RECUPERACIÓN (DEV MODE)');
        console.log(`   Email : ${normalized}`);
        console.log(`   Código: ${code}`);
        console.log('─────────────────────────────────────');

        return code;
    },

    /**
     * Verifica el código contra el MISMO almacén donde se guardó.
     */
    async verifyRecoveryCode(email, code) {
        const normalized = email.toLowerCase().trim();

        await withTimeout(delay(500), REQUEST_TIMEOUT_MS);

        const expected = devCodeStore.get(normalized);
        const generatedAt = devCodeTimestamps.get(normalized);

        if (!expected || !generatedAt) {
            throw new VerificationError(VerificationErrorType.NO_CODE, 'No hay un código activo. Solicita uno nuevo.');
        }

        if (Date.now() - generatedAt > CODE_EXPIRATION_MS) {
            devCodeStore.delete(normalized);
            devCodeTimestamps.delete(normalized);
            throw new VerificationError(VerificationErrorType.EXPIRED_CODE, 'El código ha expirado. Solicita uno nuevo.');
        }

        if (code.toUpperCase() !== expected) {
            throw new VerificationError(VerificationErrorType.INVALID_CODE, 'Código incorrecto.');
        }

        console.log('✅ Código verificado correctamente para:', normalized);
    },

    /**
     * Limpia el código tras actualizar la contraseña con éxito.
     */
    clearCode(email) {
        const normalized = email.toLowerCase().trim();
        devCodeStore.delete(normalized);
        devCodeTimestamps.delete(normalized);
    },
};