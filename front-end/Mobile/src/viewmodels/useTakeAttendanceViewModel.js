import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useCameraPermissions} from 'expo-camera';
import {useCustomAlert} from '../view/components/common/useCustomAlert';
import {useFaceLivenessCapture} from './useFaceLivenessCapture';
import {
    absenceDeadline,
    closeSession,
    getMyClassesToday,
    getRecords,
    getRoster,
    markMissingAbsent,
    openSession,
    recordFace,
} from '../services/attendanceSession';

const AUTO_ABSENT_CHECK_MS = 30000;

// Toma de asistencia del instructor: elige la clase de hoy, abre la sesión y
// registra por reconocimiento facial con prueba de vida. Las ausencias se
// marcan solas al pasar el margen (attendanceSession.ABSENT_AFTER_MINUTES).
export function useTakeAttendanceViewModel() {
    const navigation = useNavigation();
    const {t} = useTranslation();
    const {alertConfig, hideAlert, showError, showConfirm} = useCustomAlert();
    const [permission, requestPermission] = useCameraPermissions();
    const capture = useFaceLivenessCapture();

    const [classes, setClasses] = useState([]);
    const [selected, setSelected] = useState(null); // { block, session, courseName, sessionDate, instructorActorId }
    const [roster, setRoster] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastResult, setLastResult] = useState(null);
    const writing = useRef(Promise.resolve()); // serializa escrituras: foto vs. ausencias automáticas

    const loadClasses = useCallback(async () => {
        setLoading(true);
        try {
            setClasses(await getMyClassesToday());
        } catch (error) {
            showError(t('common.error'), error?.message || t('takeAttendance.loadError'));
        } finally {
            setLoading(false);
        }
    }, [showError, t]);

    useEffect(() => {
        loadClasses();
    }, [loadClasses]);

    const serialized = useCallback((task) => {
        const run = writing.current.then(task, task);
        writing.current = run.catch(() => {});
        return run;
    }, []);

    // Dentro de la cola se releen los registros del servidor: el estado local
    // puede no incluir aún la última foto y se crearía un duplicado.
    const applyAutoAbsences = useCallback((current, members) => serialized(async () => {
        const fresh = await getRecords(current.session);
        const created = await markMissingAbsent({...current, roster: members, records: fresh});
        setRecords([...fresh, ...created]);
    }).catch((error) => console.warn('Ausencias automáticas:', error?.message)), [serialized]);

    const selectClass = useCallback(async (item) => {
        setLoading(true);
        setLastResult(null);
        try {
            const session = item.session || await openSession(item.block, item.sessionDate);
            const current = {...item, session};
            const [members, existing] = await Promise.all([getRoster(item.block), getRecords(session)]);
            setSelected(current);
            setRoster(members);
            setRecords(existing);
            applyAutoAbsences(current, members);
        } catch (error) {
            showError(t('common.error'), error?.message || t('takeAttendance.openError'));
        } finally {
            setLoading(false);
        }
    }, [applyAutoAbsences, showError, t]);

    // Mientras la pantalla siga abierta, al vencer el margen se marcan los faltantes.
    useEffect(() => {
        if (!selected || selected.session.session_status !== 'Open') return undefined;
        const timer = setInterval(() => applyAutoAbsences(selected, roster), AUTO_ABSENT_CHECK_MS);
        return () => clearInterval(timer);
    }, [selected, roster, applyAutoAbsences]);

    const handleCapture = useCallback(async () => {
        if (!selected) return;
        const match = await capture.identifyFace();
        if (!match) return;
        try {
            const result = await serialized(async () => {
                const fresh = await getRecords(selected.session);
                const recorded = await recordFace({...selected, roster, records: fresh, ...match});
                setRecords(recorded.duplicate ? fresh : [...fresh, recorded.record]);
                return recorded;
            });
            setLastResult({
                name: result.member.name,
                status: result.record.attendance_status,
                duplicate: result.duplicate,
            });
            capture.setStatus('');
        } catch (error) {
            capture.setStatus(error?.message === 'not-enrolled' ? t('takeAttendance.notEnrolled') : (error?.message || t('takeAttendance.recordError')), 'error');
        }
    }, [capture, roster, selected, serialized, t]);

    const handleClose = useCallback(() => {
        if (!selected) return;
        showConfirm(t('takeAttendance.closeTitle'), t('takeAttendance.closeQuestion'), async () => {
            try {
                await applyAutoAbsences(selected, roster);
                const session = await closeSession(selected.session, selected.instructorActorId);
                setSelected((prev) => ({...prev, session}));
                loadClasses();
            } catch (error) {
                showError(t('common.error'), error?.message || t('takeAttendance.closeError'));
            }
        });
    }, [applyAutoAbsences, loadClasses, roster, selected, showConfirm, showError, t]);

    const statusOf = useCallback((actorId) =>
        records.find((r) => String(r.academic_actor_id) === actorId)?.attendance_status || null, [records]);

    const handleBack = useCallback(() => {
        if (capture.busy) return;
        if (selected) {
            setSelected(null);
            loadClasses();
        } else {
            navigation.goBack();
        }
    }, [capture.busy, loadClasses, navigation, selected]);

    return {
        classes, selected, roster, loading, lastResult, statusOf,
        deadline: selected ? absenceDeadline(selected.block, selected.sessionDate) : null,
        isOpen: selected?.session?.session_status === 'Open',
        permissionLoading: !permission,
        permissionGranted: !!permission?.granted,
        requestPermission,
        capture, handleCapture, handleClose, selectClass, handleBack,
        alertConfig, hideAlert,
    };
}
