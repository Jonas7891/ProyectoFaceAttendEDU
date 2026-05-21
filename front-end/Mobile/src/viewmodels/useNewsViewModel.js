import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../view/components/common/ThemeContext';
import {getCurrentUserRole} from "../services/UserService";
import { useLanguageRefresh } from '../utils/useLanguageRefresh';

export function useNewsViewModel() {
    const { i18n } = useTranslation();
    const { loadThemeForRole } = useTheme();

    const [userRole, setUserRole] = useState(null);
    const updateKey = useLanguageRefresh(); // para refrescar al cambiar idioma

    useEffect(() => {
        const init = async () => {
            try {
                const role = await getCurrentUserRole();
                setUserRole(role);
                if (role) {
                    await loadThemeForRole(role);
                }
            } catch (error) {
                console.error('Error inicializando NewsScreen:', error);
            }
        };
        init();
    }, [loadThemeForRole]);

    return {
        userRole,
        updateKey,
    };
}