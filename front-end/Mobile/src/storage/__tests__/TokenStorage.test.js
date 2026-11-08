import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// In-memory keystore: the native module does not exist under Jest.
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    __store: store,
    getItemAsync: jest.fn(async (k) => (store.has(k) ? store.get(k) : null)),
    setItemAsync: jest.fn(async (k, v) => { store.set(k, v); }),
    removeItemAsync: jest.fn(async (k) => { store.delete(k); }),
  };
});

const KEY = 'auth_token';
const jwt = (payload) => {
  const part = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${part({ alg: 'none' })}.${part(payload)}.sig`;
};

let warn;
beforeEach(async () => {
  SecureStore.__store.clear();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

function load(os) {
  let mod;
  jest.isolateModules(() => {
    jest.doMock('react-native', () => ({ Platform: { OS: os } }));
    mod = require('../TokenStorage');
  });
  return mod;
}

describe('on a phone (keystore)', () => {
  const storage = () => load('android');

  test('an opaque session id is saved in the keystore with the shared shape', async () => {
    const { saveToken, getToken, getSession, hasValidToken } = storage();
    await expect(saveToken('6f1c0f4e-uuid', 'ana@sede.edu.co')).resolves.toBe(true);

    expect(await AsyncStorage.getItem(KEY)).toBeNull();
    expect(JSON.parse(SecureStore.__store.get(KEY))).toMatchObject({ token: '6f1c0f4e-uuid', expiresAt: null, email: 'ana@sede.edu.co' });
    await expect(getToken()).resolves.toBe('6f1c0f4e-uuid');
    await expect(getSession()).resolves.toMatchObject({ email: 'ana@sede.edu.co' });
    await expect(hasValidToken()).resolves.toBe(true);
  });

  test('a session saved in AsyncStorage before the keystore is migrated on read', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify({ token: 'legacy', expiresAt: null }));
    const { getToken } = storage();

    await expect(getToken()).resolves.toBe('legacy');
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
    expect(SecureStore.__store.has(KEY)).toBe(true);
  });

  test('removeToken clears both stores', async () => {
    const { saveToken, removeToken, getToken } = storage();
    await saveToken('abc');
    await AsyncStorage.setItem(KEY, 'stale');

    await expect(removeToken()).resolves.toBe(true);
    await expect(getToken()).resolves.toBeNull();
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });

  test('removeToken reports false when the keystore fails', async () => {
    const { removeToken } = storage();
    SecureStore.removeItemAsync.mockRejectedValueOnce(new Error('locked'));
    await expect(removeToken()).resolves.toBe(false);
  });
});

describe('token rules', () => {
  const storage = () => load('android');

  test('rejects empty or non-string tokens', async () => {
    const { saveToken } = storage();
    await expect(saveToken('')).resolves.toBe(false);
    await expect(saveToken(42)).resolves.toBe(false);
    expect(SecureStore.__store.size).toBe(0);
  });

  test('a JWT keeps its expiry, and an expired one is refused', async () => {
    const { saveToken, getSession } = storage();
    const exp = Math.floor(Date.now() / 1000) + 3600;
    await expect(saveToken(jwt({ exp }))).resolves.toBe(true);
    expect((await getSession()).expiresAt).toBe(exp * 1000);

    await expect(saveToken(jwt({ exp: 1 }))).resolves.toBe(false);
  });

  test('an unreadable JWT-shaped token is still saved, without expiry', async () => {
    const { saveToken, getSession } = storage();
    await expect(saveToken('not.a.jwt')).resolves.toBe(true);
    expect((await getSession()).expiresAt).toBeNull();
  });

  test('an expired saved session is removed on read', async () => {
    SecureStore.__store.set(KEY, JSON.stringify({ token: 'old', expiresAt: Date.now() - 1000 }));
    const { getToken, hasValidToken } = storage();
    await expect(getToken()).resolves.toBeNull();
    expect(SecureStore.__store.has(KEY)).toBe(false);
    await expect(hasValidToken()).resolves.toBe(false);
  });

  test('corrupt or tokenless payloads read as no session', async () => {
    const { getToken, getSession } = storage();
    SecureStore.__store.set(KEY, '{not json');
    await expect(getToken()).resolves.toBeNull();
    await expect(getSession()).resolves.toBeNull();
    SecureStore.__store.set(KEY, JSON.stringify({ email: 'x' }));
    await expect(getToken()).resolves.toBeNull();
    await expect(getSession()).resolves.toBeNull();
  });
});

describe('on the web (no keystore)', () => {
  test('the session lives in AsyncStorage under the same key', async () => {
    const { saveToken, getToken, removeToken } = load('web');
    await saveToken('web-session');

    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(JSON.parse(await AsyncStorage.getItem(KEY)).token).toBe('web-session');
    await expect(getToken()).resolves.toBe('web-session');
    await removeToken();
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });
});
