import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function CustomTabs({ onChange }) {
  const [selected, setSelected] = useState(0);

  const HandleInicio = () => {
    setSelected(0);
    if (onChange) onChange(0);
  };

  const HandleNovedades = () => {
    setSelected(1);
    if (onChange) onChange(1);
  };

  const HandleHistorial = () => {
    setSelected(2);
    if (onChange) onChange(2);
  };

  return (
    <View style={styles.container}>
      
      <TouchableOpacity
        style={[styles.button, selected === 0 && styles.activeButton]}
        onPress={HandleInicio}
      >
        <Text style={[styles.text, selected === 0 && styles.activeText]}>
          Inicio
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, selected === 1 && styles.activeButton]}
        onPress={HandleNovedades}
      >
        <Text style={[styles.text, selected === 1 && styles.activeText]}>
          Novedades
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, selected === 2 && styles.activeButton]}
        onPress={HandleHistorial}
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