import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {saveLanguageForRole} from '../view/components/common/languageByRole';
import {useTheme} from '../view/components/common/ThemeContext';
import {getCurrentUserRole, getCurrentUser} from "../services/UserService";
import {ActorService} from '../services/ActorService';
import {SchoolService} from '../services/SchoolService';
import {backendGet} from '../api/backend';
import ENV from '../config/env';
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
        phone: '',
        role: '',
        joinDate: '',
        school: '',
        employeeId: '',
    });

    // Cargar datos del usuario al recibir foco:
    // persona (nombre/teléfono) -> actor académico -> colegio.
    useFocusEffect(
        useCallback(() => {
            const loadUserData = async () => {
                try {
                    const current = await getCurrentUser();
                    const role = await getCurrentUserRole();
                    if (role) {
                        setUserRole(role);
                        await loadThemeForRole(role);
                    }

                    let person = null;
                    if (current?.personId) {
                        try {
                            const arr = await backendGet(ENV.API_BASE_URL, `api/v1/persons/${current.personId}`);
                            person = arr[0] || null;
                        } catch {}
                    }

                    let schoolName = '';
                    let actorCode = '';
                    if (person?.person_id) {
                        try {
                            const actors = await ActorService.getByPerson(person.person_id);
                            const actor = actors?.[0] || null;
                            actorCode = actor?.actorCode || '';
                            if (actor?.schoolId) {
                                const school = await SchoolService.getById(actor.schoolId);
                                schoolName = school?.name || '';
                            }
                        } catch {}
                    }

                    setUserInfo({
                        name: `${person?.name || ''} ${person?.last_name || ''}`.trim() || current?.username || current?.name || '',
                        email: person?.email || current?.email || '',
                        phone: person?.phone || '',
                        role: role || '',
                        joinDate: '',
                        school: schoolName,
                        employeeId: person?.document_number || '',
                        actorCode,
                    });
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