import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../view/components/common/ThemeContext';
import {getCurrentUserRole} from "../services/UserService";
import {useLanguageRefresh} from '../utils/useLanguageRefresh';

export function useUpdatePhotoViewModel() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { loadThemeForRole } = useTheme();

    const [photoSaved, setPhotoSaved] = useState(false);
    const updateKey = useLanguageRefresh();
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

    // Inicialización
    useEffect(() => {
        const init = async () => {
            const role = await getCurrentUserRole();
            if (role) {
                await loadThemeForRole(role);
            }
        };
        init();
    }, [loadThemeForRole]);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // La foto queda guardada en el dispositivo (sin endpoint de subida en
    // el backend): solo confirma la actualización local de parámetros.
    const handlePhotoSaved = useCallback(() => {
        if (!formData.nombreCompleto || !formData.documento || !formData.telefono) {
            setAlertData({
                message: t('updatePhoto.completeFields'),
                type: 'warning',
                timestamp: Date.now(),
            });
            return;
        }
        setPhotoSaved(true);
    }, [formData, t]);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    return {
        photoSaved,
        updateKey,
        formData,
        handleInputChange,
        handlePhotoSaved,
        handleBack,
        // Alertas
        alertData,
        clearAlert,
    };
}