import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useCustomAlert} from '../view/components/common/useCustomAlert';
import {backendGet, ENV, request, POST} from '../api/backend';
import {getCurrentUserRole, getCurrentUser} from '../services/UserService';
import {ActorService} from '../services/ActorService';

export function useAttendanceReportViewModel() {
    const {t} = useTranslation();
    const ABSENCE_LIMIT = 3;
    const LATENESS_LIMIT = 6;

    const getAlertLevel = useCallback((person) => {
        if (person.absences > ABSENCE_LIMIT) return 'critical';
        if (person.lateness > LATENESS_LIMIT) return 'warning';
        return 'ok';
    }, [ABSENCE_LIMIT, LATENESS_LIMIT]);

    const {alertConfig, hideAlert, showSuccess, showError, showConfirm} = useCustomAlert();
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
                const arData = await backendGet(ENV.ATTENDANCE_BASE_URL, 'api/v1/attendance-records', {_limit: 500});
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
                        const actorData = await backendGet(ENV.ACADEMIC_BASE_URL, 'api/v1/academic-actors', {academic_actor_id: aid});
                        const actor = (actorData?.value || actorData || [])[0] || {};
                        const personData = await backendGet(ENV.API_BASE_URL, 'api/v1/persons', {person_id: actor.person_id});
                        const person = (personData?.value || personData || [])[0] || {};
                        enriched.push({
                            ...stats,
                            name: `${person.name || ''} ${person.last_name || ''}`.trim() || t('attendance.unknownPerson', {id: aid}),
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

    const sendReport = useCallback(async (people) => {
        setIsLoading(true);
        try {
            await request({
                method: POST,
                url: 'attendance_report',
                data: {
                    role: activeRole,
                    attendance_type: activeType,
                    people,
                },
                requiresAuth: false,
            });
            showSuccess(t('attendanceReport.title'), t('attendanceReport.reportSent'));
        } finally {
            setIsLoading(false);
        }
    }, [activeRole, activeType, showSuccess, t]);

    const handleConfirmReport = useCallback(async () => {
        setModalVisible(false);
        try {
            await sendReport([selectedPerson]);
        } catch (error) {
            showError(t('common.error'), error.message || t('attendanceReport.reportError'));
        }
    }, [selectedPerson, sendReport, showError, t]);

    const handleGenerateAll = useCallback(() => {
        if (filteredData.length === 0) return;
        showConfirm(
            t('attendanceReport.title'),
            t('attendanceReport.confirmGeneral', {count: filteredData.length}),
            () => sendReport(filteredData),
        );
    }, [filteredData, sendReport, showConfirm, t]);

    const handleRoleChange = useCallback((role) => { setActiveRole(role); setSearchText(''); setActiveFilter('all'); }, []);

    return {
        ABSENCE_LIMIT, LATENESS_LIMIT, alertConfig, hideAlert,
        activeRole, activeType, setActiveType, activeFilter, setActiveFilter,
        searchText, setSearchText, isLoading, selectedPerson, modalVisible,
        closeModal, summary, filteredData,
        handleGenerateIndividual, handleConfirmReport, handleGenerateAll, handleRoleChange,
    };
}
