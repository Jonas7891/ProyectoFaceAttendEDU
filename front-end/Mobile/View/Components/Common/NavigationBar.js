import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import stylesCommon from "./Style/Style";

export default function BottomBar({ onPressSettings, onPressProfile, onPressSearch, screenNames = {} }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [selected, setSelected] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loadUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    };
    loadUserRole();
  }, []);

  const defaultScreens = {
    menu: "Menu",
    profile: "UpdatePhoto",
    search: "Busqueda",
  };

  const {
    menu: menuScreen = defaultScreens.menu,
    profile: profileScreen = defaultScreens.profile,
    search: searchScreen = defaultScreens.search,
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

    <View style={stylesCommon.navBarContainer} >

  return (
    <View style={stylesCommon.navBarContainer}>
      <TouchableOpacity onPress={handleMenu} style={getButtonStyle("menu")}>
        <Image
          source={require("../../../assets/images/configuraciones.png")}
          style={stylesCommon.navIcon}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleFoto} style={getButtonStyle("profile")}>
        <Image
          source={require("../../../assets/images/perfil-del-usuario.png")}
          style={stylesCommon.navIconCenter}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleBusqueda} style={getButtonStyle("search")}>
        <Image
          source={require("../../../assets/images/lupa.png")}
          style={stylesCommon.navIcon}
        />
      </TouchableOpacity>
    </View>
  );
}