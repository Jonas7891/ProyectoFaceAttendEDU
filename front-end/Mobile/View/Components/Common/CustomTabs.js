import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import stylesCommon from './Style/Style';

export default function CustomTabs({ onChange }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [selected, setSelected] = useState(0);
  const { t, i18n } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleLanguageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const getTabIndex = (routeName) => {
    switch (routeName) {
      case 'Dashboard':
      case 'Inicio':
        return 0;
      case 'Novedades':
        return 1;
      case 'Historial':
        return 2;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (route?.name) {
      const currentIndex = getTabIndex(route.name);
      setSelected(currentIndex);
      if (onChange) onChange(currentIndex);
    }
  }, [route?.name, onChange]);

  const handleNavigation = (index, screenName) => {
    setSelected(index);
    if (onChange) onChange(index);
    
    if (screenName === 'Dashboard' || screenName === 'Inicio') {
      navigation.navigate({
        name: screenName,
        params: {},
        merge: true,
      });
    } else {
      navigation.navigate(screenName);
    }
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