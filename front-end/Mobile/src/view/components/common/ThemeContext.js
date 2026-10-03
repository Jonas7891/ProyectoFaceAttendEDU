// ============================================================
//  ThemeContext — tema (claro/oscuro) + color de acento global
//
//  El color "primary" ya no es hardcoded. Se genera en tiempo
//  de ejecución a partir del acento guardado por rol en
//  AsyncStorage con la clave accent_<rol>.
//
//  Expone:
//    theme            — 'light' | 'dark'
//    isDark           — boolean
//    accentColor      — string hex del acento actual
//    colors           — objeto completo con primary dinámico
//    toggleTheme
//    setThemeForRole
//    loadThemeForRole
//    setAccentForRole — (role, hex) => Promise<void>
//    loadAccentForRole— (role) => Promise<void>
// ============================================================
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getThemeForRole, saveThemeForRole} from '../../../utils/themeByRole';

// ── Claves AsyncStorage ──────────────────────────────────────
const ACCENT_KEY = (role) => `accent_${role}`;
const DEFAULT_ACCENT = '#1392ED';

// ── Paleta base claro (sin primary/tabActive — se inyectan) ─
const baseLightColors = {
    background:              '#F5F5F5',
    backgroundWhite:         '#FFFFFF',
    card:                    '#FFFFFF',
    inputBackground:         '#FFFFFF',
    navBar:                  '#EDEDED',
    tabInactive:             '#D9D9D9',
    text:                    '#000000',
    textSecondary:           '#666666',
    textSecondaryButtons:    '#000000',
    textMuted:               '#999999',
    separator:               '#D0D0D0',
    danger:                  '#ff0000',
    progressBackground:      '#E0E0E0',
    statusPresente:          '#E8F5E9',
    statusTarde:             '#FFF3E0',
    statusTextPresente:      '#2da351',
    statusTextTarde:         '#E65100',
    novedadSuccess:          '#2da351',
    novedadWarning:          '#FF9800',
    novedadInfo:             '#2196F3',
    cardBorder:              '#E5E5E5',
    border:                  '#E0E0E0',
    badgeBackground:         '#E3F2FD',
    badgeText:               '#1392ED',
    categoryBackground:      '#F0F4F8',
    categoryText:            '#333333',
    backButtonBackground:    '#F5F5F5',
    modalBackground:         '#FFFFFF',
    modalText:               '#1a1a1a',
    modalTextSecondary:      '#666666',
    modalBorder:             '#E0E0E0',
    modalButton:             '#007AFF',
    modalButtonText:         '#FFFFFF',
    modalButtonSecondary:    '#F5F5F5',
    modalButtonSecondaryText:'#666666',
    modalOverlay:            'rgba(0, 0, 0, 0.5)',
    modalInputBackground:    '#F9F9F9',
    modalInputText:          '#333333',
    modalInputPlaceholder:   '#999999',
    modalRadioBorder:        '#999999',
    modalRadioSelected:      '#007AFF',
    modalOptionSelected:     '#E3F2FD',
    modalOptionBorder:       '#007AFF',
    success:                 '#2da351',
    warning:                 '#FF9800',
};

// ── Paleta base oscuro ───────────────────────────────────────
const baseDarkColors = {
    background:              '#121212',
    backgroundWhite:         '#1E1E1E',
    card:                    '#2C2C2C',
    inputBackground:         '#2A2A2A',
    navBar:                  '#1E1E1E',
    tabInactive:             '#2A2A2A',
    text:                    '#FFFFFF',
    textSecondary:           '#AAAAAA',
    textSecondaryButtons:    '#FFFFFF',
    textMuted:               '#777777',
    border:                  '#2A2A2A',
    separator:               '#333333',
    danger:                  '#ff4444',
    progressBackground:      '#3A3A3A',
    statusPresente:          '#1B3A1F',
    statusTarde:             '#3A2800',
    statusTextPresente:      '#66BB6A',
    statusTextTarde:         '#FFA726',
    novedadSuccess:          '#388E3C',
    novedadWarning:          '#F57C00',
    novedadInfo:             '#1565C0',
    cardBorder:              '#2A2A2A',
    badgeBackground:         '#0D47A1',
    badgeText:               '#FFFFFF',
    categoryBackground:      '#2A2A2A',
    categoryText:            '#FFFFFF',
    backButtonBackground:    '#2A2A2A',
    modalBackground:         '#2C2C2C',
    modalText:               '#FFFFFF',
    modalTextSecondary:      '#AAAAAA',
    modalBorder:             '#444444',
    modalButton:             '#1392ED',
    modalButtonText:         '#FFFFFF',
    modalButtonSecondary:    '#3A3A3A',
    modalButtonSecondaryText:'#AAAAAA',
    modalOverlay:            'rgba(0, 0, 0, 0.7)',
    modalInputBackground:    '#3A3A3A',
    modalInputText:          '#FFFFFF',
    modalInputPlaceholder:   '#777777',
    modalRadioBorder:        '#AAAAAA',
    modalRadioSelected:      '#1392ED',
    modalOptionSelected:     '#1A3A5C',
    modalOptionBorder:       '#1392ED',
    success:                 '#2da351',
    warning:                 '#FF9800',
};

