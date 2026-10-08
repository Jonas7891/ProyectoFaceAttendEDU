import { request, GET, POST, DELETE } from '../api/apiClient';
import ENV from '../config/env';

// Biometría web (10-ms-face-auth) tras el gateway Kong: /face-auth/<ruta del servicio>.
// Usa la misma sesión Bearer de FaceAttend; el 401 con { detail } es una respuesta de negocio
// (rostro/huella no reconocidos) y apiClient no lo trata como sesión caducada.
const BASE = () => `${ENV.API_BASE_URL}face-auth/api`;

// Procesar imágenes con dlib es lento: más holgura que el timeout general.
const BIOMETRIC_TIMEOUT_MS = 60000;

const call = (method, path, extra = {}) =>
  request({ method, url: `${BASE()}${path}`, requiresAuth: true, timeoutMs: BIOMETRIC_TIMEOUT_MS, ...extra });

const enc = encodeURIComponent;

export const FaceAuthService = {
  health: () => call(GET, '/health', { timeoutMs: 8000 }),

  // ── Prueba de vida (gestos aleatorios firmados por el backend) ──
  getLivenessChallenge: (actions = 3) => call(GET, '/face/liveness-challenge', { params: { actions } }),
  submitLivenessStep: ({ challengeToken, actionIndex, images }) =>
    call(POST, '/face/liveness-step', {
      data: { challenge_token: challengeToken, action_index: actionIndex, images },
    }),

  // ── Rostro ──
  registerFace: ({ username, image, challengeToken }) =>
    call(POST, '/register/face', { data: { username, image, challenge_token: challengeToken } }),
  loginFace: ({ image, challengeToken }) =>
    call(POST, '/login/face', { data: { image, challenge_token: challengeToken } }),

  // ── Huella ──
  registerFingerprint: ({ username, sampleFormat, data, quality }) =>
    call(POST, '/register/fingerprint-sample', {
      data: { username, sample_format: sampleFormat, data_base64: data, quality },
    }),
  loginFingerprint: ({ sampleFormat, data, quality }) =>
    call(POST, '/login/fingerprint-sample', {
      data: { sample_format: sampleFormat, data_base64: data, quality },
    }),

  // ── Directorio y ciclo de vida ──
  userExists: (username) => call(GET, `/users/${enc(username)}/exists`),
  listUsers: () => call(GET, '/users'),
  listActiveUsers: () => call(GET, '/users/active'),
  revokeTemplate: (username) => call(POST, `/templates/${enc(username)}/revoke`),
  deleteSubject: (username) => call(DELETE, `/subjects/${enc(username)}`),
};
