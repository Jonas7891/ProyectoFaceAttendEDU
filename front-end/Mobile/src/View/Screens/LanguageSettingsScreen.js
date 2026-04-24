import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../components/common/languageByRole";
import { useTheme } from '../components/common/ThemeContext';
import PrimaryButton from '../components/auth/PrimaryButton';
import styles from './Style';

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { theme, colors, setThemeForRole, loadThemeForRole } = useTheme();

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Sincronizar idioma ───────────────────────────────────────────────────
  useEffect(() => {
    const handleLanguageChange = (newLang) => {
      setSelectedLanguage(newLang);
      setRefreshKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  useEffect(() => { setSelectedLanguage(i18n.language); }, [i18n.language]);

  // ─── Sincronizar tema desde contexto ─────────────────────────────────────
  useEffect(() => { setSelectedTheme(theme); }, [theme]);

  useFocusEffect(
    useCallback(() => {
      const syncTheme = async () => {
        const role = await AsyncStorage.getItem('userRole');

        if (role) {
          await loadThemeForRole(role);
        }
      };

      syncTheme();
    }, [])
  );

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const themes = [
    { code: 'light', label: t('settings.lightTheme', { defaultValue: 'Tema Claro' }), icon: '☀️' },
    { code: 'dark', label: t('settings.darkTheme', { defaultValue: 'Tema Oscuro' }), icon: '🌙' },
  ];

  // ─── Guardar ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const role = await AsyncStorage.getItem('userRole');

      // Idioma
      await i18n.changeLanguage(selectedLanguage);
      await saveLanguageForRole(role);

      await setThemeForRole(role, selectedTheme);

      Alert.alert(t('common.success'), t('settings.languageChanged'), [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch {
      Alert.alert(t('common.error'), t('settings.errorChangingLanguage'));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.languageSettingsSafeArea, { backgroundColor: colors.background }]}
      key={refreshKey}
    >
      <ScrollView contentContainerstyle={styles.languageSettingsContainer} marginHorizontal={15}>

        <Text style={[styles.languageSettingsTitle, { color: colors.text, marginTop: 30 }]}>
          {t('settings.language')}
        </Text>
        <Text style={[styles.languageSettingsSubtitle, { color: colors.textSecondary }]}>
          {t('settings.selectLanguage')}
        </Text>

        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageSettingsOption,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedLanguage === lang.code && { borderColor: colors.primary },
            ]}
            onPress={() => setSelectedLanguage(lang.code)}
          >
            <Text style={[styles.languageSettingsOptionText, { color: colors.text }]}>
              {lang.flag}  {lang.name}
            </Text>
            {selectedLanguage === lang.code && (
              <Text style={[styles.languageSettingsCheckmark, { color: colors.primary }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={[styles.languageSettingsTitle, { marginTop: 28, color: colors.text }]}>
          {t('settings.theme', { defaultValue: 'Apariencia' })}
        </Text>
        <Text style={[styles.languageSettingsSubtitle, { color: colors.textSecondary }]}>
          {t('settings.selectTheme', { defaultValue: 'Selecciona el tema de la aplicación' })}
        </Text>

        {themes.map((th) => (
          <TouchableOpacity
            key={th.code}
            style={[
              styles.languageSettingsOption,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedTheme === th.code && { borderColor: colors.primary },
            ]}
            onPress={() => setSelectedTheme(th.code)}
          >
            <Text style={[styles.languageSettingsOptionText, { color: colors.text }]}>
              {th.icon}  {th.label}
            </Text>
            {selectedTheme === th.code && (
              <Text style={[styles.languageSettingsCheckmark, { color: colors.primary }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        <PrimaryButton
          title={t('common.save')}
          onPress={handleSave}
          isLoading={isLoading}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.secondaryButton}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}