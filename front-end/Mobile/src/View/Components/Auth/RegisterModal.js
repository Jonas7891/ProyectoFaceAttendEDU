import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../common/ThemeContext';
import stylesauth from "./style/Style";

export default function RegisterModal({ isVisible, onClose }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[stylesauth.overlayRegister, { backgroundColor: colors.modalOverlay }]}>
        <View style={[stylesauth.modalContainerRegister, { backgroundColor: colors.modalBackground }]}>
          <Text style={[stylesauth.titleRegister, { color: colors.modalText }]}>{t('registerModal.title')}</Text>

          <ScrollView
            style={stylesauth.contentRegister}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[stylesauth.paragraphRegister, { color: colors.modalTextSecondary }]}>
              {t('registerModal.description')}
            </Text>
          </ScrollView>

          <TouchableOpacity style={[stylesauth.buttonRegister, { backgroundColor: colors.modalButton }]} onPress={onClose}>
            <Text style={[stylesauth.buttonTextRegister, { color: colors.modalButtonText }]}>{t('registerModal.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}