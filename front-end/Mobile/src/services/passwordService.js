import { VerificationService } from '../services/verificationService';
import { PasswordUpdateErrorType } from '../services/constants/auths';

/**
 * Clase de error personalizada para actualización de contraseña
 */
export class PasswordUpdateError extends Error {
    constructor(type, message) {
        super(message);
        this.type = type;
        this.name = 'PasswordUpdateError';
    }
}

/**
 * Servicio de actualización de contraseñas
 */
export const PasswordService = {
    /**
     * Actualiza la contraseña del usuario
     * @param {string} email - Email del usuario
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<void>}
     */
    async updatePassword(email, newPassword) {
        await new Promise((r) => setTimeout(r, 600));
        VerificationService.clearCode(email); // ← seguridad: el código ya no sirve
        console.log('🔐 CONTRASEÑA ACTUALIZADA (DEV MODE):', email);
    },
};