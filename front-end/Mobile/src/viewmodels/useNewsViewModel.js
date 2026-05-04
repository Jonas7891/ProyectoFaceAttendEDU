// viewmodels/useNewsViewModel.js
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../view/components/common/ThemeContext';

export function useNewsViewModel() {
    const { i18n } = useTranslation();
    const { loadThemeForRole } = useTheme();

    const [userRole, setUserRole] = useState(null);
    const [updateKey, setUpdateKey] = useState(0); // para refrescar al cambiar idioma

    useEffect(() => {
        const init = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                setUserRole(role);
                if (role) {
                    await loadThemeForRole(role);
                }
            } catch (error) {
                console.error('Error inicializando NewsScreen:', error);
            }
        };
        init();

        const handleLanguageChanged = (lng) => {
            setUpdateKey(prev => prev + 1);
        };

        i18n.on('languageChanged', handleLanguageChanged);
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [loadThemeForRole, i18n]);

    return {
        userRole,
        updateKey,
    };
}