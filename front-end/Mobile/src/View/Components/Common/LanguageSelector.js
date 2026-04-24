import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylescommon from './style/Style';

const languages = [
  { code: 'es', name: '🇪🇸 Español' },
  { code: 'en', name: '🇬🇧 English' },
  { code: 'fr', name: '🇫🇷 Français' },
  { code: 'pt', name: '🇵🇹 Português' },
];
const LanguageSelector = ({ isVisible, onClose }) => {
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  
  const handleLanguageChange = async (languageCode) => {
    setSelectedLanguage(languageCode);
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem('appLanguage', languageCode);
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={stylescommon.languageOverlay}>
        <View style={stylescommon.languageModal}>
          <Text style={stylescommon.languageTitle}>{t('settings.selectLanguage')}</Text>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                stylescommon.languageOption,
                selectedLanguage === lang.code && stylescommon.languageSelectedOption,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={stylescommon.languageOptionText}>{lang.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={stylescommon.languageCloseButton} onPress={onClose}>
            <Text style={stylescommon.languageCloseText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageSelector;