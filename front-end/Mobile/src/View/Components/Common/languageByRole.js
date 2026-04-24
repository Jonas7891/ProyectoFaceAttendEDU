import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../../utils/i18n';

const LANGUAGE_KEY = (role) => `language_${role}`;

export const saveLanguageForRole = async (role) => {
    if (!role) return;
    await AsyncStorage.setItem(LANGUAGE_KEY(role), i18n.language);
};

export const restoreLanguageForRole = async (role, fallback = 'es') => {
    if (!role) return;
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY(role));
    const languageToUse = savedLanguage ?? fallback;
    if (i18n.language !== languageToUse) {
        await i18n.changeLanguage(languageToUse);
    }
};