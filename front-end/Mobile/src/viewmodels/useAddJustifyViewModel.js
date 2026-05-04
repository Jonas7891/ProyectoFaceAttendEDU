// viewmodels/useAddJustificationViewModel.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export function useAddJustificationViewModel() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();

    // Estados del formulario
    const [justificationType, setJustificationType] = useState('inasistencia');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Estados de idioma (para forzar re-render cuando cambia)
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            setUpdateKey(prev => prev + 1);
        };

        i18n.on('languageChanged', handleLanguageChanged);
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

    // Navegación hacia atrás
    const handleBack = () => navigation.goBack();

    // Envío del formulario (mock)
    const handleSubmit = async () => {
        // Validaciones
        if (!description.trim()) {
            Alert.alert(t('common.error'), t('justify.enterReason'));
            return;
        }
        if (!date) {
            Alert.alert(t('common.error'), t('justify.selectDate'));
            return;
        }
        if (justificationType === 'retardo' && !time) {
            Alert.alert(t('common.error'), t('justify.missingTimeError'));
            return;
        }
        if (!selectedFile) {
            Alert.alert(t('common.error'), t('justify.missingAttachmentError'));
            return;
        }

        setIsLoading(true);
        try {
            // Simulación de envío
            await new Promise(resolve => setTimeout(resolve, 1500));
            Alert.alert(t('common.success'), t('justify.successMessage'), [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert(t('common.error'), t('justify.submitError'));
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // Estados del formulario
        justificationType,
        setJustificationType,
        description,
        setDescription,
        selectedFile,
        setSelectedFile,
        date,
        setDate,
        time,
        setTime,
        isLoading,
        updateKey, // para refrescar la vista cuando cambie el idioma

        // Acciones
        handleBack,
        handleSubmit,
    };
}