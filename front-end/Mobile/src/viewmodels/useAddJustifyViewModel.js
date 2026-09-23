import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import * as DocumentPicker from 'expo-document-picker';
import {request, GET, POST} from '../api/apiClient';
import {getCurrentUser} from '../services/UserService';
import {ActorService} from '../services/ActorService';

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

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            copyToCacheDirectory: true,
        });
        if (!result.canceled) setSelectedFile(result.assets[0]);
    };

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
            const user = await getCurrentUser();
            const actors = await ActorService.getByPerson(user?.personId);
            const actor = actors?.[0];
            const attendanceData = actor
                ? await request({method: GET, url: 'attendance_record', params: {academic_actor_id: actor.academicActorId}, requiresAuth: false})
                : [];
            const attendanceRecords = attendanceData?.value || attendanceData || [];
            const attendanceRecord = attendanceRecords.find(record => record.captured_at?.startsWith(date));
            const typeData = await request({method: GET, url: 'justification_type', requiresAuth: false});
            const types = typeData?.value || typeData || [];
            const type = types.find(item => {
                const name = String(item.name || '').toLowerCase();
                return justificationType === 'retardo' ? name.includes('ret') || name.includes('late') : name.includes('inas') || name.includes('absen');
            }) || types[0];

            await request({
                method: POST,
                url: 'justification',
                data: {
                    attendance_record_id: attendanceRecord?.attendance_record_id || null,
                    justification_type_id: type?.justification_type_id || null,
                    reason: description.trim(),
                    submitted_at: new Date(`${date}T${time || '00:00'}`).toISOString(),
                    review_status: 'Pending',
                    attachment: selectedFile ? {name: selectedFile.name, uri: selectedFile.uri, mime_type: selectedFile.mimeType} : null,
                },
                requiresAuth: false,
            });
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
        pickFile,
        isLoading,
        updateKey,
        handleBack,
        handleSubmit,
        // Manejo de alertas
        alertData,
        clearAlert,
    };
}