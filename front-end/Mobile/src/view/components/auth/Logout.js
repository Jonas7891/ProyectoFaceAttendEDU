import React from 'react';
import { TouchableOpacity, Text, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import styleAuth from "./style/Style";

const LogoutButton = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      t('logout.title'),
      t('logout.message'),
      [
        {
          text: t('logout.cancel'),
          style: 'cancel'
        },
        {
          text: t('logout.confirm'),
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Homes' }],
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styleAuth.logoutButton} 
      onPress={handleLogout}
      activeOpacity={0.7}
    >
      <Image 
        source={require('../../../Assets/Images/cerrar-sesion.png')} 
        style={styleAuth.logoutIcon}
      />
      <Text style={styleAuth.logoutText}>{t('menu.logout')}</Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;