import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity
} from "react-native";
import PrimaryButton from "../../Components/Auth/PrimaryButton";
import SelectableButton from "../../Components/Auth/SelectableButton";
import CustomLogo from "../../Components/Auth/logo";
import { useNavigation } from "@react-navigation/native";
import RegisterModal from '../../Components/Common/RegisterModal';
import ScrollView from "../../Components/Common/ScrollView";
import styles from "../Style/Style";

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
        const userData = {
          name: "Administrador",
        };
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
    <SafeAreaView style={styles.safeAreaWhite}>
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
                    size="large"
                    rounded={true}
                    backgroundColor="#000000"
                    marginBottom={20}
                  />
                </View>

                <Text style={styles.textoSesion}>
                  Inicio de Sesión
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

                  <SelectableButton
                    title="Aceptar Términos y Condiciones"
                    selectable={true}
                    initialSelected={false}
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
