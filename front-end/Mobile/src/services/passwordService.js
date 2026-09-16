import { request, POST } from '../api/apiClient';
import { PasswordUpdateErrorType } from './constants/auths';
import { VerificationService } from './verificationService';

export class PasswordUpdateError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
    this.name = 'PasswordUpdateError';
  }
}

const MOCK_ENABLED = true;

export const PasswordService = {
  updatePassword: async (email, newPassword) => {
    if (MOCK_ENABLED) {
      await new Promise((r) => setTimeout(r, 600));
      VerificationService.clearCode(email);
      console.log('🔐 CONTRASEÑA ACTUALIZADA (DEV MODE):', email);
      return { message: 'Contraseña actualizada' };
    }

    return request({
      method: POST,
      url: 'auth/reset-password',
      data: { email, password: newPassword },
      requiresAuth: false,
    });
  },
};
