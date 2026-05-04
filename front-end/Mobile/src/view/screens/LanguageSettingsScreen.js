import React from 'react';
import { Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../components/common/ThemeContext';
import PrimaryButton from '../components/auth/PrimaryButton';
import styles from './Style';
import { useLanguageSettingsViewModel } from '../../viewmodels/useLanguageSettingsViewModel';

export default function LanguageSettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
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
  } = useLanguageSettingsViewModel();

  return (
      <SafeAreaView
          style={[styles.languageSettingsSafeArea, { backgroundColor: colors.background }]}
          key={componentKey}
      >
        <ScrollView
            contentContainerStyle={styles.languageSettingsContainer}
            style={{ marginHorizontal: 5 }}
        >
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
                    selectedLanguage === lang.code && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary + '20',
                    },
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
                    selectedTheme === th.code && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary + '20',
                    },
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
              onPress={handleBack}
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