import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
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

  useEffect(() => {
    const handleLanguageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    loadUserRole();
  }, [userRole]);

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
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
  
  return (
    <View key={refreshKey} style={stylesCommon.containerCustomTabs}>
      <TouchableOpacity
        style={[stylesCommon.buttonCustomTabs, selected === 0 && stylesCommon.activeButtonCustomTabs]}
        onPress={() => handleNavigation(0, "Dashboard")}
      >
        <Text style={[stylesCommon.textCustomTabs, selected === 0 && stylesCommon.activeTextCustomTabs]}>
          {t('tabs.home', { defaultValue: 'Inicio' })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[stylesCommon.buttonCustomTabs, selected === 1 && stylesCommon.activeButtonCustomTabs]}
        onPress={() => handleNavigation(1, "Novedades")}
      >
        <Text style={[stylesCommon.textCustomTabs, selected === 1 && stylesCommon.activeTextCustomTabs]}>
          {t('tabs.news', { defaultValue: 'Novedades' })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[stylesCommon.buttonCustomTabs, selected === 2 && stylesCommon.activeButtonCustomTabs]}
        onPress={() => handleNavigation(2, "Historial")}
      >
        <Text style={[stylesCommon.textCustomTabs, selected === 2 && stylesCommon.activeTextCustomTabs]}>
          {t('tabs.history', { defaultValue: 'Historial' })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}