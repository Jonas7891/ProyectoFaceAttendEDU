import {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {JustificationService} from '../services/JustificationService';

export function useAddValidJustificationViewModel() {
    const navigation = useNavigation();
    const {t} = useTranslation();

    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [requiresDocument, setRequiresDocument] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const updateKey = useLanguageRefresh();

    const [alertData, setAlertData] = useState({
        message: null,
        type: 'warning',
        timestamp: 0,
    });
    const clearAlert = () => setAlertData({message: null, type: 'warning', timestamp: 0});

    const categories = useMemo(() => [
        { id: 'salud', label: t('admin.categoryHealth'), icon: '🏥', description: t('admin.categoryHealthDesc') || 'Incapacidades y citas médicas' },
        { id: 'familiar', label: t('admin.categoryFamily'), icon: '👨‍👩‍👧', description: t('admin.categoryFamilyDesc') || 'Situaciones de carácter familiar' },
        { id: 'legal', label: t('admin.categoryLegal'), icon: '⚖️', description: t('admin.categoryLegalDesc') || 'Diligencias judiciales o legales' },
        { id: 'academica', label: t('admin.categoryAcademic'), icon: '🎓', description: t('admin.categoryAcademicDesc') || 'Actividades académicas externas' },
        { id: 'otro', label: t('admin.categoryOther'), icon: '📋', description: t('admin.categoryOtherDesc') || 'Otros motivos justificados' },
    ], [t]);

    const types = useMemo(() => [
        { id: 'medica', label: t('admin.typeMedical'), icon: '💊', description: t('admin.typeMedicalDesc') || 'Consulta, cirugía o incapacidad' },
        { id: 'familiar', label: t('admin.typeFamily'), icon: '🏠', description: t('admin.typeFamilyDesc') || 'Fallecimiento o calamidad familiar' },
        { id: 'personal', label: t('admin.typePersonal'), icon: '👤', description: t('admin.typePersonalDesc') || 'Asunto personal de fuerza mayor' },
        { id: 'academica', label: t('admin.typeAcademic'), icon: '📚', description: t('admin.typeAcademicDesc') || 'Evento, congreso o representación' },
        { id: 'laboral', label: t('admin.typeWork'), icon: '💼', description: t('admin.typeWorkDesc') || 'Comisión o actividad laboral' },
        { id: 'otro', label: t('admin.typeOther'), icon: '📝', description: t('admin.typeOtherDesc') || 'Otro tipo de justificación' },
    ], [t]);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const handleSave = useCallback(async () => {
        if (!type.trim() || !description.trim() || !category.trim()) {
            setAlertData({ message: t('admin.completeAllFields'), type: 'warning', timestamp: Date.now() });
            return;
        }

        setIsSaving(true);
        try {
            await JustificationService.createType({
                name: type.trim(),
                description: description.trim(),
                requiresAttachment: requiresDocument,
            });

            setAlertData({ message: t('admin.justificationCreated'), type: 'success', timestamp: Date.now() });
        } catch (error) {
            setAlertData({ message: t('admin.errorCreating'), type: 'error', timestamp: Date.now() });
        } finally {
            setIsSaving(false);
        }
    }, [type, description, category, requiresDocument, t]);

    const selectedCategory = useMemo(() => categories.find(c => c.label === category), [categories, category]);
    const selectedType = useMemo(() => types.find(tp => tp.label === type), [types, type]);

    return {
        type, setType, description, setDescription, category, setCategory,
        requiresDocument, setRequiresDocument, isSaving, updateKey,
        categories, types, selectedCategory, selectedType,
        handleBack, handleSave, alertData, clearAlert,
    };
}
