import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../Components/Common/languageByRole";
import PrimaryButton from '../Components/Auth/PrimaryButton';
import styles from './Style';

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const handleBack = () => {
    navigation.goBack();
  };
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleLanguageChange = (newLang) => {
      setSelectedLanguage(newLang);
      setRefreshKey(prev => prev + 1);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await i18n.changeLanguage(selectedLanguage);

      const role = await AsyncStorage.getItem('userRole');
      await saveLanguageForRole(role);

      Alert.alert(t('common.success'), t('settings.languageChanged'), [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.errorChangingLanguage'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.languageSettingsSafeArea} key={refreshKey}>
      <View style={styles.languageSettingsContainer}>

        <Text style={styles.languageSettingsTitle} marginTop={20}>
          {t('settings.language')}
        </Text>
        <Text style={styles.languageSettingsSubtitle}>
          {t('settings.selectLanguage')}
        </Text>

        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageSettingsOption,
              selectedLanguage === lang.code && styles.languageSettingsSelectedOption,
            ]}
            onPress={() => setSelectedLanguage(lang.code)}
          >
            <Text style={styles.languageSettingsOptionText}>{lang.flag} {lang.name}</Text>
            {selectedLanguage === lang.code && (
              <Text style={styles.languageSettingsCheckmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        <PrimaryButton
          title={t('common.save')}
          onPress={handleSave}
          isLoading={isLoading}
        />
        {/* Botón Volver secundario */}
        <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}