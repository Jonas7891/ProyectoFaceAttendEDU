import { Alert } from "react-native";

const handleLogout = () => {
  Alert.alert(
    "Cerrar Sesión",
    "¿Estás seguro de que deseas cerrar sesión?",
    [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "Sí, cerrar sesión",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Homes" }],
          });
        },
        style: "destructive"
      }
    ]
  );
};

<TouchableOpacity 
  style={styles.logoutButton} 
  onPress={handleLogout}
  activeOpacity={0.7}
>
  <Image 
    source={require("../../assets/images/cerrar-sesion.png")} 
    style={styles.logoutIcon}
  />
  <Text style={styles.logoutText}>Cerrar Sesión</Text>
</TouchableOpacity>