// ── Genera la paleta completa inyectando el acento ───────────
function buildColors(isDark, accent) {
    const base = isDark ? baseDarkColors : baseLightColors;
    // tabActive = versión más clara del acento (añade transparencia)
    const tabActive = accent + 'CC'; // 80% opacidad
    // primaryLight = acento con mucha transparencia para fondos suaves
    const primaryLight = accent + '20';
    return {
        ...base,
        primary:          accent,
        tabActive:        tabActive,
        primaryLight:     primaryLight,
        customtabs:       tabActive,
        // badgeBackground y modalOptionSelected también adoptan el acento
        badgeBackground:  primaryLight,
        badgeText:        accent,
        modalOptionSelected: primaryLight,
        modalOptionBorder:   accent,
        modalRadioSelected:  accent,
    };
}

// ── Helpers AsyncStorage para acento ────────────────────────
export async function getAccentForRole(role, fallback = DEFAULT_ACCENT) {
    if (!role) return fallback;
    try {
        const saved = await AsyncStorage.getItem(ACCENT_KEY(role));
        return saved ?? fallback;
    } catch {
        return fallback;
    }
}

export async function saveAccentForRole(role, hex) {
    if (!role || !hex) return;
    await AsyncStorage.setItem(ACCENT_KEY(role), hex);
}

// ── Contexto ─────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({children}) {
    const [theme, setTheme]           = useState('light');
    const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);

    const isDark = theme === 'dark';

    // Paleta completa, recalculada cuando cambia tema o acento
    const colors = useMemo(
        () => buildColors(isDark, accentColor),
        [isDark, accentColor]
    );

    // ── Carga inicial ─────────────────────────────────────────
    useEffect(() => {
        const restore = async () => {
            try {
                const role  = await AsyncStorage.getItem('userRole');
                const saved = await getThemeForRole(role ?? 'guest');
                const accent = await getAccentForRole(role ?? 'guest');
                setTheme(saved);
                setAccentColor(accent);
            } catch {
                setTheme('light');
                setAccentColor(DEFAULT_ACCENT);
            }
        };
        restore();
    }, []);

    // ── loadThemeForRole ──────────────────────────────────────
    const loadThemeForRole = useCallback(async (role) => {
        if (!role) return;
        try {
            const saved  = await getThemeForRole(role);
            const accent = await getAccentForRole(role);
            setTheme(saved);
            setAccentColor(accent);
        } catch {
            setTheme('light');
        }
    }, []);

    // ── loadAccentForRole ─────────────────────────────────────
    const loadAccentForRole = useCallback(async (role) => {
        if (!role) return;
        try {
            const accent = await getAccentForRole(role);
            setAccentColor(accent);
        } catch {
            setAccentColor(DEFAULT_ACCENT);
        }
    }, []);

    // ── setThemeForRole ───────────────────────────────────────
    const setThemeForRole = useCallback(async (role, newTheme) => {
        if (!role || !newTheme) return;
        try {
            await saveThemeForRole(role, newTheme);
            setTheme(newTheme);
        } catch (e) {
            console.error('Error guardando tema:', e);
        }
    }, []);

    // ── setAccentForRole ──────────────────────────────────────
    const setAccentForRole = useCallback(async (role, hex) => {
        if (!role || !hex) return;
        try {
            await saveAccentForRole(role, hex);
            setAccentColor(hex);
        } catch (e) {
            console.error('Error guardando acento:', e);
        }
    }, []);

    // ── toggleTheme ───────────────────────────────────────────
    const toggleTheme = useCallback(async () => {
        try {
            const role     = await AsyncStorage.getItem('userRole');
            const newTheme = isDark ? 'light' : 'dark';
            await saveThemeForRole(role, newTheme);
            setTheme(newTheme);
        } catch (e) {
            console.error('Error alternando tema:', e);
        }
    }, [isDark]);

    const contextValue = useMemo(
        () => ({
            theme,
            isDark,
            accentColor,
            colors,
            toggleTheme,
            setThemeForRole,
            loadThemeForRole,
            setAccentForRole,
            loadAccentForRole,
        }),
        [
            theme, isDark, accentColor, colors,
            toggleTheme, setThemeForRole, loadThemeForRole,
            setAccentForRole, loadAccentForRole,
        ]
    );

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

// Exportaciones legacy para compatibilidad con código existente
export const lightColors = buildColors(false, DEFAULT_ACCENT);
export const darkColors  = buildColors(true,  DEFAULT_ACCENT);
