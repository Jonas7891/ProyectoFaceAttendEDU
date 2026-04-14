import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';

export default function CustomTabs({ onChange }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [selected, setSelected] = useState(0);
  const { t, i18n } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  // CORRECCIÓN: Manejar cambio de idioma correctamente
  useEffect(() => {
    // Función que se ejecuta cuando cambia el idioma
    const handleLanguageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Suscribirse al evento de cambio de idioma
    i18n.on('languageChanged', handleLanguageChange);

    // Limpiar la suscripción correctamente
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
    <View key={refreshKey} style={styles.container}>
      <TouchableOpacity
        style={[styles.button, selected === 0 && styles.activeButton]}
        onPress={() => handleNavigation(0, "Dashboard")}
      >
        <Text style={[styles.text, selected === 0 && styles.activeText]}>
          {t('tabs.home', { defaultValue: 'Inicio' })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, selected === 1 && styles.activeButton]}
        onPress={() => handleNavigation(1, "Novedades")}
      >
        <Text style={[styles.text, selected === 1 && styles.activeText]}>
          {t('tabs.news', { defaultValue: 'Novedades' })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, selected === 2 && styles.activeButton]}
        onPress={() => handleNavigation(2, "Historial")}
      >
        <Text style={[styles.text, selected === 2 && styles.activeText]}>
          {t('tabs.history', { defaultValue: 'Historial' })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    ...(Platform.OS === "android" && { paddingTop: 40 }),
  },
  button: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: "#41c0ff",
  },
  text: {
    color: "#000",
    fontWeight: "500",
  },
  activeText: {
    fontWeight: "bold",
  },
});