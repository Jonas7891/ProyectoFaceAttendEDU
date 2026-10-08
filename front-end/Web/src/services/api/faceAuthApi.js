// Biometría web (10-ms-face-auth, FastAPI). Rostro con prueba de vida y huella DigitalPersona.
// Se consume por el gateway Kong: /face-auth/* -> face-auth-api:8000/* (strip_path), con la
// misma sesión Bearer de FaceAttend. Mismo código en local y en remoto: solo cambia
// EXPO_PUBLIC_API_URL.
import { request } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";

// Registro/verificación procesan imágenes con dlib: más holgura que el timeout general.
const BIOMETRIC_TIMEOUT_MS = 60000;

const call = (path, opts = {}) =>
    request(path, { businessUnauthorized: true, timeoutMs: BIOMETRIC_TIMEOUT_MS, ...opts });

const enc = encodeURIComponent;

export const faceAuthApi = {
    health: () => call(endpoints.faceAuth.health, { method: "GET", timeoutMs: 8000 }),

    // ── Prueba de vida (gestos aleatorios firmados por el backend) ──
    livenessChallenge: (actions = 3) =>
        call(endpoints.faceAuth.livenessChallenge, { method: "GET", query: { actions } }),
    livenessStep: ({ challengeToken, actionIndex, images }) =>
        call(endpoints.faceAuth.livenessStep, {
            method: "POST",
            body: { challenge_token: challengeToken, action_index: actionIndex, images },
        }),

    // ── Rostro ──
    registerFace: ({ username, image, challengeToken }) =>
        call(endpoints.faceAuth.registerFace, {
            method: "POST",
            body: { username, image, challenge_token: challengeToken },
        }),
    loginFace: ({ image, challengeToken }) =>
        call(endpoints.faceAuth.loginFace, {
            method: "POST",
            body: { image, challenge_token: challengeToken },
        }),

    // ── Huella ──
    registerFingerprint: ({ username, sampleFormat, data, quality }) =>
        call(endpoints.faceAuth.registerFingerprint, {
            method: "POST",
            body: { username, sample_format: sampleFormat, data_base64: data, quality },
        }),
    loginFingerprint: ({ sampleFormat, data, quality }) =>
        call(endpoints.faceAuth.loginFingerprint, {
            method: "POST",
            body: { sample_format: sampleFormat, data_base64: data, quality },
        }),

    // ── Directorio y ciclo de vida ──
    userExists: (username) => call(endpoints.faceAuth.userExists(enc(username)), { method: "GET" }),
    listUsers: () => call(endpoints.faceAuth.users, { method: "GET" }),
    listActiveUsers: () => call(endpoints.faceAuth.activeUsers, { method: "GET" }),
    revokeTemplate: (username) =>
        call(endpoints.faceAuth.revokeTemplate(enc(username)), { method: "POST" }),
    deleteSubject: (username) =>
        call(endpoints.faceAuth.subject(enc(username)), { method: "DELETE" }),
};
