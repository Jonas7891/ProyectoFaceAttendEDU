// viewmodels/useProfileViewModel.js
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { saveLanguageForRole } from '../view/components/common/languageByRole';
import { useTheme } from '../view/components/common/ThemeContext';
import { getUserByEmail } from "../services/UserService";        // tu servicio de usuario
import { getToken } from "../storage/TokenStorage";   // tu storage de token
import UserResponse from "../model/AuthResponse";     // tu modelo de response

export function useProfileViewModel() {

    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme, loadThemeForRole } = useTheme();

    const [userRole, setUserRole] = useState(null);
    const [updateKey, setUpdateKey] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        role: '',
        joinDate: '',
        colegio: '',
        employeeId: '',
    });

    // Refrescar al cambiar idioma
    useEffect(() => {
        const handleLanguageChanged = () => setUpdateKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChanged);
        return () => i18n.off('languageChanged', handleLanguageChanged);
    }, [i18n]);

    // Cargar datos del usuario al recibir foco
    useFocusEffect(
        useCallback(() => {
            const loadUserData = async () => {
                try {
                    const email = await AsyncStorage.getItem('userEmail');
                    setUserInfo(getUserByEmail(email));

                    if (getUserByEmail(email).role) {
                        await loadThemeForRole(getUserByEmail(email).role);
                    }
                } catch (error) {
                    console.error('Error cargando datos de usuario:', error);
                }
            };
            loadUserData();
        }, [loadThemeForRole])
    );

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const handleLogout = useCallback(() => {
        Alert.alert(
            t('profile.logout'),
            t('profile.logoutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.accept'),
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            if (userRole) {
                                await saveLanguageForRole(userRole, i18n.language);
                            }
                            await AsyncStorage.removeItem('userRole');
                            navigation.navigate('HomesScreen');
                        } catch (error) {
                            console.error('Error en logout:', error);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    }, [userRole, i18n.language, navigation, t]);

    return {
        userRole,
        userInfo,
        updateKey,
        isLoading,
        handleBack,
        handleLogout,
        toggleTheme,
    };
}