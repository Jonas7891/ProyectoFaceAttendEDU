import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import styleAuth from "./style/Style";

export default function DangerButton({ 
  title, 
  disabled = false 
}) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleLogout = async () => {

    Alert.alert(
      t('logout.title', 'Cerrar sesión'),
      t('logout.confirmation', '¿Estás seguro de que quieres cerrar sesión?'),
      [
        {
          text: t('logout.cancel', 'Cancelar'),
          style: 'cancel',
        },
        {
          text: t('logout.confirm', 'Sí, cerrar sesión'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userRole');
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('userToken');
              navigation.replace('login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <TouchableOpacity
      style={[styleAuth.dangerButton, disabled && styleAuth.buttonDisabled]}
      onPress={handleLogout}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styleAuth.dangerButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}