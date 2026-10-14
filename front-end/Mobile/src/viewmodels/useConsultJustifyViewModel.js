import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../view/components/common/ThemeContext';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {getCurrentUser} from '../services/UserService';
import {ActorService} from '../services/ActorService';
import {
  JustificationService,
  getJustificationTypeMap,
  getAttendanceRecordCached,
  mapConcurrent,
} from '../services/JustificationService';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

export function useValidJustificationsViewModel() {
    const navigation = useNavigation();
    const {t, i18n} = useTranslation();

    const [activeSection, setActiveSection] = useState('inasistencias');
    const updateKey = useLanguageRefresh();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inasistenciasData, setInasistenciasData] = useState([]);
    const [retardosData, setRetardosData] = useState([]);

    const JUSTIFICATION_STATUS = {
        APPROVED: 'approved',
        PENDING: 'pending',
        REJECTED: 'rejected',
    };

    const fetchData = useCallback(async () => {
            try {
                setIsLoading(true);
                setError(null);
                const timeLocale =
                    i18n.language === 'en' ? 'en-US'
                    : i18n.language === 'pt' ? 'pt-BR'
                    : i18n.language === 'fr' ? 'fr-FR'
                    : 'es-ES';

                const user = await getCurrentUser();
                const actors = await ActorService.getByPerson(user?.personId);

                let records;
                if (actors?.length > 0) {
                    const mine = [];
                    for (const actor of actors) {
                        mine.push(...await JustificationService.getByActor(actor.academicActorId));
                    }
                    records = mine;
                } else {
                    records = await JustificationService.getAll();
                }

                const typeMap = await getJustificationTypeMap();

                const built = await mapConcurrent(records, async (j) => {
                    const jd = {
                        justification_id: j.justificationId ?? j.justification_id,
                        justification_type_id: j.justificationTypeId ?? j.justification_type_id,
                        reason: j.reason,
                        submitted_at: j.submittedAt ?? j.submitted_at,
                        review_status: j.reviewStatus ?? j.review_status,
                        attendance_record_id: j.attendanceRecordId ?? j.attendance_record_id,
                    };
                    const ar = await getAttendanceRecordCached(jd.attendance_record_id);
                    const jType = typeMap[jd.justification_type_id] || {};
                    const statusMap = { Pending: 'pending', Approved: 'approved', Rejected: 'rejected' };
                    return {
                        id: jd.justification_id,
                        fecha: jd.submitted_at ? jd.submitted_at.split('T')[0] : '',
                        motivo: jType.name || jd.reason || '—',
                        estado: statusMap[jd.review_status] || 'pending',
                        isLate: ar?.attendance_status === 'Late',
                        submitted_at: jd.submitted_at,
                    };
                });

                const absences = [];
                const lates = [];
                for (const entry of built) {
                    if (entry.isLate) {
                        entry.hora = entry.submitted_at
                            ? new Date(entry.submitted_at).toLocaleTimeString(timeLocale, {hour: '2-digit', minute: '2-digit'})
                            : '—';
                        lates.push(entry);
                    } else {
                        absences.push(entry);
                    }
                    delete entry.isLate;
                    delete entry.submitted_at;
                }

                setInasistenciasData(absences);
                setRetardosData(lates);
            } catch (error) {
                console.error('Error fetching justifications:', error);
                setError(t('justifications.loadError'));
            } finally {
                setIsLoading(false);
            }
    }, [t, i18n.language]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const currentData = activeSection === 'inasistencias' ? inasistenciasData : retardosData;

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const {colors} = useTheme();
    const getEstadoColor = useCallback((estado) => {
        return estado === JUSTIFICATION_STATUS.APPROVED ? colors.success : colors.warning;
    }, [colors]);

    return {
        activeSection, setActiveSection, updateKey, isLoading, error, retry: fetchData,
        inasistenciasData, retardosData, currentData,
        handleBack, getEstadoColor,
    };
}
