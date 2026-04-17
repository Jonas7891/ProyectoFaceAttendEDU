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
import PrimaryButton from "../../Components/Auth/PrimaryButton";
import DangerButton from "../../Components/Auth/DangerButton";
import CustomLogo from "../../Components/Auth/logo";
import { useNavigation } from "@react-navigation/native";
import Separador from "../../Components/Common/Separador";
import styles from "../Style/Style";

export default function MenuScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleLanguageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

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
  };

  const handleSettings = () => {
    navigation.navigate("LanguageSettings")
  };

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
                  source={require("../../../assets/images/flecha.png")}
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
                    {t('menu.facialParams')}
                  </Text>
                  <Image
                    source={require("../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />
              <TouchableOpacity onPress={handleUpdatePhoto}>
                <View style={{ justifyChange: "left", alignItems: "center", flexDirection: "row" }}>
                  <Text style={styles.sectionTitleMenu}>
                    {t('menu.updateFacialParams')}
                  </Text>
                  <Image
                    source={require("../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />
              <TouchableOpacity onPress={handleMenuJustify}>
                <View style={{ justifyContent: "left", alignItems: "center", flexDirection: "row" }}>
                  <Text style={styles.sectionTitleMenu}>
                    {t('menu.justificationConfig')}
                  </Text>
                  <Image
                    source={require("../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />
              <TouchableOpacity onPress={handleSettings}>
                <View style={{ justifyContent: "left", alignItems: "center", flexDirection: "row" }}>
                  <Text style={styles.sectionTitleMenu}>
                    {t('menu.appSettings')}
                  </Text>
                  <Image
                    source={require("../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />
              <TouchableOpacity onPress={handleFacialFail}>
                <View style={{ justifyContent: "left", alignItems: "center", flexDirection: "row" }}>
                  <Text style={styles.sectionTitleMenu}>
                    {t('menu.facialRecognitionFail')}
                  </Text>
                  <Image
                    source={require("../../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

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