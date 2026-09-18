import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../view/components/common/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {getCurrentUserRole} from "../services/UserService";
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {useCustomAlert} from '../view/components/common/useCustomAlert';

export function useFacialFailViewModel() {
    const navigation = useNavigation();
    const {i18n, t} = useTranslation();
    const {loadThemeForRole} = useTheme();
    const {alertConfig, hideAlert, showSuccess} = useCustomAlert();

    const [userRole, setUserRole] = useState(null);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [showFacialUpdate, setShowFacialUpdate] = useState(false);
    const [formData, setFormData] = useState(null);
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
    const handleQuestionnaireSuccess = useCallback((data) => {
        // Guardar datos y mostrar alerta con la información
        setFormData(data);
        const message =
            `${t('questionnaire.document')}: ${data.documentType}\n` +
            `${t('questionnaire.number')}: ${data.documentNumber}\n` +
            `${t('questionnaire.rhType')}: ${data.rhType}\n` +
            `${t('questionnaire.relativeDocument')}: ${data.relativeDocument}\n` +
            `${t('questionnaire.birthDate')}: ${data.birthDate}\n` +
            `${t('questionnaire.address')}: ${data.address}\n` +
            `${t('questionnaire.phone')}: ${data.phone}`;

        showSuccess(
            t('facialFail.success'),
            message,
            () => {
                console.log('Cuestionario completado');
            }
        );
    }, [showSuccess, t]);

    // Modal de actualización facial
    const openFacialUpdate = useCallback(() => setShowFacialUpdate(true), []);
    const closeFacialUpdate = useCallback(() => setShowFacialUpdate(false), []);
    const handleFacialUpdateSuccess = useCallback((data) => {
        // Guardar datos y mostrar alerta con la información
        setFormData(data);
        const message =
            `${t('facialUpdate.changeType')}: ${data.changeLabel}`;

        showSuccess(
            t('facialFail.success'),
            message,
            () => {
                console.log('Parámetros actualizados');
            }
        );
    }, [showSuccess, t]);

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
        alertConfig,
        hideAlert,
    };
}
