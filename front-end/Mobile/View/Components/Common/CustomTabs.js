import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function CustomTabs({ onChange }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [selected, setSelected] = useState(0);

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
  }, [route?.name]);

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
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, selected === 0 && styles.activeButton]}
        onPress={() => handleNavigation(0, "Dashboard")}
      >
        <Text style={[styles.text, selected === 0 && styles.activeText]}>
          Inicio
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, selected === 1 && styles.activeButton]}
        onPress={() => handleNavigation(1, "Novedades")}
      >
        <Text style={[styles.text, selected === 1 && styles.activeText]}>
          Novedades
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, selected === 2 && styles.activeButton]}
        onPress={() => handleNavigation(2, "Historial")}
      >
        <Text style={[styles.text, selected === 2 && styles.activeText]}>
          Historial
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