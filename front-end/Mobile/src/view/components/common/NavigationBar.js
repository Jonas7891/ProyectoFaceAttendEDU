import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from '../common/ThemeContext';
import stylescommon from "./style/Style";

export default function BottomBar({ onPressSettings, onPressProfile, onPressSearch, screenNames = {} }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, loadThemeForRole, toggleTheme } = useTheme();

  const [selected, setSelected] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loadUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);

      if (role) {
        await loadThemeForRole(role);
      }

    };
    loadUserRole();
  }, []);

  const defaultscreens = {
    menu: "Menu",
    profile: "UpdatePhoto",
    search: "Busqueda",
  };

  const {
    menu: menuScreen = defaultscreens.menu,
    profile: profileScreen = defaultscreens.profile,
    search: searchScreen = defaultscreens.search,
  } = screenNames;

  const handleMenu = () => onPressSettings ? onPressSettings() : navigation.navigate(menuScreen);
  const handleFoto = () => onPressProfile ? onPressProfile() : navigation.navigate(profileScreen);
  const handleBusqueda = () => onPressSearch ? onPressSearch() : navigation.navigate(searchScreen);

  const getSelectedButton = (routeName) => {
    switch (routeName) {
      case "Menu": return "menu";
      case "UpdatePhoto": return "profile";
      case "Busqueda": return "search";
      default: return null;
    }
  };

  useEffect(() => {
    setSelected(getSelectedButton(route?.name));
  }, [route?.name]);

  const getButtonstyle = (key) => [
    stylescommon.navButton,
    {
      backgroundColor: selected === key ? colors.tabActive : 'transparent',
      borderColor: colors.border
    }
  ];

  return (
    <View
      style={[
        stylescommon.navBarContainer,
        {
          backgroundColor: colors.navBar,
          borderTopColor: colors.border
        }
      ]}
    >

      <TouchableOpacity onPress={handleMenu} style={getButtonstyle("menu")}>
        <Image
          source={require("../../../assets/images/configuraciones.png")}
          style={[
            stylescommon.navIcon,
            { tintColor: selected === "menu" ? colors.primary : colors.textSecondary }
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleFoto} style={getButtonstyle("profile")}>
        <Image
          source={require("../../../assets/images/perfil-del-usuario.png")}
          style={[
            stylescommon.navIconCenter,
            { tintColor: selected === "profile" ? colors.primary : colors.textSecondary }
          ]}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleBusqueda} style={getButtonstyle("search")}>
        <Image
          source={require("../../../assets/images/lupa.png")}
          style={[
            stylescommon.navIcon,
            { tintColor: selected === "search" ? colors.primary : colors.textSecondary }
          ]}
        />
      </TouchableOpacity>

    </View>
  );
}