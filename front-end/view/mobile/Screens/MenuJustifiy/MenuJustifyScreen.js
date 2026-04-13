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
import CustomLogo from "../../Components/Auth/logo";
import { useNavigation } from "@react-navigation/native";
import Separador from "../../Components/Common/Separador";
import styles from "../Style/Style";

export default function MenuJustifyScreen() {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.navigate("Dashboard");
  };

  const handleConsultJustify = () => {
    navigation.navigate("ConsultJustify")
  };

  const handleAddOrEditJustify = () => {
    navigation.navigate("AddJustify")
  }

  const sharedProps = {
    isLoading
  }

  return (
    <SafeAreaView style={styles.safeAreaWhite}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.containerMenuJustify}>
            {/* Contenido principal que se expande y empuja el botón hacia abajo */}
            <View style={styles.mainContent}>
              <View style={styles.headerContainer}>
                <Text style={styles.mainTitle}>
                  Información de {"\n"} Tus Justificaciones
                </Text>
                <CustomLogo
                  size="small"
                  rounded={true}
                  backgroundColor="#000000"
                  marginBottom={1}
                />
              </View>

              <Separador />

              <TouchableOpacity onPress={handleConsultJustify}>
                <View style={styles.menuItem}>
                  <Text style={styles.sectionTitleMenu}>
                    Consultar Justificaciones
                  </Text>
                  <Image
                    source={require("../../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />

              <TouchableOpacity onPress={handleAddOrEditJustify}>
                <View style={styles.menuItem}>
                  <Text style={styles.sectionTitleMenu}>
                    Envio de Excusa / Justificación
                  </Text>
                  <Image
                    source={require("../../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />

              {/* Espaciador flexible que empuja el botón hacia abajo */}
              <View style={styles.spacer} />
            </View>

            {/* Botón fijo en la parte inferior */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Volver al Dashboard"
                onPress={handleBack}
                {...sharedProps}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}