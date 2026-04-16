import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import stylesCommon from "./Style/Style";

export default function BottomBar() {
  const navigation = useNavigation();

  const handleMenu = () => {
    navigation.navigate("Menu");
  };

  const handleFoto = () => {
    navigation.navigate("UpdatePhoto");
  };

  const handleBusqueda = () => {
    navigation.navigate("Busqueda");
  };

  return (

    <View style={stylesCommon.navBarContainer} >

      <TouchableOpacity onPress={handleMenu}>
        <Image
          source={require("../../../assets/images/configuraciones.png")}
          style={stylesCommon.navIcon}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleFoto}>
        <Image
          source={require("../../../assets/images/perfil-del-usuario.png")}
          style={stylesCommon.navIconCenter}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleBusqueda}>
        <Image
          source={require("../../../assets/images/lupa.png")}
          style={stylesCommon.navIcon}
        />
      </TouchableOpacity>

    </View>
  );
}