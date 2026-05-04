// viewmodels/useMenuJustifyViewModel.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { saveLanguageForRole } from '../view/components/common/languageByRole';

export function useMenuJustifyViewModel() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();

    const [userRole, setUserRole] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [updateKey, setUpdateKey] = useState(0); // para refrescar al cambiar idioma

    // Cargar rol y pendientes iniciales
    useEffect(() => {
        const init = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                const finalRole = role || 'Estudiante';
                setUserRole(finalRole);
                await saveLanguageForRole(finalRole);

                const pendingData = await AsyncStorage.getItem('pendingJustifications');
                if (pendingData) {
                    const pendings = JSON.parse(pendingData);
                    setPendingCount(pendings.filter(j => j.status === 'pending').length);
                }
            } catch {
                setUserRole('Estudiante');
            }
        };
        init();
    }, []);

    // Recargar pendientes al enfocar la pantalla
    useFocusEffect(
        useCallback(() => {
            const loadPending = async () => {
                try {
                    const pendingData = await AsyncStorage.getItem('pendingJustifications');
                    if (pendingData) {
                        const pendings = JSON.parse(pendingData);
                        setPendingCount(pendings.filter(j => j.status === 'pending').length);
                    }
                } catch (error) {
                    console.error('Error loading pending count:', error);
                }
            };
            loadPending();
        }, [])
    );

    // Refrescar vista al cambiar idioma
    useEffect(() => {
        const handleLanguageChange = () => setUpdateKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

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