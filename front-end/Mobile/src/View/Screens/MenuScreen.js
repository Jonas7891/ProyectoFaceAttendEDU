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
import { saveLanguageForRole, restoreLanguageForRole } from "../Components/Common/languageByRole";
import DangerButton from "../Components/Auth/DangerButton";
import CustomLogo from "../Components/Auth/logo";
import { useNavigation } from "@react-navigation/native";
import Separador from "../Components/Common/Separador";
import styles from "./Style";

export default function MenuScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // ─── Inicialización ────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    };
    init();

    const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  // ─── Navegación condicional por rol ────────────────────────────────────────
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

    navigation.navigate("Login");
  };

  // ─── Helper para renderizar un ítem de menú ────────────────────────────────
  const MenuItem = ({ label, onPress }) => (
    <>
      <Separador />
      <TouchableOpacity onPress={onPress}>
        <View style={{ justifyContent: "flex-start", alignItems: "center", flexDirection: "row" }}>
          <Text style={styles.sectionTitleMenu}>{label}</Text>
          <Image
            source={require("../../Assets/Images/flecha.png")}
            style={styles.arrowImage}
          />
        </View>
      </TouchableOpacity>
    </>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeAreaWhite} key={refreshKey}>
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
                  source={require("../../Assets/Images/flecha.png")}
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

              {/* Nombre y rol del usuario */}
              <Text style={styles.userText}>
                {isAdmin ? "Jonattan Rizo" : "The Jonas"}
              </Text>

              {/* Ítems comunes a ambos roles */}
              <MenuItem label={t('menu.facialParams')} onPress={handleTakePhoto} />
              <MenuItem label={t('menu.updateFacialParams')} onPress={handleUpdatePhoto} />

              <MenuItem
                label={isAdmin
                  ? t('menu.justificationConfig')
                  : t('menu.justificationInfo', { defaultValue: 'Información de las Justificaciones' })
                }
                onPress={handleMenuJustify}
              />

              {/* Comunes de nuevo */}
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