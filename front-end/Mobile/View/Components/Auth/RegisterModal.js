import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import stylesAuth from "./Style/Style";

export default function RegisterModal({ isVisible, onClose }) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={stylesAuth.overlayRegister}>
        <View style={stylesAuth.modalContainerRegister}>
          <Text style={stylesAuth.titleRegister}>{t('registerModal.title')}</Text>

          <ScrollView
            style={stylesAuth.contentRegister}
            showsVerticalScrollIndicator={false}
          >
            <Text style={stylesAuth.paragraphRegister}>
              {t('registerModal.description')}
            </Text>
          </ScrollView>

          <TouchableOpacity style={stylesAuth.buttonRegister} onPress={onClose}>
            <Text style={stylesAuth.buttonTextRegister}>{t('registerModal.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}