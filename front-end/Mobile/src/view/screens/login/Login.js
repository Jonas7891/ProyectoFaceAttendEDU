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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreLanguageForRole } from "../../components/common/languageByRole";
import { useLanguageRefresh } from '../../../utils/useLanguageRefresh';
import { useTheme } from '../../components/common/ThemeContext';
import PrimaryButton from "../../components/auth/PrimaryButton";
import SelectableButton from "../../components/common/SelectableButton";
import CustomLogo from "../../components/common/logo";
import { useNavigation } from "@react-navigation/native";
import RegisterModal from '../../components/auth/RegisterModal';
import TerminosModal from "../../components/common/TerminosModal";
import ScrollView from "../../components/common/ScrollView";
import styles from "./style/Style";

export default function HomesScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
 const refreshKey = useLanguageRefresh();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { colors, loadThemeForRole } = useTheme();

  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [isTerminosModalVisible, setIsTerminosModalVisible] = useState(false);

  const handlelogin = async () => {
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
        await AsyncStorage.setItem('userRole', 'admin');
        await AsyncStorage.setItem('userEmail', email);
        await loadThemeForRole('admin');
        await restoreLanguageForRole('admin');
        navigation.navigate("Dashboard");

      } else if (email === "chao@gmail.com" && password === "7891") {
        await AsyncStorage.setItem('userRole', 'student');
        await AsyncStorage.setItem('userEmail', email);
        await loadThemeForRole('student');
        await restoreLanguageForRole('student');
        navigation.navigate("Dashboard");

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
    <SafeAreaView style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]} key={refreshKey}>
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : "position"}
          style={styles.keyboardview}
          keyboardDismissMode="on-drag"
          keyboardVerticalOffset={80}
          enableOnAndroid={true}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.container, { backgroundColor: colors.backgroundWhite }]}>
              <View style={styles.contentContainer}>

                <View style={styles.logoContainer}>
                  <CustomLogo
                    size="large"
                    rounded={true}
                    backgroundColor="#000000"
                    marginBottom={20}
                  />
                </View>

                <Text style={[styles.textoSesion, { color: colors.text }]}>
                  {t('login.title')}
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputTitulo, { color: colors.text }]}>
                    {t('login.email')}
                  </Text>
                  <TextInput
                    style={[styles.inputEscrito, {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border ?? colors.separator,
                      color: colors.text,
                    }]}
                    onChangeText={setEmail}
                    value={email}
                    placeholder={t('login.emailPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputTitulo, { color: colors.text }]}>
                    {t('login.password')}
                  </Text>
                  <TextInput
                    style={[styles.inputEscrito, {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border ?? colors.separator,
                      color: colors.text,
                    }]}
                    onChangeText={setPassword}
                    value={password}
                    placeholder={t('login.passwordPlaceholder')}
                    secureTextEntry={true}
                    textContentType="password"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="done"
                  />

                  <View style={styles.rowContainer}>
                    <SelectableButton selectable={true} initialSelected={false} />
                    <TouchableOpacity
                      onPress={() => setIsTerminosModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.terminosText, { color: colors.primary }]}>
                        {t('login.terms')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <PrimaryButton
                  title={isLoading ? t('login.loading') : t('login.title')}
                  onPress={handlelogin}
                />
              </View>

              <TouchableOpacity
                onPress={() => setIsRegisterModalVisible(true)}
                activeOpacity={0.7}
                style={styles.sesionNoRegistro}
              >
                <Text style={[styles.noRegistro, { color: colors.textSecondary }]}>
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