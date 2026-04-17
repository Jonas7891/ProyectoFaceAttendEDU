import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylesCommon from './Style/Style';

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
      <View style={stylesCommon.languageOverlay}>
        <View style={stylesCommon.languageModal}>
          <Text style={stylesCommon.languageTitle}>{t('settings.selectLanguage')}</Text>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                stylesCommon.languageOption,
                selectedLanguage === lang.code && stylesCommon.languageSelectedOption,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={stylesCommon.languageOptionText}>{lang.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={stylesCommon.languageCloseButton} onPress={onClose}>
            <Text style={stylesCommon.languageCloseText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageSelector;