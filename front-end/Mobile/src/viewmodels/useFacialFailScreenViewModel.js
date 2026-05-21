import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../view/components/common/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUserRole } from "../services/UserService";
import { useLanguageRefresh } from '../utils/useLanguageRefresh';

export function useFacialFailViewModel() {
    const navigation = useNavigation();
    const { i18n } = useTranslation();
    const { loadThemeForRole } = useTheme();

    const [userRole, setUserRole] = useState(null);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [showFacialUpdate, setShowFacialUpdate] = useState(false);
    const updateKey = useLanguageRefresh();

    // Inicialización: cargar rol y tema
    useEffect(() => {
        const init = async () => {
            try {
                const role = await getCurrentUserRole();
                setUserRole(role);
                if (role) await loadThemeForRole(role);
            } catch (error) {
                console.error('Error cargando rol:', error);
            }
        };
        init();
    }, [loadThemeForRole]);

    // Navegación
    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    // Modal de cuestionario
    const openQuestionnaire = useCallback(() => setShowQuestionnaire(true), []);
    const closeQuestionnaire = useCallback(() => setShowQuestionnaire(false), []);
    const handleQuestionnaireSuccess = useCallback(() => {
        console.log('Cuestionario completado');
        // Lógica adicional si se necesita (ej. AsyncStorage, navegación)
    }, []);

    // Modal de actualización facial
    const openFacialUpdate = useCallback(() => setShowFacialUpdate(true), []);
    const closeFacialUpdate = useCallback(() => setShowFacialUpdate(false), []);
    const handleFacialUpdateSuccess = useCallback(() => {
        console.log('Parámetros actualizados');
    }, []);

    return {
        userRole,
        updateKey,
        showQuestionnaire,
        showFacialUpdate,
        handleBack,
        openQuestionnaire,
        closeQuestionnaire,
        openFacialUpdate,
        closeFacialUpdate,
        handleQuestionnaireSuccess,
        handleFacialUpdateSuccess,
    };
}