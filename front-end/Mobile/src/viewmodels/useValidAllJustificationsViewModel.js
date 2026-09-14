import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../view/components/common/ThemeContext';
import {getCurrentUserRole} from "../services/UserService";
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {request, GET} from '../api/apiClient';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

const DEFAULT_JUSTIFICATIONS = [
    { id: "1", type: "Médica", description: "Ausencia por cita médica con especialista", requiresDocument: true, category: "Salud" },
    { id: "2", type: "Familiar", description: "Ausencia por fallecimiento de familiar directo", requiresDocument: true, category: "Familiar" },
    { id: "3", type: "Personal", description: "Ausencia por trámite legal inaplazable", requiresDocument: true, category: "Legal" },
    { id: "4", type: "Académica", description: "Participación en evento académico representando a la institución", requiresDocument: true, category: "Académica" },
];

export function useJustificationsViewModel() {
    const navigation = useNavigation();
    const { i18n } = useTranslation();
    const { loadThemeForRole } = useTheme();

    const [justifications, setJustifications] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const updateKey = useLanguageRefresh();

    useEffect(() => {
        const init = async () => {
            try {
                const role = await getCurrentUserRole();
                setUserRole(role);
                if (role) await loadThemeForRole(role);
            } catch (error) {
                console.error('Error inicializando rol:', error);
            }
        };
        init();
    }, [loadThemeForRole]);

    const loadJustifications = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem('validJustifications');
            if (stored) {
                setJustifications(JSON.parse(stored));
                return;
            }

            const jtData = await request({ method: GET, url: 'justification_type', requiresAuth: false });
            const types = unwrap(jtData);

            if (types.length > 0) {
                const mapped = types.map(t => ({
                    id: String(t.justification_type_id),
                    type: t.name,
                    description: t.description || '',
                    requiresDocument: t.requires_attachment || false,
                    category: t.name.includes('méd') || t.name.includes('Méd') ? 'Salud' :
                              t.name.includes('familiar') || t.name.includes('Familiar') ? 'Familiar' :
                              t.name.includes('representación') || t.name.includes('institucional') ? 'Académica' : 'General',
                }));
                setJustifications(mapped);
                await AsyncStorage.setItem('validJustifications', JSON.stringify(mapped));
            } else {
                setJustifications(DEFAULT_JUSTIFICATIONS);
                await AsyncStorage.setItem('validJustifications', JSON.stringify(DEFAULT_JUSTIFICATIONS));
            }
        } catch (error) {
            console.error('Error al cargar justificaciones:', error);
            setJustifications(DEFAULT_JUSTIFICATIONS);
        }
    }, []);

    useEffect(() => {
        loadJustifications();
        const unsubscribe = navigation.addListener('focus', loadJustifications);
        return unsubscribe;
    }, [navigation, loadJustifications]);

    const categories = useMemo(() => [...new Set(justifications.map(j => j.category))], [justifications]);
    const getJustificationsByCategory = useCallback(
        (cat) => justifications.filter(j => j.category === cat),
        [justifications]
    );

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    return {
        justifications, userRole, updateKey, categories,
        getJustificationsByCategory, handleBack,
    };
}
