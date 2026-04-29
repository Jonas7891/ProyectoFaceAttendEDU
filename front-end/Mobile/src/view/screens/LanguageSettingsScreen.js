import React, { useState, useEffect, useCallback } from 'react';
import { Text, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
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
  const [componentKey, setComponentKey] = useState(0);

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

  // ✅ CORREGIDO: Sin dependencia problemática
  useEffect(() => {
    const handleLanguageChange = (newLang) => {
      console.log('Idioma cambiado a:', newLang);
      setSelectedLanguage(newLang);
      setComponentKey(prev => prev + 1);
    };

    setSelectedLanguage(i18n.language);

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []); // ← Array vacío = solo se ejecuta al montar

  // Sincronizar tema
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  // Cargar tema al enfocar
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
    }, [])
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const role = await AsyncStorage.getItem('userRole');

      if (!role) {
        Alert.alert(
          t('common.error'),
          t('settings.noRoleError', { defaultValue: 'No se pudo determinar el rol del usuario' })
        );
        setIsLoading(false);
        return;
      }

      console.log('💾 Guardando configuración:', {
        role,
        selectedLanguage,
        selectedTheme,
        currentLanguage: i18n.language
      });

      // 1. Cambiar idioma si es diferente
      if (i18n.language !== selectedLanguage) {
        await i18n.changeLanguage(selectedLanguage);
        console.log('🔄 Idioma cambiado a:', selectedLanguage);
      }

      // 2. Guardar preferencias
      await saveLanguageForRole(role, selectedLanguage);
      await setThemeForRole(role, selectedTheme);

      // 3. Pequeña pausa para procesar listeners
      await new Promise(resolve => setTimeout(resolve, 100));

      // 4. Mostrar alerta y navegar
      Alert.alert(
        t('common.success'),
        t('settings.languageChanged'),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('❌ Error guardando:', error);
      Alert.alert(
        t('common.error'),
        t('settings.errorChangingLanguage')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.languageSettingsSafeArea, { backgroundColor: colors.background }]}
      key={componentKey}
    >
      <ScrollView
        contentContainerStyle={styles.languageSettingsContainer}
        style={{ marginHorizontal: 15 }}
      >
        {/* Sección de idioma */}
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

        {/* Sección de tema */}
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

        {/* Botones */}
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