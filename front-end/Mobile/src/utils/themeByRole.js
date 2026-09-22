import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = (role) => `theme_${role}`;

/** Guarda el tema actual vinculado al rol */
export const saveThemeForRole = async (role, theme) => {
    if (!role) return;
    await AsyncStorage.setItem(THEME_KEY(role), theme);
};

export const getThemeForRole = async (role, fallback = 'light') => {
    if (!role) return fallback;
    try {
        const saved = await AsyncStorage.getItem(THEME_KEY(role));
        return saved ?? fallback;
    } catch {
        return fallback;
    }
};