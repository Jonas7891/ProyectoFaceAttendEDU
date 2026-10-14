import type { PermissionRule } from './authGuard';

const BIOMETRIC_CASE_PATH = /^\/api\/v1\/(biometric-update-cases|persons\/[^/]+\/biometric-cases)/;
const SECURITY_PATH = /^\/api\/v1\/(configurations\/security|security-configurations)/;

export const configurationPermission: PermissionRule = (method, path) => {
  if (path.startsWith('/api/v1/quality')) return 'configuration:manage';
  if (BIOMETRIC_CASE_PATH.test(path)) {
    return method === 'GET' || method === 'POST' ? 'biometric.case:request' : 'biometric.case:review';
  }
  if (SECURITY_PATH.test(path)) return 'configuration:manage';
  return method === 'GET' ? null : 'configuration:manage';
};
