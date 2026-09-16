import {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';

export function useAddValidJustificationViewModel() {
    const navigation = useNavigation();
    const {t} = useTranslation();

    // Estados del formulario
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [requiresDocument, setRequiresDocument] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Key para refrescar la vista al cambiar idioma
    const updateKey = useLanguageRefresh();

    // ---- NUEVO: estado de alerta centralizado ----
    const [alertData, setAlertData] = useState({
        message: null,
        type: 'warning',   // 'warning', 'success', 'error'
        timestamp: 0,
    });

    const clearAlert = () => setAlertData({message: null, type: 'warning', timestamp: 0});

    // Listas de categorías y tipos
    const categories = useMemo(() => [
        {
            id: 'salud',
            label: t('admin.categoryHealth'),
            icon: '🏥',
            description: t('admin.categoryHealthDesc') || 'Incapacidades y citas médicas',
        },
        {
            id: 'familiar',
            label: t('admin.categoryFamily'),
            icon: '👨‍👩‍👧',
            description: t('admin.categoryFamilyDesc') || 'Situaciones de carácter familiar',
        },
        {
            id: 'legal',
            label: t('admin.categoryLegal'),
            icon: '⚖️',
            description: t('admin.categoryLegalDesc') || 'Diligencias judiciales o legales',
        },
        {
            id: 'academica',
            label: t('admin.categoryAcademic'),
            icon: '🎓',
            description: t('admin.categoryAcademicDesc') || 'Actividades académicas externas',
        },
        {
            id: 'otro',
            label: t('admin.categoryOther'),
            icon: '📋',
            description: t('admin.categoryOtherDesc') || 'Otros motivos justificados',
        },
    ], [t]);

    const types = useMemo(() => [
        {
            id: 'medica',
            label: t('admin.typeMedical'),
            icon: '💊',
            description: t('admin.typeMedicalDesc') || 'Consulta, cirugía o incapacidad',
        },
        {
            id: 'familiar',
            label: t('admin.typeFamily'),
            icon: '🏠',
            description: t('admin.typeFamilyDesc') || 'Fallecimiento o calamidad familiar',
        },
        {
            id: 'personal',
            label: t('admin.typePersonal'),
            icon: '👤',
            description: t('admin.typePersonalDesc') || 'Asunto personal de fuerza mayor',
        },
        {
            id: 'academica',
            label: t('admin.typeAcademic'),
            icon: '📚',
            description: t('admin.typeAcademicDesc') || 'Evento, congreso o representación',
        },
        {
            id: 'laboral',
            label: t('admin.typeWork'),
            icon: '💼',
            description: t('admin.typeWorkDesc') || 'Comisión o actividad laboral',
        },
        {
            id: 'otro',
            label: t('admin.typeOther'),
            icon: '📝',
            description: t('admin.typeOtherDesc') || 'Otro tipo de justificación',
        },
    ], [t]);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const handleSave = useCallback(async () => {
        // Validación de campos obligatorios
        if (!type.trim() || !description.trim() || !category.trim()) {
            setAlertData({
                message: t('admin.completeAllFields'),
                type: 'warning',
                timestamp: Date.now(),
            });
            return;
        }

        setIsSaving(true);
        try {
            const newJustification = {
                id: Date.now().toString(),
                type,
                description,
                category,
                requiresDocument,
                createdAt: new Date().toISOString(),
            };

            const stored = await AsyncStorage.getItem('validJustifications');
            const justifications = stored ? JSON.parse(stored) : [];
            justifications.push(newJustification);
            await AsyncStorage.setItem('validJustifications', JSON.stringify(justifications));

            // Éxito
            setAlertData({
                message: t('admin.justificationCreated'),
                type: 'success',
                timestamp: Date.now(),
            });
        } catch (error) {
            // Error al guardar
            setAlertData({
                message: t('admin.errorCreating'),
                type: 'error',
                timestamp: Date.now(),
            });
        } finally {
            setIsSaving(false);
        }
    }, [type, description, category, requiresDocument, t]);

    // Objetos seleccionados para el resumen
    const selectedCategory = useMemo(
        () => categories.find(c => c.label === category),
        [categories, category]
    );
    const selectedType = useMemo(
        () => types.find(tp => tp.label === type),
        [types, type]
    );

    return {
        // Estados del formulario
        type, setType,
        description, setDescription,
        category, setCategory,
        requiresDocument, setRequiresDocument,
        isSaving,
        updateKey,
        // Datos
        categories,
        types,
        selectedCategory,
        selectedType,
        // Acciones
        handleBack,
        handleSave,
        alertData,
        clearAlert,
    };
}