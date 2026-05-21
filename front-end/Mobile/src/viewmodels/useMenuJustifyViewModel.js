import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { saveLanguageForRole } from '../view/components/common/languageByRole';
import { getCurrentUserRole, getCurrentUser } from "../services/UserService";
import { useLanguageRefresh } from '../utils/useLanguageRefresh';

export function useMenuJustifyViewModel() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();

    const [userRole, setUserRole] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const updateKey = useLanguageRefresh(); // para refrescar al cambiar idioma

    // Cargar rol y pendientes al enfocar la pantalla (primera vez y cada vez que se navega a ella)
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const role = await getCurrentUserRole();
                    const finalRole = role || 'Estudiante';
                    setUserRole(finalRole);
                    await saveLanguageForRole(finalRole);

                    const pendingData = await AsyncStorage.getItem('pendingJustifications');
                    if (pendingData) {
                        const pendings = JSON.parse(pendingData);
                        setPendingCount(pendings.filter(j => j.status === 'pending').length);
                    }
                } catch (error) {
                    console.error('Error loading data:', error);
                    setUserRole('Estudiante');
                }
            };
            loadData();
        }, [])
    );


    // Navegación
    const handleBack = useCallback(() => navigation.goBack(), [navigation]);
    const handleConsultJustify = useCallback(() => navigation.navigate('ConsultJustify'), [navigation]);
    const handleValidJustifications = useCallback(() => navigation.navigate('ValidJustifications'), [navigation]);

    const handleAddOrEditJustify = useCallback(() => {
        const screenName = userRole === 'Estudiante' ? 'AddJustification' : 'AddValidJustification';
        navigation.navigate(screenName);
    }, [navigation, userRole]);

    return {
        userRole,
        pendingCount,
        updateKey,
        handleBack,
        handleConsultJustify,
        handleAddOrEditJustify,
        handleValidJustifications,
    };
}