import {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';

export function useValidJustificationsViewModel() {
    const navigation = useNavigation();
    const {t, i18n} = useTranslation();

    const [activeSection, setActiveSection] = useState('inasistencias');
    const updateKey = useLanguageRefresh();
    const [isLoading, setIsLoading] = useState(false);


    const JUSTIFICATION_STATUS = {
        APPROVED: 'approved',
        PENDING: 'pending',
        REJECTED: 'rejected',
    };

    // Datos mock con motivos traducidos y estados como constantes
    const inasistenciasData = useMemo(() => [
        {
            id: 1,
            fecha: "2024-03-15",
            motivo: t('justificationReasons.medicalDisability'),
            estado: JUSTIFICATION_STATUS.APPROVED
        },
        {
            id: 2,
            fecha: "2024-03-10",
            motivo: t('justificationReasons.familyEmergency'),
            estado: JUSTIFICATION_STATUS.APPROVED
        },
        {
            id: 3,
            fecha: "2024-03-05",
            motivo: t('justificationReasons.medicalAppointment'),
            estado: JUSTIFICATION_STATUS.PENDING
        },
        {
            id: 4,
            fecha: "2024-02-28",
            motivo: t('justificationReasons.transportIssues'),
            estado: JUSTIFICATION_STATUS.APPROVED
        },
    ], [t]);

    const retardosData = useMemo(() => [
        {
            id: 1,
            fecha: "2024-03-18",
            hora: "08:35 AM",
            motivo: t('justificationReasons.heavyTraffic'),
            estado: JUSTIFICATION_STATUS.APPROVED
        },
        {
            id: 2,
            fecha: "2024-03-12",
            hora: "08:45 AM",
            motivo: t('justificationReasons.medicalAppointment'),
            estado: JUSTIFICATION_STATUS.APPROVED
        },
        {
            id: 3,
            fecha: "2024-03-08",
            hora: "08:28 AM",
            motivo: t('justificationReasons.mechanicalIssues'),
            estado: JUSTIFICATION_STATUS.APPROVED
        },
        {
            id: 4,
            fecha: "2024-03-01",
            hora: "08:50 AM",
            motivo: t('justificationReasons.personalEmergency'),
            estado: JUSTIFICATION_STATUS.PENDING
        },
    ], [t]);

    // Datos a mostrar según sección activa
    const currentData = activeSection === 'inasistencias' ? inasistenciasData : retardosData;

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    // Color para el badge de estado (ahora compara constantes, no strings traducidos)
    const getEstadoColor = useCallback((estado) => {
        return estado === JUSTIFICATION_STATUS.APPROVED ? "#4CAF50" : "#FF9800";
    }, []);

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