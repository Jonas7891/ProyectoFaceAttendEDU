import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {request, GET} from '../api/apiClient';

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
    const [inasistenciasData, setInasistenciasData] = useState([]);
    const [retardosData, setRetardosData] = useState([]);

    const JUSTIFICATION_STATUS = {
        APPROVED: 'approved',
        PENDING: 'pending',
        REJECTED: 'rejected',
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const jData = await request({ method: GET, url: 'justification', params: { _limit: 100 }, requiresAuth: false });
                const records = unwrap(jData);

                const absences = [];
                const lates = [];

                for (const j of records) {
                    try {
                        const typeData = await request({ method: GET, url: 'justification_type', params: { justification_type_id: j.justification_type_id }, requiresAuth: false });
                        const jType = unwrap(typeData)[0] || {};

                        const statusMap = { Pending: 'pending', Approved: 'approved', Rejected: 'rejected' };
                        const entry = {
                            id: j.justification_id,
                            fecha: j.submitted_at ? j.submitted_at.split('T')[0] : '',
                            motivo: jType.name || j.reason || '—',
                            estado: statusMap[j.review_status] || 'pending',
                        };

                        if (j.justification_type_id === 3) {
                            entry.hora = j.submitted_at ? new Date(j.submitted_at).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) : '—';
                            lates.push(entry);
                        } else {
                            absences.push(entry);
                        }
                    } catch (e) {
                        continue;
                    }
                }

                setInasistenciasData(absences);
                setRetardosData(lates);
            } catch (error) {
                console.error('Error fetching justifications:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const currentData = activeSection === 'inasistencias' ? inasistenciasData : retardosData;

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const getEstadoColor = useCallback((estado) => {
        return estado === JUSTIFICATION_STATUS.APPROVED ? "#4CAF50" : "#FF9800";
    }, []);

    return {
        activeSection, setActiveSection, updateKey, isLoading,
        inasistenciasData, retardosData, currentData,
        handleBack, getEstadoColor,
    };
}
