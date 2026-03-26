import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";

export default function BottomBar({ onPressSettings, onPressProfile, onPressSearch }) {
  const handleMenu = () => {
    navigation.navigate(Menu);
  };

  const handleFoto = () => {
    navigation.navigate(Foto);
  };

  const handleBusqueda = () => {
    navigation.navigate(Busqueda);
  };

  return (

    <View style={styles.container} >

      <TouchableOpacity onPress={onPressSettings}>
        <Image
          source={require("../../assets/images/configuraciones.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onPressProfile}>
        <Image
          source={require("../../assets/images/perfil-del-usuario.png")}
          style={styles.iconCenter}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onPressSearch}>
        <Image
          source={require("../../assets/images/lupa.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: "#EDEDED",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: "#000",
  },
  iconCenter: {
    width: 40,
    height: 40,
    tintColor: "#000",
  },
});