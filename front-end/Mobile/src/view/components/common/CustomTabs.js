import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguageRefresh } from '../../../utils/useLanguageRefresh';
import { useTheme } from '../common/ThemeContext';
import stylescommon from './style/Style';

const screens = {
  home: "DashboardScreen", // Cambiado de "Dashboard" a "DashboardScreen"
  history: "Historial",
  DisplayingAttendance: "DisplayingAttendance"
};

const NEWS_screens = {
  admin: "Novedades",
  student: "Novedades",
};

export default function CustomTabs({ onChange, userRole, onLogout }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { colors, theme, loadThemeForRole } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const handleLanguageChange = (newLang) => setSelectedLanguage(newLang);

  const [selected, setSelected] = useState(0);
  const refreshKey = useLanguageRefresh();
  const [currentUserRole, setCurrentUserRole] = useState(userRole);

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

  useEffect(() => {
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  const getTabIndex = (routeName) => {
    switch (routeName) {
      case "DashboardScreen": // Cambiado de "Dashboard" a "DashboardScreen"
      case "Dashboard": // Por si acaso
        return 0;
      case "Novedades":
        return 1;
      case "DisplayingAttendance":
        return 2;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (route?.name) {
      const index = getTabIndex(route.name);
      setSelected(index);
      if (onChange) onChange(index);
    }
  }, [route?.name]);

  const getScreenName = (tabIndex) => {
    switch (tabIndex) {
      case 0: return screens.home;
      case 1: return currentUserRole === 'Administrador'
          ? NEWS_screens.admin
          : NEWS_screens.student;
      case 2: return screens.DisplayingAttendance;
      default: return screens.home;
    }
  };

  const handleNavigation = (index) => {
    setSelected(index);
    if (onChange) onChange(index);
    navigation.navigate(getScreenName(index));
  };

  const getButtonstyle = (index) => {
    if (theme === 'light') {
      return [
        stylescommon.buttonCustomTabs,
        {
          backgroundColor: selected === index
              ? colors.customtabs
              : colors.tabInactive,
          borderRadius: 20,
          marginHorizontal: 5,
        }
      ];
    }

    return [
      stylescommon.buttonCustomTabs,
      {
        backgroundColor: selected === index
            ? colors.primary
            : 'transparent',
        borderRadius: 20,
        marginHorizontal: 5,
      }
    ];
  };

  const getTextstyle = (index) => {
    if (theme === 'light') {
      return [
        stylescommon.textCustomTabs,
        {
          color: '#000000',
          fontWeight: selected === index ? 'bold' : '500',
        }
      ];
    }

    return [
      stylescommon.textCustomTabs,
      {
        color: selected === index ? '#ffffff' : colors.text,
        fontWeight: selected === index ? 'bold' : '500',
      }
    ];
  };

  return (
      <View
          key={refreshKey}
          style={[
            stylescommon.containerCustomTabs,
            {
              flexDirection: 'row',
              backgroundColor:
                  theme === 'dark'
                      ? colors.navBar
                      : 'transparent',
              borderWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              padding: theme === 'dark' ? 5 : 0,
              borderRadius: 25
            }
          ]}
      >
        {[
          t('tabs.home', { defaultValue: 'Inicio' }),
          t('tabs.news', { defaultValue: 'Novedades' }),
          t('tabs.DisplayingAttendance', { defaultValue: 'Asistencias' }),
        ].map((label, index) => (
            <TouchableOpacity
                key={index}
                style={getButtonstyle(index)}
                onPress={() => handleNavigation(index)}
            >
              <Text style={getTextstyle(index)}>
                {label}
              </Text>
            </TouchableOpacity>
        ))}
      </View>
  );
}