import React, { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole, restoreLanguageForRole } from "../components/common/languageByRole";
import { useTheme } from '../components/common/ThemeContext';
import DangerButton from "../components/auth/DangerButton";
import CustomLogo from "../components/auth/logo";
import { useNavigation } from "@react-navigation/native";
import styles from "./Style";

export default function MenuScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { colors, loadThemeForRole, toggleTheme } = useTheme();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // 🔹 Inicialización
  useEffect(() => {
    const init = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);

      if (role) {
        await loadThemeForRole(role);
        await restoreLanguageForRole(role);
      }
    };
    init();

    const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  const isAdmin = userRole === 'admin';

  const handleBack = () => navigation.navigate("Dashboard");
  const handleTakePhoto = () => navigation.navigate("TakePhoto");
  const handleUpdatePhoto = () => navigation.navigate("UpdatePhoto");
  const handleFacialFail = () => navigation.navigate("FacialFail");
  const handleMenuJustify = () => navigation.navigate("MenuJustify");
  const handleSettings = () => navigation.navigate("LanguageSettings");

  const handleLogout = async () => {
    await saveLanguageForRole(userRole);
    await AsyncStorage.removeItem('userRole');
    navigation.navigate("Home");
  };

  // 🔹 Item reutilizable
  const MenuItem = ({ label, onPress }) => (
    <>
      <View style={{ height: 1, backgroundColor: colors.separator, marginVertical: 10 }} />
      <TouchableOpacity onPress={onPress}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={[styles.sectionTitleMenu, { color: colors.text }]}>
            {label}
          </Text>
          <Image
            source={require("../../assets/images/flecha.png")}
            style={[styles.arrowImage, { tintColor: colors.text }]}
          />
        </View>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView
      style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}
      key={refreshKey}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardview}
      >
        <ScrollView
          style={styles.ScrollView}
          contentContainerstyle={styles.ScrollViewContent}
        >
          <View style={styles.container} marginHorizontal={10}>
            <TouchableOpacity onPress={handleBack} activeOpacity={0.2}>
              <View style={styles.backIcon}>
                <Image
                  source={require("../../assets/images/flecha.png")}
                  style={[styles.backIconImage, { tintColor: colors.text }]}
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

              <Text style={[styles.userText, { color: colors.text }]}>
                {isAdmin ? "Jonattan Rizo" : "The Jonas"}
              </Text>

              {!isAdmin && (
                <MenuItem label={t('menu.facialParams')} onPress={handleTakePhoto} />
              )}
              {!isAdmin && (
                <MenuItem label={t('menu.updateFacialParams')} onPress={handleUpdatePhoto} />
              )}

              {/* Ambos roles */}
              <MenuItem
                label={isAdmin
                  ? t('menu.justificationConfig')
                  : t('menu.justificationInfo', { defaultValue: 'Información de las Justificaciones' })
                }
                onPress={handleMenuJustify}
              />
              <MenuItem label={t('menu.appSettings')} onPress={handleSettings} />
              <MenuItem label={t('menu.facialRecognitionFail')} onPress={handleFacialFail} />

              <DangerButton
                title={isLoading ? t('menu.loggingOut') : t('menu.logout')}
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