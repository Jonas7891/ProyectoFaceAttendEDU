// viewmodels/useMenuViewModel.js
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../view/components/common/ThemeContext';
import { getHighestRole } from '../utils/getHighestRole'; // tu función de jerarquía
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export function useMenuViewModel({ onLogout }) {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, loadThemeForRole } = useTheme();

    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [updateKey, setUpdateKey] = useState(0); // para forzar re-render cuando cambie el rol/idioma

    // Carga el rol del usuario y aplica tema/idioma
    const loadUserData = useCallback(async () => {
        try {
            let roleData = await AsyncStorage.getItem('userRole');

            // Si por alguna razón guardaste un array de roles (como JSON), aplica jerarquía
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
                    // Es un string simple
                    finalRole = roleData;
                }
            }

            setUserRole(finalRole);

            if (finalRole) {
                await loadThemeForRole(finalRole);
            }

            // Sincroniza idioma guardado
            const savedLang = await AsyncStorage.getItem('appLanguage');
            if (savedLang && savedLang !== i18n.language) {
                await i18n.changeLanguage(savedLang);
            }

            setUpdateKey(prev => prev + 1);
        } catch (error) {
            console.error('Error en loadUserData:', error);
        }
    }, [loadThemeForRole, i18n]);

    // Carga inicial
    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    // Recarga cuando la pantalla gana el foco
    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [loadUserData])
    );

    // Logout
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
            Alert.alert(t('common.error'), t('menu.logoutError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Helpers de navegación
    const navigateTo = (screen) => navigation.navigate(screen);

    // Determina si es admin (ajusta el string según tu jerarquía exacta)
    const isAdmin = userRole === 'Administrador';

    return {
        isLoading,
        userRole,
        isAdmin,
        updateKey,
        handleLogout,
        navigateTo,
        loadUserData,
        colors, // opcional: la vista puede seguir usando useTheme si quiere
    };
}