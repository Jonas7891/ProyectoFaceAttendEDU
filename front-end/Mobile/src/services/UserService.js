import { request, GET, POST, PUT, DELETE } from '../api/apiClient';
import AppUser from '../models/identity/AppUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENDPOINT = 'app_user';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

function unwrapFirst(data) {
  const arr = unwrap(data);
  return arr.length > 0 ? arr[0] : null;
}

export const UserService = {
  getAll: async (params = {}) => {
    const data = await request({ method: GET, url: ENDPOINT, params, requiresAuth: false });
    return unwrap(data).map(AppUser.fromApi);
  },

  getById: async (id) => {
    const data = await request({ method: GET, url: `${ENDPOINT}/${id}`, requiresAuth: false });
    return AppUser.fromApi(data);
  },

  getByUsername: async (username) => {
    const data = await request({ method: GET, url: ENDPOINT, params: { username }, requiresAuth: false });
    return AppUser.fromApi(unwrapFirst(data));
  },

  create: async (userData) => {
    const data = await request({ method: POST, url: ENDPOINT, data: userData.toApi(), requiresAuth: false });
    return AppUser.fromApi(data);
  },

  update: async (id, userData) => {
    const data = await request({ method: PUT, url: `${ENDPOINT}/${id}`, data: userData.toApi(), requiresAuth: false });
    return AppUser.fromApi(data);
  },

  delete: async (id) => {
    return request({ method: DELETE, url: `${ENDPOINT}/${id}`, requiresAuth: false });
  },
};

export const getCurrentUser = async () => {
  try {
    const role = await AsyncStorage.getItem('userRole');
    const email = await AsyncStorage.getItem('userEmail');
    if (!role && !email) return null;

    const user = await getUserByEmail(email);

    return {
      userId: user?.userId || null,
      email: email,
      roles: role ? [role] : [],
    };
  } catch {
    return null;
  }
};

export const getCurrentUserRole = async () => {
  try {
    const role = await AsyncStorage.getItem('userRole');
    if (!role) return null;
    const { getHighestRole } = require('../utils/getHighestRole');
    return getHighestRole([role]);
  } catch {
    return null;
  }
};

export const getUserByEmail = async (email) => {
  const { request, GET } = require('../api/apiClient');
  const personData = await request({ method: GET, url: 'person', params: { email }, requiresAuth: false });
  const personArr = personData && Array.isArray(personData.value) ? personData.value : Array.isArray(personData) ? personData : [];
  if (personArr.length === 0) return null;
  const person = personArr[0];
  const userData = await request({ method: GET, url: ENDPOINT, params: { person_id: person.person_id }, requiresAuth: false });
  const userArr = userData && Array.isArray(userData.value) ? userData.value : Array.isArray(userData) ? userData : [];
  return userArr.length > 0 ? AppUser.fromApi(userArr[0]) : null;
};

export const hasRole = async (roleName) => {
  const user = await getCurrentUser();
  return user?.roles?.includes(roleName) ?? false;
};

export const isAdmin = async () => {
  return await hasRole('Administrador');
};
