import { request, POST } from '../api/apiClient';
import { VerificationErrorType, CODE_EXPIRATION_MS, REQUEST_TIMEOUT_MS } from './constants/auths';
import { generateRecoveryCode } from '../utils/codeGenerator';

export class VerificationError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
    this.name = 'VerificationError';
  }
}

const MOCK_ENABLED = true;

const devCodeStore = new Map();
const devCodeTimestamps = new Map();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new VerificationError(VerificationErrorType.TIMEOUT, 'La verificación tardó demasiado.')), ms)
    ),
  ]);

export const VerificationService = {
  sendRecoveryCode: async (email) => {
    const normalized = email.toLowerCase().trim();

    if (MOCK_ENABLED) {
      await delay(400);
      const code = generateRecoveryCode();
      devCodeStore.set(normalized, code);
      devCodeTimestamps.set(normalized, Date.now());

      console.log('─────────────────────────────────────');
      console.log('🔑 CÓDIGO DE RECUPERACIÓN (DEV MODE)');
      console.log(`   Email : ${normalized}`);
      console.log(`   Código: ${code}`);
      console.log('─────────────────────────────────────');

      return { message: 'Código enviado' };
    }

    return withTimeout(
      request({ method: POST, url: 'auth/forgot-password', data: { email }, requiresAuth: false }),
      REQUEST_TIMEOUT_MS
    );
  },

  verifyRecoveryCode: async (email, code) => {
    const normalized = email.toLowerCase().trim();

    if (MOCK_ENABLED) {
      await withTimeout(delay(300), REQUEST_TIMEOUT_MS);

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
      return { message: 'Código verificado' };
    }

    return withTimeout(
      request({ method: POST, url: 'auth/verify-code', data: { email, code }, requiresAuth: false }),
      REQUEST_TIMEOUT_MS
    );
  },

  clearCode: (email) => {
    const normalized = email.toLowerCase().trim();
    devCodeStore.delete(normalized);
    devCodeTimestamps.delete(normalized);
  },
};
