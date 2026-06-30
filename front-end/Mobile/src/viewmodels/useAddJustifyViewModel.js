import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import { useLanguageRefresh } from '../utils/useLanguageRefresh';

export function useAddJustificationViewModel() {
    const navigation = useNavigation();
    const {t} = useTranslation();

    // Estados del formulario
    const [justificationType, setJustificationType] = useState('inasistencia');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const [alertData, setAlertData] = useState({
        message: null,
        type: 'warning',
        timestamp: 0,
    });

    // Idioma: usar hook universal
    const updateKey = useLanguageRefresh();

    // Limpiar alerta
    const clearAlert = () => setAlertData({message: null, type: 'warning', timestamp: 0});

    // Navegación hacia atrás
    const handleBack = () => navigation.goBack();

    // Envío del formulario
    const handleSubmit = async () => {
        // Validaciones
        if (!description.trim()) {
            setAlertData({
                message: t('justify.enterReason'),
                type: 'warning',
                timestamp: Date.now(),
            });
            return;
        }
        if (!date) {
            setAlertData({
                message: t('justify.selectDate'),
                type: 'warning',
                timestamp: Date.now(),
            });
            return;
        }
        if (justificationType === 'retardo' && !time) {
            setAlertData({
                message: t('justify.missingTimeError'),
                type: 'warning',
                timestamp: Date.now(),
            });
            return;
        }
        if (!selectedFile) {
            setAlertData({
                message: t('justify.missingAttachmentError'),
                type: 'warning',
                timestamp: Date.now(),
            });
            return;
        }

        setIsLoading(true);
        try {
            // Simulación de envío
            await new Promise(resolve => setTimeout(resolve, 1500));
            setAlertData({
                message: t('justify.successMessage'),
                type: 'success',
                timestamp: Date.now(),
                // La pantalla detectará el tipo 'success' y cerrará después
            });
        } catch (error) {
            setAlertData({
                message: t('justify.submitError'),
                type: 'error',
                timestamp: Date.now(),
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
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
        updateKey,
        handleBack,
        handleSubmit,
        // Manejo de alertas
        alertData,
        clearAlert,
    };
}