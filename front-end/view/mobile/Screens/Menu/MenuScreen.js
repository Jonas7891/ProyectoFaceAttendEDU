import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import PrimaryButton from "../../Components/Auth/PrimaryButton";
import DangerButton from "../../Components/Auth/DangerButton";
import CustomLogo from "../../Components/Auth/logo";
import { useNavigation } from "@react-navigation/native";
import Separador from "../../Components/Common/Separador";
import styles from "../Style/Style";

export default function MenuScreen() {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.navigate("Dashboard");
  };

  const handleTakePhoto = () => {
    navigation.navigate("TakePhoto");
  };

  const handleUpdatePhoto = () => {
    navigation.navigate("UpdatePhoto");
  }

  const handleFacialFail = () => {
    navigation.navigate("FacialFail");
  };

  const handleMenuJustify = () => {
    navigation.navigate("MenuJustify");
  }

  const sharedProps = {
    isLoading
  }

  const handleLogout = () => {
    navigation.navigate("Homes")
  };

  return (
    <SafeAreaView style={styles.safeAreaWhite}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.container}>
            <TouchableOpacity onPress={handleBack} activeOpacity={0.2}>
              <View style={styles.backIcon}>
                <Image
                  source={require("../../../../assets/images/flecha.png")}
                  style={styles.backIconImage}
                />
              </View>
            </TouchableOpacity>
            <View style={styles.containerSesion}>
              <CustomLogo
                size="large"
                rounded={true}
                backgroundColor="#000000"
                marginBottom={15}
              />
              <Text style={styles.userText}>
                Jonattan Rizo
              </Text>

              <Separador />
              <TouchableOpacity onPress={handleTakePhoto}>
                <View style={{ justifyContent: "left", alignItems: "center", flexDirection: "row" }}>
                  <Text style={styles.sectionTitleMenu}>
                    Ingresar Parámetros Faciales
                  </Text>
                  <Image
                    source={require("../../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />
              <TouchableOpacity onPress={handleUpdatePhoto}>
                <View style={{ justifyContent: "left", alignItems: "center", flexDirection: "row" }}>
                  <Text style={styles.sectionTitleMenu}>
                    Actualizar Parámetros Faciales
                  </Text>
                  <Image
                    source={require("../../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />
              <TouchableOpacity onPress={handleMenuJustify}>
                <View style={{ justifyContent: "left", alignItems: "center", flexDirection: "row" }}>
                  <Text style={styles.sectionTitleMenu}>
                    Configuración de Justificaciones
                  </Text>
                  <Image
                    source={require("../../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />
              <TouchableOpacity>
                <View style={{ justifyContent: "left", alignItems: "center", flexDirection: "row" }}>
                  <Text style={styles.sectionTitleMenu}>
                    Configuración del Aplicativo
                  </Text>
                  <Image
                    source={require("../../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />
              <TouchableOpacity onPress={handleFacialFail}>
                <View style={{ justifyContent: "left", alignItems: "center", flexDirection: "row" }}>
                  <Text style={styles.sectionTitleMenu}>
                    ¿Falla en el reconocimiento facial?
                  </Text>
                  <Image
                    source={require("../../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <DangerButton
                title={isLoading ? "Cerrando Sesión..." : "Cerrar Sesión"}
                onPress={handleLogout}
                setIsLoading={setIsLoading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}