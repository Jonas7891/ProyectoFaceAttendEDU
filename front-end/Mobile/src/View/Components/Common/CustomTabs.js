import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylesCommon from './Style/Style';

const SCREENS = {
  home: "Dashboard",
  history: "Historial",
};

const NEWS_SCREENS = {
  admin: "Novedades",
  student: "Novedades",
};

export default function CustomTabs({ onChange, userRole }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState(userRole);

  // ─── Carga de rol ────────────────────────────────────────────────────────
  useEffect(() => {
    if (userRole) {
      setCurrentUserRole(userRole);
      return;
    }
    const loadUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setCurrentUserRole(role);
    };
    loadUserRole();
  }, [userRole]);

  // ─── Cambio de idioma ─────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);

      await restoreLanguageForRole(role);
    };
    init();

    const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  // ─── Sincronizar tab activo con la ruta actual ────────────────────────────
  const getTabIndex = (routeName) => {
    switch (routeName) {
      case "Dashboard": return 0;
      case "Novedades": return 1;
      case "Historial": return 2;
      default: return 0;
    }
  };

  useEffect(() => {
    if (route?.name) {
      const index = getTabIndex(route.name);
      setSelected(index);
      if (onChange) onChange(index);
    }
  }, [route?.name]);

  // ─── Navegación ──────────────────────────────────────────────────────────
  const getScreenName = (tabIndex) => {
    switch (tabIndex) {
      case 0: return SCREENS.home;
      case 1: return currentUserRole === 'admin'
        ? NEWS_SCREENS.admin
        : NEWS_SCREENS.student;
      case 2: return SCREENS.history;
      default: return SCREENS.home;
    }
  };

  const handleNavigation = (index) => {
    setSelected(index);
    if (onChange) onChange(index);
    navigation.navigate(getScreenName(index));
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View key={refreshKey} style={stylesCommon.containerCustomTabs}>
      {[
        t('tabs.home', { defaultValue: 'Inicio' }),
        t('tabs.news', { defaultValue: 'Novedades' }),
        t('tabs.history', { defaultValue: 'Historial' }),
      ].map((label, index) => (
        <TouchableOpacity
          key={index}
          style={[
            stylesCommon.buttonCustomTabs,
            selected === index && stylesCommon.activeButtonCustomTabs,
          ]}
          onPress={() => handleNavigation(index)}
        >
          <Text style={[
            stylesCommon.textCustomTabs,
            selected === index && stylesCommon.activeTextCustomTabs,
          ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}