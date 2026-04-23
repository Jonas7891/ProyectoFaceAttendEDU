import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from '../Components/Auth/PrimaryButton';
import i18n from '../../utils/i18n';

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleLanguageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

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
      await AsyncStorage.setItem('appLanguage', selectedLanguage);
      
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('settings.language')}</Text>
        <Text style={styles.subtitle}>{t('settings.selectLanguage')}</Text>

        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.option,
              selectedLanguage === lang.code && styles.selectedOption,
            ]}
            onPress={() => setSelectedLanguage(lang.code)}
          >
            <Text style={styles.optionText}>{lang.flag} {lang.name}</Text>
            {selectedLanguage === lang.code && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}

        <PrimaryButton title={t('common.save')} onPress={handleSave} isLoading={isLoading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 30, textAlign: 'center', color: '#666' },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedOption: { borderColor: '#41c0ff', backgroundColor: '#E0F7FA', borderWidth: 2 },
  optionText: { fontSize: 16 },
  checkmark: { fontSize: 18, color: '#41c0ff', fontWeight: 'bold' },
});