import {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';

export function useValidJustificationsViewModel() {
    const navigation = useNavigation();
    const {t, i18n} = useTranslation();

    const [activeSection, setActiveSection] = useState('inasistencias');
    const updateKey = useLanguageRefresh();
    const [isLoading, setIsLoading] = useState(false); // por si más adelante cargas datos

    // Datos mock (quemados, pero se pueden mover a servicios después)
    const inasistenciasData = useMemo(() => [
        {id: 1, fecha: "2024-03-15", motivo: "Incapacidad médica", estado: t('consultJustify.statusApproved')},
        {id: 2, fecha: "2024-03-10", motivo: "Emergencia familiar", estado: t('consultJustify.statusApproved')},
        {id: 3, fecha: "2024-03-05", motivo: "Cita médica", estado: t('consultJustify.statusPending')},
        {id: 4, fecha: "2024-02-28", motivo: "Problemas de transporte", estado: t('consultJustify.statusApproved')},
    ], [t]);

    const retardosData = useMemo(() => [
        {
            id: 1,
            fecha: "2024-03-18",
            hora: "08:35 AM",
            motivo: "Tránsito pesado",
            estado: t('consultJustify.statusApproved')
        },
        {
            id: 2,
            fecha: "2024-03-12",
            hora: "08:45 AM",
            motivo: "Cita médica",
            estado: t('consultJustify.statusApproved')
        },
        {
            id: 3,
            fecha: "2024-03-08",
            hora: "08:28 AM",
            motivo: "Problemas mecánicos",
            estado: t('consultJustify.statusApproved')
        },
        {
            id: 4,
            fecha: "2024-03-01",
            hora: "08:50 AM",
            motivo: "Emergencia personal",
            estado: t('consultJustify.statusPending')
        },
    ], [t]);

    // Datos a mostrar según sección activa
    const currentData = activeSection === 'inasistencias' ? inasistenciasData : retardosData;

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    // Color para el badge de estado
    const getEstadoColor = useCallback((estado) => {
        return estado === t('consultJustify.statusApproved') ? "#4CAF50" : "#FF9800";
    }, [t]);

    return {
        activeSection,
        setActiveSection,
        updateKey,
        isLoading,
        inasistenciasData,
        retardosData,
        currentData,
        handleBack,
        getEstadoColor,
    };
}