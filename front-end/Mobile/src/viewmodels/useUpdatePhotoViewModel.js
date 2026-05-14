import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../view/components/common/ThemeContext';
import {getCurrentUserRole} from "../services/UserService";

export function useUpdatePhotoViewModel() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { loadThemeForRole } = useTheme();

    const [attendanceRegistered, setAttendanceRegistered] = useState(false);
    const [updateKey, setUpdateKey] = useState(0);
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        documento: '',
        telefono: '',
    });

    // ---- NUEVO: estado de alerta ----
    const [alertData, setAlertData] = useState({
        message: null,
        type: 'warning',
        timestamp: 0,
    });
    const clearAlert = () => setAlertData({ message: null, type: 'warning', timestamp: 0 });

    // Inicialización y listener de idioma
    useEffect(() => {
        const init = async () => {
            const role = await getCurrentUserRole();
            if (role) {
                await loadThemeForRole(role);
            }
        };
        init();

        const handleLanguageChanged = () => setUpdateKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChanged);
        return () => i18n.off('languageChanged', handleLanguageChanged);
    }, [loadThemeForRole, i18n]);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleRegisterAttendance = useCallback(() => {
        if (!formData.nombreCompleto || !formData.documento || !formData.telefono) {
            setAlertData({
                message: t('updatePhoto.completeFields'),
                type: 'warning',
                timestamp: Date.now(),
            });
            return;
        }
        setAttendanceRegistered(true);
    }, [formData, t]);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    return {
        attendanceRegistered,
        updateKey,
        formData,
        handleInputChange,
        handleRegisterAttendance,
        handleBack,
        // Alertas
        alertData,
        clearAlert,
    };
}