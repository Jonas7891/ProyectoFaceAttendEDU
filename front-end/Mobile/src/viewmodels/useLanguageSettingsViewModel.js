// viewmodels/useLanguageSettingsViewModel.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { saveLanguageForRole } from '../view/components/common/languageByRole';
import { useTheme } from '../view/components/common/ThemeContext';

export function useLanguageSettingsViewModel() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const { theme, setThemeForRole, loadThemeForRole } = useTheme();

    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
    const [selectedTheme, setSelectedTheme] = useState(theme);
    const [isLoading, setIsLoading] = useState(false);
    const [componentKey, setComponentKey] = useState(0);

    // Listas de idiomas y temas
    const languages = useMemo(() => [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
    ], []);

    const themes = useMemo(() => [
        { code: 'light', label: t('settings.lightTheme', { defaultValue: 'Tema Claro' }), icon: '☀️' },
        { code: 'dark', label: t('settings.darkTheme', { defaultValue: 'Tema Oscuro' }), icon: '🌙' },
    ], [t]);

    // Sincronizar cambios de idioma desde i18n
    useEffect(() => {
        const handleLanguageChange = (newLang) => {
            setSelectedLanguage(newLang);
            setComponentKey(prev => prev + 1);
        };
        i18n.on('languageChanged', handleLanguageChange);
        setSelectedLanguage(i18n.language);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

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
                    const role = await AsyncStorage.getItem('userRole');
                    if (role && isActive) {
                        await loadThemeForRole(role);
                    }
                } catch (error) {
                    console.error('Error syncing theme:', error);
                }
            };
            syncTheme();
            return () => { isActive = false; };
        }, [loadThemeForRole])
    );

    // Acción de guardar
    const handleSave = useCallback(async () => {
        setIsLoading(true);
        try {
            const role = await AsyncStorage.getItem('userRole');
            if (!role) {
                Alert.alert(t('common.error'), t('settings.noRoleError', { defaultValue: 'No se pudo determinar el rol del usuario' }));
                setIsLoading(false);
                return;
            }

            if (i18n.language !== selectedLanguage) {
                await i18n.changeLanguage(selectedLanguage);
            }

            await saveLanguageForRole(role, selectedLanguage);
            await setThemeForRole(role, selectedTheme);

            await new Promise(resolve => setTimeout(resolve, 100));

            Alert.alert(t('common.success'), t('settings.languageChanged'), [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error guardando:', error);
            Alert.alert(t('common.error'), t('settings.errorChangingLanguage'));
        } finally {
            setIsLoading(false);
        }
    }, [selectedLanguage, selectedTheme, i18n, t, navigation, saveLanguageForRole, setThemeForRole]);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    return {
        selectedLanguage,
        setSelectedLanguage,
        selectedTheme,
        setSelectedTheme,
        isLoading,
        componentKey,
        languages,
        themes,
        handleSave,
        handleBack,
    };
}