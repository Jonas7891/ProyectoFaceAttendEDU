import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useCustomAlert } from '../view/components/common/useCustomAlert';

// ===========================================================================
// CONSTANTES DE TOPE
// ===========================================================================
// (se definen dentro del hook, ver ABSENCE_LIMIT / LATENESS_LIMIT)

// ===========================================================================
// DATOS DE EJEMPLO  (reemplazar por llamadas a tu API/contexto)
// ===========================================================================
const MOCK_STUDENTS = [

];

const MOCK_TEACHERS = [

];

export function useAttendanceReportViewModel() {
    const ABSENCE_LIMIT = 3;
    const LATENESS_LIMIT = 6;

    // Antes se usaba getAlertLevel sin estar definida en este archivo (ReferenceError).
    // Se define aquí, dentro del hook, para tener acceso directo a los topes.
    const getAlertLevel = useCallback((person) => {
        if (person.absences > ABSENCE_LIMIT) return 'critical';
        if (person.lateness > LATENESS_LIMIT) return 'warning';
        return 'ok';
    }, [ABSENCE_LIMIT, LATENESS_LIMIT]);

    const { alertConfig, hideAlert, showSuccess, showConfirm } = useCustomAlert();
    const [activeRole, setActiveRole] = useState('student');
    const [activeType, setActiveType] = useState('absence');
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);

    const rawData = activeRole === 'student' ? MOCK_STUDENTS : MOCK_TEACHERS;

    const filteredData = useMemo(() => {
        let data = rawData.filter(p => {
            if (activeType === 'absence' && p.absences <= ABSENCE_LIMIT) return false;
            if (activeType === 'lateness' && p.lateness <= LATENESS_LIMIT) return false;
            const level = getAlertLevel(p);
            if (activeFilter === 'critical' && level !== 'critical') return false;
            if (activeFilter === 'warning' && level !== 'warning') return false;
            return true;
        });
        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            data = data.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q) ||
                p.course.toLowerCase().includes(q),
            );
        }
        return data;
    }, [rawData, activeType, activeFilter, searchText, getAlertLevel]);

    const summary = useMemo(() => {
        const over = rawData.filter(p =>
            activeType === 'absence' ? p.absences > ABSENCE_LIMIT : p.lateness > LATENESS_LIMIT,
        );
        return {
            critical: over.filter(p => getAlertLevel(p) === 'critical').length,
            warning: over.filter(p => getAlertLevel(p) === 'warning').length,
            ok: rawData.length - over.length,
        };
    }, [rawData, activeType, getAlertLevel]);

    const handleGenerateIndividual = useCallback((person) => {
        setSelectedPerson(person);
        setModalVisible(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    const handleConfirmReport = useCallback(() => {
        setModalVisible(false);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                'Reporte generado',
                'El reporte de ' + selectedPerson?.name + ' fue enviado correctamente.',
                [{ text: 'Aceptar' }],
            );
        }, 1800);
    }, [selectedPerson]);

    const handleGenerateAll = useCallback(() => {
        if (filteredData.length === 0) return;
        const roleLabel = activeRole === 'student' ? 'estudiante(s)' : 'docente(s)';
        const typeLabel = activeType === 'absence' ? 'inasistencias' : 'retardos';
        Alert.alert(
            'Generar reporte general',
            'Se generará un reporte para ' + filteredData.length + ' ' + roleLabel + ' con ' + typeLabel + ' superiores al tope. ¿Continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: () => {
                        setIsLoading(true);
                        setTimeout(() => {
                            setIsLoading(false);
                            Alert.alert('Reportes enviados ✓', filteredData.length + ' reporte(s) generados exitosamente.');
                        }, 2000);
                    },
                },
            ],
        );
    }, [filteredData, activeRole, activeType]);

    const handleRoleChange = useCallback((role) => {
        setActiveRole(role);
        setSearchText('');
        setActiveFilter('all');
    }, []);

    return {
        ABSENCE_LIMIT,
        LATENESS_LIMIT,
        alertConfig,
        hideAlert,
        activeRole,
        activeType,
        setActiveType,
        activeFilter,
        setActiveFilter,
        searchText,
        setSearchText,
        isLoading,
        selectedPerson,
        modalVisible,
        closeModal,
        summary,
        filteredData,
        handleGenerateIndividual,
        handleConfirmReport,
        handleGenerateAll,
        handleRoleChange,
    };
}