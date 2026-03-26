import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import PrimaryButton from "../../components/auth/PrimaryButton";
import CustomLogo from "../../components/auth/logo";
import { useNavigation } from "@react-navigation/native";
import Separador from "../../components/auth/Separador";

export default function MenuScreen() {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const sharedProps = {
    isLoading
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <View style={styles.containerSesion}>
            <CustomLogo
              size="medium"
              rounded={true}
              backgroundColor="#000000"
              marginBottom={10}
            />
            <Text style={styles.userText}>
              Jonattan Rizo
            </Text>
            <Separador />
            <Text style={styles.sectionTitle}>
              Ingreso de Parámetros Faciales
            </Text>
            <Text style={styles.sectionText}>
              Cuando se descarga el aplicativo se inicia desde 0 todo tipo de reconocimiento facial, Ajusta tus propios usuarios.
            </Text>

            <Separador />
            <Text style={styles.sectionTitle}>
              Actualización de Parámetros Faciales
            </Text>
            <Text style={styles.sectionText}>
              Si por alguna razón paso algo con el rosto de alguna persona, Actualizalo aquí.
            </Text>

            <Separador />
            <Text style={styles.sectionTitle}>
              Visualización de Asistencias
            </Text>
            <Text style={styles.sectionText}>
              Muestra de Asistencias por mes usuarios en especifico.
            </Text>

            <Separador />
            <Text style={styles.sectionTitle}>
              Configuración para Justificaciones
            </Text>
            <Text style={styles.sectionText}>
              Muestra de Asistencias por mes usuarios en especifico.
            </Text>

            <Separador />
            <Text style={styles.sectionTitle}>
              ¿Falla en el reconocimiento facial?
            </Text>
            <Text style={styles.sectionText}>
              En caso tal de que no se funcione el reconocimiento facial lo que se deberia hacer el lo siguiente.
            </Text>

            <PrimaryButton
              title={isLoading ? "Volviendo a la Principal..." : "Volver"}
              onPress={handleBack}
            />

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  containerSesion: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  userText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    color: "#000000",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#000000",
    fontWeight: '600',
  },
  sectionText: {
    textAlign: "center",
    color: "#666666",
    fontWeight: "400",
    fontSize: 16,
    marginBottom: 10,
  }
});