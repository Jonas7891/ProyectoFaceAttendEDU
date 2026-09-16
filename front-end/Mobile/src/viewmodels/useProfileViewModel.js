import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {saveLanguageForRole} from '../view/components/common/languageByRole';
import {useTheme} from '../view/components/common/ThemeContext';
import {getCurrentUser, getUserByEmail} from "../services/UserService";
import {useLanguageRefresh} from '../utils/useLanguageRefresh';

export function useProfileViewModel() {
    const navigation = useNavigation();
    const {t, i18n} = useTranslation();
    const {theme, toggleTheme, loadThemeForRole} = useTheme();

    const [userRole, setUserRole] = useState(null);
    const updateKey = useLanguageRefresh();
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        role: '',
        joinDate: '',
        colegio: '',
        employeeId: '',
    });

    // Cargar datos del usuario al recibir foco
    useFocusEffect(
        useCallback(() => {
            const loadUserData = async () => {
                try {
                    const userInfo = await getCurrentUser();
                    const email = userInfo?.email;
                    const user = await getUserByEmail(email);
                    setUserInfo(user ? {
                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '',
                        email: user.email || email || '',
                        role: userRole || '',
                        joinDate: user.createdAt || '',
                        colegio: '',
                        employeeId: user.userId || '',
                    } : {
                        name: '',
                        email: email || '',
                        role: userRole || '',
                        joinDate: '',
                        colegio: '',
                        employeeId: '',
                    });

                    if (user && user.role) {
                        await loadThemeForRole(user.role);
                    }
                } catch (error) {
                    console.error('Error cargando datos de usuario:', error);
                }
            };
            loadUserData();
        }, [loadThemeForRole])
    );

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    // Acción real de cerrar sesión (sin confirmación)
    const performLogout = useCallback(async () => {
        setIsLoading(true);
        try {
            if (userRole) {
                await saveLanguageForRole(userRole, i18n.language);
            }
            await AsyncStorage.removeItem('userRole');
            navigation.navigate('HomesScreen');
        } catch (error) {
            console.error('Error en logout:', error);
            throw error; // La pantalla mostrará el error con CustomAlert
        } finally {
            setIsLoading(false);
        }
    }, [userRole, i18n.language, navigation]);

    return {
        userRole,
        userInfo,
        updateKey,
        isLoading,
        handleBack,
        performLogout,
        toggleTheme,
        courses: [],
        attendanceStats: null,
        justifications: [],
        iotDevices: [],
        teacherSchedules: [],
        teacherCourseStats: [],
        schoolInfo: null,
    };
}