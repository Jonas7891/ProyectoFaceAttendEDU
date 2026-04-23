import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageSelectorProps {
  isVisible: boolean;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isVisible, onClose }) => {
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const languages = [
    { code: 'es', name: '🇪🇸 Español', label: 'Español' },
    { code: 'en', name: '🇬🇧 English', label: 'English' },
    { code: 'fr', name: '🇫🇷 Français', label: 'Français' },
    { code: 'pt', name: '🇵🇹 Português', label: 'Português' },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem('appLanguage', languageCode);
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{t('settings.selectLanguage')}</Text>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.option,
                selectedLanguage === lang.code && styles.selectedOption,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={styles.optionText}>{lang.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#e0f7fa',
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
  },
});

export default LanguageSelector;