// viewmodels/useMenuViewModel.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../view/components/common/ThemeContext';
import { getHighestRole } from '../utils/getHighestRole';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export function useMenuViewModel({ onLogout }) {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, loadThemeForRole } = useTheme();

    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [updateKey, setUpdateKey] = useState(0);

    const loadUserData = useCallback(async () => {
        try {
            let roleData = await AsyncStorage.getItem('userRole');

            let finalRole = null;
            if (roleData) {
                try {
                    const parsed = JSON.parse(roleData);
                    if (Array.isArray(parsed)) {
                        finalRole = getHighestRole(parsed);
                    } else {
                        finalRole = roleData;
                    }
                } catch {
                    finalRole = roleData;
                }
            }

            setUserRole(finalRole);

            if (finalRole) {
                await loadThemeForRole(finalRole);
            }

            const savedLang = await AsyncStorage.getItem('appLanguage');
            if (savedLang && savedLang !== i18n.language) {
                await i18n.changeLanguage(savedLang);
            }

            setUpdateKey(prev => prev + 1);
        } catch (error) {
            console.error('Error en loadUserData:', error);
        }
    }, [loadThemeForRole, i18n]);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [loadUserData])
    );

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.clear();
            await i18n.changeLanguage('es'); // idioma por defecto

            if (onLogout) {
                await onLogout();
            }
        } catch (error) {
            console.error('Error en logout:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const navigateTo = (screen) => navigation.navigate(screen);

    const isAdmin = userRole === 'Administrador';

    return {
        isLoading,
        userRole,
        isAdmin,
        updateKey,
        handleLogout,
        navigateTo,
        loadUserData,
        colors,
    };
}