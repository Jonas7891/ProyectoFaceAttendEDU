import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

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
      style={styles.logoutButton} 
      onPress={handleLogout}
      activeOpacity={0.7}
    >
      <Image 
        source={require('../../../assets/images/cerrar-sesion.png')} 
        style={styles.logoutIcon}
      />
      <Text style={styles.logoutText}>{t('menu.logout')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  logoutIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#ff0000',
  },
  logoutText: {
    color: '#ff0000',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LogoutButton;