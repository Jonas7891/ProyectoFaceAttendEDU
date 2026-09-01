export const auths = {
    "admin@example.com": {
        password: "123456",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInN1YiI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiQWRtaW5pc3RyYWRvciJdLCJpYXQiOjE3MzMxMjQ4MDAsImV4cCI6MTg5MzQ1NjAwMH0.nQAHiV1Y_TPrY_R-7XFkYX3K1iV2KgnFAllmEudxCxs"
    },
    "teacher@example.com": {
        password: "123456",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInN1YiI6InRlYWNoZXJAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJEb2NlbnRlIl0sImlhdCI6MTczMzEyNDgwMCwiZXhwIjoxODkzNDU2MDAwfQ.VhRgza0MWDNth3POaGgKojMLcwOORPZBiBPR96gn6uY"
    },
    "student@example.com": {
        password: "123456",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInN1YiI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJFc3R1ZGlhbnRlIl0sImlhdCI6MTczMzEyNDgwMCwiZXhwIjoxODkzNDU2MDAwfQ.XKDCjiwMAIT4AbGZ6MI3Ibyj9uImRL4Ehw9vZG_RsAI"
    }
};

// ============================================================================
// Constantes de la Screen de Contraseña
// ============================================================================

export const MAX_CODE_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 30000; // 30 segundos
export const CODE_EXPIRATION_MS = 600000; // 10 minutos
export const RESEND_COOLDOWN_MS = 60000;  // 1 minuto
export const REQUEST_TIMEOUT_MS = 15000;  // 15 segundos
export const CODE_LENGTH = 6;
export const FOCUS_DELAY_MS = 400;
export const NAVIGATION_DELAY_MS = 1500;

export const VerificationErrorType = {
    INVALID_CODE: 'INVALID_CODE',
    EXPIRED_CODE: 'EXPIRED_CODE',
    NO_CODE: 'NO_CODE',
    TIMEOUT: 'TIMEOUT',
    GENERIC: 'GENERIC',
};

export const PasswordUpdateErrorType = {
    REQUIRED: 'REQUIRED',
    REQUIREMENTS: 'REQUIREMENTS',
    MISMATCH: 'MISMATCH',
    TIMEOUT: 'TIMEOUT',
    GENERIC: 'GENERIC',
};

// ============================================================================
// Contraseñas comunes
// ============================================================================

export const COMMON_PASSWORDS = [
    'password', 'password1', 'password123',
    '12345678', '123456789', '1234567890',
    'qwerty', 'qwerty123', 'qwertyui',
    'iloveyou', 'sunshine', 'princess',
    'football', 'baseball', 'superman',
    'letmein', 'welcome', 'monkey',
    'master', 'dragon', 'login', 'admin',
];

// ============================================================================
// Patrones secuennciales
// ============================================================================

export const SEQUENTIAL_PATTERNS = [
    '123', '234', '345', '456', '567', '678', '789', '890',
    'qwe', 'wer', 'ert', 'asd', 'sdf', 'zxc', 'xcv',
    'abc', 'bcd', 'cde', 'def', 'efg',
];