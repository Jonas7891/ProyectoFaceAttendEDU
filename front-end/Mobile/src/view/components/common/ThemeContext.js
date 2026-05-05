import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveThemeForRole, getThemeForRole } from '../../../utils/themeByRole';

export const lightColors = {
    background: '#F5F5F5',
    backgroundWhite: '#FFFFFF',
    card: '#FFFFFF',
    inputBackground: '#FFFFFF',
    navBar: '#EDEDED',
    tabInactive: '#D9D9D9',
    text: '#000000',
    textSecondary: '#000000',
    textMuted: '#999999',
    separator: '#D0D0D0',
    primary: '#1392ED',
    tabActive: '#41C0FF',
    danger: '#ff0000',
    progressBackground: '#E0E0E0',
    statusPresente: '#E8F5E9',
    statusTarde: '#FFF3E0',
    statusTextPresente: '#2da351',
    statusTextTarde: '#E65100',
    novedadSuccess: '#2da351',
    novedadWarning: '#FF9800',
    novedadInfo: '#2196F3',
    cardBorder: '#E5E5E5',
    badgeBackground: '#E3F2FD',
    badgeText: '#1392ED',
    categoryBackground: '#F0F4F8',
    categoryText: '#333333',
    backButtonBackground: '#F5F5F5',
    modalBackground: '#FFFFFF',
    modalText: '#1a1a1a',
    modalTextSecondary: '#666666',
    modalBorder: '#E0E0E0',
    modalButton: '#007AFF',
    modalButtonText: '#FFFFFF',
    modalButtonSecondary: '#F5F5F5',
    modalButtonSecondaryText: '#666666',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    modalInputBackground: '#F9F9F9',
    modalInputText: '#333333',
    modalInputPlaceholder: '#999999',
    modalRadioBorder: '#999999',
    modalRadioSelected: '#007AFF',
    modalOptionSelected: '#E3F2FD',
    modalOptionBorder: '#007AFF',
    customtabs: '#52b7ff',
};

export const darkColors = {
    background: '#121212',
    backgroundWhite: '#1E1E1E',
    card: '#2C2C2C',
    inputBackground: '#2A2A2A',
    navBar: '#1E1E1E',
    tabInactive: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#ffffff',
    textMuted: '#777777',
    border: '#2A2A2A',
    separator: '#333333',
    primary: '#1392ED',
    tabActive: '#41C0FF',
    danger: '#ff4444',
    progressBackground: '#3A3A3A',
    statusPresente: '#1B3A1F',
    statusTarde: '#3A2800',
    statusTextPresente: '#66BB6A',
    statusTextTarde: '#FFA726',
    novedadSuccess: '#388E3C',
    novedadWarning: '#F57C00',
    novedadInfo: '#1565C0',
    cardBorder: '#2A2A2A',
    badgeBackground: '#0D47A1',
    badgeText: '#FFFFFF',
    categoryBackground: '#2A2A2A',
    categoryText: '#FFFFFF',
    backButtonBackground: '#2A2A2A',
    modalBackground: '#2C2C2C',
    modalText: '#FFFFFF',
    modalTextSecondary: '#AAAAAA',
    modalBorder: '#444444',
    modalButton: '#1392ED',
    modalButtonText: '#FFFFFF',
    modalButtonSecondary: '#3A3A3A',
    modalButtonSecondaryText: '#AAAAAA',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    modalInputBackground: '#3A3A3A',
    modalInputText: '#FFFFFF',
    modalInputPlaceholder: '#777777',
    modalRadioBorder: '#AAAAAA',
    modalRadioSelected: '#1392ED',
    modalOptionSelected: '#1A3A5C',
    modalOptionBorder: '#1392ED',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    const colors = useMemo(
        () => (theme === 'dark' ? darkColors : lightColors),
        [theme]
    );

    useEffect(() => {
        const restore = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                const saved = await getThemeForRole(role ?? 'guest');
                setTheme(saved);
            } catch {
                setTheme('light');
            }
        };
        restore();
    }, []);

    const loadThemeForRole = useCallback(async (role) => {
        if (!role) return;
        try {
            const saved = await getThemeForRole(role);
            setTheme(saved);
        } catch {
            setTheme('light');
        }
    }, []);

    const setThemeForRole = useCallback(async (role, newTheme) => {
        if (!role || !newTheme) return;
        try {
            await saveThemeForRole(role, newTheme);
            setTheme(newTheme);
        } catch (e) {
            console.error('Error guardando tema:', e);
        }
    }, []);

    const toggleTheme = useCallback(async () => {
        try {
            const role = await AsyncStorage.getItem('userRole');
            const newTheme = theme === 'light' ? 'dark' : 'light';
            await saveThemeForRole(role, newTheme);
            setTheme(newTheme);
        } catch (e) {
            console.error('Error alternando tema:', e);
        }
    }, [theme]);

    const contextValue = useMemo(() => ({
        theme,
        colors,
        toggleTheme,
        setThemeForRole,
        loadThemeForRole,
    }), [theme, colors, toggleTheme, setThemeForRole, loadThemeForRole]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
    return ctx;
};