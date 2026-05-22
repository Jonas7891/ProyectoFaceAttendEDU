import { useEffect, useState } from 'react';
import { useTheme } from '../view/components/common/ThemeContext';
import { getCurrentUserRole } from '../services/UserService';

/**
 * Hook para inicializar el tema del usuario basado en su rol.
 * Consolida la lógica repetida en múltiples viewmodels.
 * 
 * @param {boolean} onFocus - Si es true, ejecuta la inicialización en useFocusEffect
 * @returns {object} { isLoading, userRole }
 */
export const useInitializeUserTheme = (onFocus = false) => {
    const { loadThemeForRole } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);

    const initializeTheme = async () => {
        try {
            setIsLoading(true);
            const role = await getCurrentUserRole();
            if (role) {
                setUserRole(role);
                await loadThemeForRole(role);
            }
        } catch (error) {
            console.error('Error inicializando tema del usuario:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!onFocus) {
        useEffect(() => {
            initializeTheme();
        }, [loadThemeForRole]);
    }

    return {
        isLoading,
        userRole,
        setUserRole,
        initializeTheme, // Retornar por si se necesita forzar reinicialización
    };
};
