import React, { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../Components/Auth/PrimaryButton";
import SelectableButton from "../../Components/Auth/SelectableButton";
import CustomLogo from "../../Components/Auth/logo";
import { useNavigation } from "@react-navigation/native";
import RegisterModal from '../../Components/Auth/RegisterModal';
import TerminosModal from "../../Components/Auth/TerminosModal";
import ScrollView from "../../Components/Common/ScrollView";
import styles from "../Style/Style";

export default function HomesScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [isTerminosModalVisible, setIsTerminosModalVisible] = useState(false);

  useEffect(() => {
    const handleLanguageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

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
      Alert.alert(t('common.error'), t('login.errorEmail'));
      return;
    }

    if (!password.trim()) {
      Alert.alert(t('common.error'), t('login.errorPassword'));
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
        Alert.alert(t('common.error'), t('login.invalidCredentials'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('login.loginError'));
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
                  {t('login.title')}
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputTitulo}>{t('login.email')}</Text>
                  <TextInput
                    style={styles.inputEscrito}
                    onChangeText={handleEmailChange}
                    value={email}
                    placeholder={t('login.emailPlaceholder')}
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
                  <Text style={styles.inputTitulo}>{t('login.password')}</Text>
                  <TextInput
                    style={styles.inputEscrito}
                    onChangeText={handlePasswordChange}
                    value={password}
                    placeholder={t('login.passwordPlaceholder')}
                    secureTextEntry={true}
                    textContentType="password"
                    placeholderTextColor="#999999"
                    returnKeyType="done"
                    accessibilityLabel="Campo de contraseña"
                  />

                  <View style={styles.rowContainer}>
                    <SelectableButton
                      selectable={true}
                      initialSelected={false}
                    />

                    <TouchableOpacity
                      onPress={() => setIsTerminosModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.terminosText}>
                        {t('login.terms')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <PrimaryButton
                  title={isLoading ? t('login.loading') : t('login.title')}
                  onPress={handleLogin}
                />
              </View>

              <TouchableOpacity
                onPress={() => setIsRegisterModalVisible(true)}
                activeOpacity={0.7}
                style={styles.sesionNoRegistro}
              >
                <Text style={styles.noRegistro}>
                  {t('login.noAccount')}
                </Text>
              </TouchableOpacity>

              <RegisterModal
                isVisible={isRegisterModalVisible}
                onClose={() => setIsRegisterModalVisible(false)}
              />

              <TerminosModal
                isVisible={isTerminosModalVisible}
                onClose={() => setIsTerminosModalVisible(false)}
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}