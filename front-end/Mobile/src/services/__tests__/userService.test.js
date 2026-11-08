import AsyncStorage from '@react-native-async-storage/async-storage';
import { request } from '../../api/apiClient';
import { backendGet } from '../../api/backend';
import {
  UserService, USER_PROFILE_KEY, getCurrentUser, getCurrentUserRole, getUserProfileRoles,
  isSuperAdmin, getUserByEmail, hasRole, isAdmin,
} from '../UserService';

jest.mock('../../api/apiClient', () => ({
  request: jest.fn(),
  GET: 'GET', POST: 'POST', PUT: 'PUT', PATCH: 'PATCH', DELETE: 'DELETE',
}));
jest.mock('../../api/backend', () => ({ backendGet: jest.fn() }));

const call = (i = 0) => request.mock.calls[i][0];
const saveProfile = (profile) => AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));

beforeEach(async () => {
  request.mockReset();
  backendGet.mockReset();
  await AsyncStorage.clear();
});

describe('UserService CRUD', () => {
  test('create sends the camelCase CreateUserRequest without empty fields', async () => {
    request.mockResolvedValue({ userId: 'u-1', personId: 'p-1', username: 'ana.ruiz' });
    const user = await UserService.create({ person_id: 'p-1', username: 'ana.ruiz', password: 'Secreta2026*', authentication_type: null });
    expect(call()).toMatchObject({ method: 'POST', url: 'app_user', data: { personId: 'p-1', username: 'ana.ruiz', password: 'Secreta2026*' } });
    expect(call().data).not.toHaveProperty('authenticationType');
    expect(user).toMatchObject({ userId: 'u-1', username: 'ana.ruiz' });
  });

  test('update never sends a password and is authenticated', async () => {
    request.mockResolvedValue({ userId: 'u-1' });
    await UserService.update('u-1', { username: 'ana.r', status: false, password: 'ignored' });
    expect(call()).toMatchObject({ method: 'PUT', url: 'app_user/u-1', requiresAuth: true, data: { username: 'ana.r', status: false } });
    expect(call().data).not.toHaveProperty('password');
  });

  test('lookups, status and delete', async () => {
    request.mockResolvedValueOnce({ value: [{ userId: 'u-1' }, { userId: 'u-2' }] })
      .mockResolvedValueOnce({ userId: 'u-2' })
      .mockResolvedValueOnce([])
      .mockResolvedValue(undefined);
    expect(await UserService.getAll()).toHaveLength(2);
    expect((await UserService.getById('u-2')).userId).toBe('u-2');
    expect(await UserService.getByUsername('nadie')).toBeNull();
    await UserService.setStatus('u-2', true);
    await UserService.delete('u-2');
    expect(call(2)).toMatchObject({ params: { username: 'nadie' } });
    expect(call(3)).toMatchObject({ method: 'PATCH', url: 'app_user/u-2/status', params: { status: true } });
    expect(call(4)).toMatchObject({ method: 'DELETE', url: 'app_user/u-2' });
  });
});

describe('current user', () => {
  test('comes from the stored profile, with the canonical role first', async () => {
    await saveProfile({ userId: 'u-1', personId: 'p-1', email: 'ana@sede.edu.co', name: 'Ana', roles: ['Aprendiz'] });
    await AsyncStorage.setItem('userRole', 'student');

    await expect(getCurrentUser()).resolves.toEqual({
      userId: 'u-1', personId: 'p-1', email: 'ana@sede.edu.co', username: null, name: 'Ana', roles: ['student'],
    });
    await expect(getCurrentUserRole()).resolves.toBe('student');
    await expect(hasRole('student')).resolves.toBe(true);
    await expect(isAdmin()).resolves.toBe(false);
  });

  test('without a role key it keeps the profile roles', async () => {
    await saveProfile({ email: 'ana@sede.edu.co', roles: ['Administrador'] });
    await expect(getCurrentUser()).resolves.toMatchObject({ userId: null, roles: ['Administrador'] });
    await expect(isAdmin()).resolves.toBe(true);
  });

  test('without a profile it resolves the user by the stored email', async () => {
    await AsyncStorage.setItem('userEmail', 'ana@sede.edu.co');
    backendGet
      .mockResolvedValueOnce([{ person_id: 'p-1', email: ' ANA@sede.edu.co ' }])
      .mockResolvedValueOnce([{ user_id: 'u-1', person_id: 'p-1', username: 'ana.ruiz' }]);

    await expect(getCurrentUser()).resolves.toEqual({
      userId: 'u-1', personId: 'p-1', email: 'ana@sede.edu.co', username: 'ana.ruiz', name: null, roles: [],
    });
  });

  test('is null with no session data, an unknown email or a corrupt profile', async () => {
    await expect(getCurrentUser()).resolves.toBeNull();
    await AsyncStorage.setItem('userEmail', 'x@y.co');
    backendGet.mockResolvedValue([]);
    await expect(getCurrentUser()).resolves.toBeNull();
    await AsyncStorage.setItem(USER_PROFILE_KEY, '{broken');
    await expect(getUserProfileRoles()).resolves.toEqual([]);
    await expect(hasRole('student')).resolves.toBe(false);
  });
});

describe('roles', () => {
  test('isSuperAdmin reads the raw backend names in any spacing or case', async () => {
    await saveProfile({ email: 'a@b.co', roles: ['Administrador', ' super  administrador '] });
    await expect(isSuperAdmin()).resolves.toBe(true);
    await saveProfile({ email: 'a@b.co', roles: ['Administrador'] });
    await expect(isSuperAdmin()).resolves.toBe(false);
  });

  test('getUserProfileRoles is empty when the profile has no list', async () => {
    await saveProfile({ email: 'a@b.co', roles: 'Administrador' });
    await expect(getUserProfileRoles()).resolves.toEqual([]);
  });
});

describe('getUserByEmail', () => {
  test('returns null for a blank email without calling the API', async () => {
    await expect(getUserByEmail('  ')).resolves.toBeNull();
    expect(backendGet).not.toHaveBeenCalled();
  });

  test('returns null when the person exists but has no account', async () => {
    backendGet.mockResolvedValueOnce([{ person_id: 'p-1', email: 'ana@sede.edu.co' }]).mockResolvedValueOnce([]);
    await expect(getUserByEmail('ana@sede.edu.co')).resolves.toBeNull();
    expect(backendGet.mock.calls[1][1]).toBe('api/v1/users');
  });
});
