// viewmodels/useUpdatePhotoViewModel.js
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../view/components/common/ThemeContext';

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

    // Inicialización y listener de idioma
    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
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
            Alert.alert(t('updatePhoto.error'), t('updatePhoto.completeFields'));
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
    };
}