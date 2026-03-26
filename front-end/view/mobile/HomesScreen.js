import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity
} from "react-native";
import PrimaryButton from "../../components/auth/PrimaryButton";
import CustomLogo from "../../components/auth/logo";
import { useNavigation } from "@react-navigation/native";
import RegisterModal from '../../components/auth/RegisterModal';
import ScrollView from "../../components/common/ScrollView";

export default function HomesScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [ModalVisible, setModalVisible] = useState(false);

  const sharedProps = {
    isLoading
  }

  const handleEmailChange = (text) => {
    setEmail(text);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingrese su correo electrónico");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Por favor ingrese su contraseña");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (email === "hola@gmail.com" && password === "7891") {
        navigation.navigate("Dashboard");
      } else {
        Alert.alert("Error", "Credenciales inválidas");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : "position"}
          style={styles.keyboardView}
          keyboardDismissMode="on-drag"
          keyboardVerticalOffset={80}
          enableOnAndroid={true}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <View style={styles.contentContainer}>
                <View style={styles.logoContainer}>
                  <CustomLogo
                    size="xlarge"
                    rounded={true}
                    backgroundColor="#000000"
                    marginBottom={20}
                  />
                </View>

                <Text style={styles.textoSesion}>
                  {"\n"}
                  Inicio de Sesión
                </Text>

                <Text style={styles.textoCredenciales}>
                  Ingrese sus credenciales.
                </Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputTitulo}>Correo Electrónico</Text>
                  <TextInput
                    style={styles.inputEscrito}
                    onChangeText={handleEmailChange}
                    value={email}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#999999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    accessibilityLabel="Campo de correo electrónico"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputTitulo}>Contraseña</Text>
                  <TextInput
                    style={styles.inputEscrito}
                    onChangeText={handlePasswordChange}
                    value={password}
                    placeholder="Ingrese su contraseña"
                    secureTextEntry={true}
                    textContentType="password"
                    placeholderTextColor="#999999"
                    returnKeyType="done"
                    accessibilityLabel="Campo de contraseña"
                  />
                </View>

                <PrimaryButton
                  title={isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  onPress={handleLogin}
                />
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
                style={styles.sesionNoRegistro}
              >
                <Text style={styles.noRegistro}>
                  ¿No tiene cuenta registrada?
                </Text>
              </TouchableOpacity>
              <RegisterModal
                isVisible={ModalVisible}
                onClose={() => setModalVisible(false)}
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScrollView>
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
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  logoContainer: {
    marginTop: 40,
  },
  textoSesion: {
    textAlign: "left",
    color: "#000000",
    fontWeight: "700",
    fontSize: 30,
    marginBottom: 10,
  },
  textoCredenciales: {
    textAlign: "left",
    color: "#666666",
    fontWeight: "400",
    fontSize: 16,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputTitulo: {
    textAlign: "left",
    color: "#000000",
    fontWeight: "500",
    marginBottom: 8,
    fontSize: 16,
  },
  inputEscrito: {
    textAlign: "left",
    color: "#000000",
    fontWeight: "400",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  noRegistro: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center"
  },
  sesionNoRegistro: {
    marginHorizontal: 100,
    marginTop: 60,
  }
});