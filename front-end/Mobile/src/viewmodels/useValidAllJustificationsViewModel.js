// viewmodels/useJustificationsViewModel.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../view/components/common/ThemeContext';

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
    const [updateKey, setUpdateKey] = useState(0);

    // Inicializar rol y tema, y escuchar cambios de idioma
    useEffect(() => {
        const init = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                setUserRole(role);
                if (role) await loadThemeForRole(role);
            } catch (error) {
                console.error('Error inicializando rol:', error);
            }
        };
        init();

        const handleLanguageChanged = () => setUpdateKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChanged);
        return () => i18n.off('languageChanged', handleLanguageChanged);
    }, [loadThemeForRole, i18n]);

    // Cargar justificaciones (y recargar al enfocar pantalla)
    const loadJustifications = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem('validJustifications');
            if (stored) {
                setJustifications(JSON.parse(stored));
            } else {
                setJustifications(DEFAULT_JUSTIFICATIONS);
                await AsyncStorage.setItem('validJustifications', JSON.stringify(DEFAULT_JUSTIFICATIONS));
            }
        } catch (error) {
            console.error('Error al cargar justificaciones:', error);
        }
    }, []);

    useEffect(() => {
        loadJustifications();
        const unsubscribe = navigation.addListener('focus', loadJustifications);
        return unsubscribe;
    }, [navigation, loadJustifications]);

    // Derivaciones: categorías únicas y agrupación
    const categories = useMemo(() => [...new Set(justifications.map(j => j.category))], [justifications]);
    const getJustificationsByCategory = useCallback(
        (cat) => justifications.filter(j => j.category === cat),
        [justifications]
    );

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    return {
        justifications,
        userRole,
        updateKey,
        categories,
        getJustificationsByCategory,
        handleBack,
    };
}