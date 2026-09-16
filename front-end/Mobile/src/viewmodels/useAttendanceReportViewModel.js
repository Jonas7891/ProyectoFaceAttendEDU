import {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert} from 'react-native';
import {useCustomAlert} from '../view/components/common/useCustomAlert';
import {request, GET} from '../api/apiClient';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

export function useAttendanceReportViewModel() {
    const ABSENCE_LIMIT = 3;
    const LATENESS_LIMIT = 6;

    const getAlertLevel = useCallback((person) => {
        if (person.absences > ABSENCE_LIMIT) return 'critical';
        if (person.lateness > LATENESS_LIMIT) return 'warning';
        return 'ok';
    }, [ABSENCE_LIMIT, LATENESS_LIMIT]);

    const {alertConfig, hideAlert, showSuccess, showConfirm} = useCustomAlert();
    const [activeRole, setActiveRole] = useState('student');
    const [activeType, setActiveType] = useState('absence');
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const arData = await request({ method: GET, url: 'attendance_record', params: { _limit: 500 }, requiresAuth: false });
                const records = unwrap(arData);

                const actorMap = {};
                for (const r of records) {
                    const aid = r.academic_actor_id;
                    if (!actorMap[aid]) actorMap[aid] = { id: aid, absences: 0, lateness: 0, name: '', code: '', course: '', type: 'student' };
                    if (r.attendance_status === 'Absent') actorMap[aid].absences++;
                    if (r.attendance_status === 'Late') actorMap[aid].lateness++;
                }

                const enriched = [];
                for (const [aid, stats] of Object.entries(actorMap)) {
                    try {
                        const actorData = await request({ method: GET, url: 'academic_actor', params: { academic_actor_id: aid }, requiresAuth: false });
                        const actor = unwrap(actorData)[0] || {};
                        const personData = await request({ method: GET, url: 'person', params: { person_id: actor.person_id }, requiresAuth: false });
                        const person = unwrap(personData)[0] || {};
                        enriched.push({
                            ...stats,
                            name: `${person.name || ''} ${person.last_name || ''}`.trim() || `Actor #${aid}`,
                            code: actor.actor_code || '—',
                            course: '—',
                            type: actor.actor_type_id === 1 ? 'student' : 'teacher',
                        });
                    } catch (e) {
                        continue;
                    }
                }

                setStudents(enriched.filter(e => e.type === 'student'));
                setTeachers(enriched.filter(e => e.type === 'teacher'));
            } catch (error) {
                console.error('Error fetching report data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const rawData = activeRole === 'student' ? students : teachers;

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
    }, [rawData, activeType, activeFilter, searchText, getAlertLevel, ABSENCE_LIMIT, LATENESS_LIMIT]);

    const summary = useMemo(() => {
        const over = rawData.filter(p =>
            activeType === 'absence' ? p.absences > ABSENCE_LIMIT : p.lateness > LATENESS_LIMIT,
        );
        return {
            critical: over.filter(p => getAlertLevel(p) === 'critical').length,
            warning: over.filter(p => getAlertLevel(p) === 'warning').length,
            ok: rawData.length - over.length,
        };
    }, [rawData, activeType, getAlertLevel, ABSENCE_LIMIT, LATENESS_LIMIT]);

    const handleGenerateIndividual = useCallback((person) => { setSelectedPerson(person); setModalVisible(true); }, []);
    const closeModal = useCallback(() => { setModalVisible(false); }, []);

    const handleConfirmReport = useCallback(() => {
        setModalVisible(false);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Reporte generado', 'El reporte de ' + selectedPerson?.name + ' fue enviado correctamente.', [{text: 'Aceptar'}]);
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
                {text: 'Cancelar', style: 'cancel'},
                {text: 'Confirmar', onPress: () => {
                    setIsLoading(true);
                    setTimeout(() => { setIsLoading(false); Alert.alert('Reportes enviados ✓', filteredData.length + ' reporte(s) generados exitosamente.'); }, 2000);
                }},
            ],
        );
    }, [filteredData, activeRole, activeType]);

    const handleRoleChange = useCallback((role) => { setActiveRole(role); setSearchText(''); setActiveFilter('all'); }, []);

    return {
        ABSENCE_LIMIT, LATENESS_LIMIT, alertConfig, hideAlert,
        activeRole, activeType, setActiveType, activeFilter, setActiveFilter,
        searchText, setSearchText, isLoading, selectedPerson, modalVisible,
        closeModal, summary, filteredData,
        handleGenerateIndividual, handleConfirmReport, handleGenerateAll, handleRoleChange,
    };
}
