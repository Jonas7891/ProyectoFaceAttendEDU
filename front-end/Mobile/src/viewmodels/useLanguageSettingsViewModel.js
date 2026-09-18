import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {saveLanguageForRole} from '../view/components/common/languageByRole';
import {useTheme} from '../view/components/common/ThemeContext';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {getCurrentUserRole} from "../services/UserService";

export function useLanguageSettingsViewModel() {
    const {t, i18n} = useTranslation();
    const navigation = useNavigation();
    const {theme, setThemeForRole, loadThemeForRole} = useTheme();

    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
    const [selectedTheme, setSelectedTheme] = useState(theme);
    const [isLoading, setIsLoading] = useState(false);

    const updateKey = useLanguageRefresh();

    // ---- Estado de alerta centralizado ----
    const [alertData, setAlertData] = useState({
        message: null,
        type: 'warning',
        timestamp: 0,
    });

    const clearAlert = useCallback(() => {
        setAlertData({message: null, type: 'warning', timestamp: 0});
    }, []);

    // Listas de idiomas y temas
    const languages = useMemo(() => [
        {code: 'es', name: 'Español', flag: '🇪🇸'},
        {code: 'en', name: 'English', flag: '🇬🇧'},
        {code: 'fr', name: 'Français', flag: '🇫🇷'},
        {code: 'pt', name: 'Português', flag: '🇵🇹'},
    ], []);

    const themes = useMemo(() => [
        {code: 'light', label: t('settings.lightTheme'), icon: '☀️'},
        {code: 'dark', label: t('settings.darkTheme'), icon: '🌙'},
    ], [t]);

    // Sincronizar idioma cuando cambia externamente
    useEffect(() => {
        if (i18n.language !== selectedLanguage) {
            setSelectedLanguage(i18n.language);
        }
    }, [i18n.language]);

    // Sincronizar tema desde contexto global
    useEffect(() => {
        setSelectedTheme(theme);
    }, [theme]);

    // Al recibir foco, cargar tema del rol
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const syncTheme = async () => {
                try {
                    const role = await getCurrentUserRole();
                    if (role && isActive) {
                        await loadThemeForRole(role);
                    }
                } catch (error) {
                    console.error('Error syncing theme:', error);
                }
            };
            syncTheme();
            return () => {
                isActive = false;
            };
        }, [loadThemeForRole])
    );

    // Acción de guardar
    const handleSave = useCallback(async () => {
        setIsLoading(true);
        try {
            const role = await getCurrentUserRole();
            if (!role) {
                setAlertData({
                    message: t('settings.noRoleError'),
                    type: 'error',
                    timestamp: Date.now(),
                });
                return;
            }

            if (i18n.language !== selectedLanguage) {
                await i18n.changeLanguage(selectedLanguage);
            }

            await saveLanguageForRole(role, selectedLanguage);
            await setThemeForRole(role, selectedTheme);

            await new Promise(resolve => setTimeout(resolve, 100));

            setAlertData({
                message: t('settings.languageChanged'),
                type: 'success',
                timestamp: Date.now(),
            });
        } catch (error) {
            console.error('Error guardando:', error);
            setAlertData({
                message: t('settings.errorChangingLanguage'),
                type: 'error',
                timestamp: Date.now(),
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedLanguage, selectedTheme, i18n, t, setThemeForRole]);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    return {
        selectedLanguage,
        setSelectedLanguage,
        selectedTheme,
        setSelectedTheme,
        isLoading,
        updateKey,
        languages,
        themes,
        handleSave,
        handleBack,
        alertData,
        clearAlert,
    };
}
