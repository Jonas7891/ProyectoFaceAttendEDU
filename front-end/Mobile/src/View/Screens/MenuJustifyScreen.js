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
import PrimaryButton from "../Components/Auth/PrimaryButton";
import CustomLogo from "../Components/Auth/logo";
import { useNavigation } from "@react-navigation/native";
import Separador from "../Components/Common/Separador";
import styles from "./Style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../Components/Common/languageByRole";

export default function MenuJustifyScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);

      await restoreLanguageForRole(role);
    };
    init();

    const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  const handleBack = () => {
    navigation.goBack();
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
                  {t('justify.title')} {"\n"}
                </Text>
                <CustomLogo
                  size="small"
                  rounded={true}
                  backgroundColor="#000000"
                  marginBottom={35}
                />
              </View>

              <Separador />

              <TouchableOpacity onPress={handleConsultJustify}>
                <View style={styles.menuItem}>
                  <Text style={styles.sectionTitleMenu}>
                    {t('consultJustify.mainTitle')}
                  </Text>
                  <Image
                    source={require("../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />

              <TouchableOpacity onPress={handleAddOrEditJustify}>
                <View style={styles.menuItem}>
                  <Text style={styles.sectionTitleMenu}>
                    {t('justify.addAbsence')}
                  </Text>
                  <Image
                    source={require("../../assets/images/flecha.png")}
                    style={styles.arrowImage}
                  />
                </View>
              </TouchableOpacity>

              <Separador />

              {/* Espaciador flexible que empuja el botón hacia abajo */}
              <View style={styles.spacer}/>

              {/* Botón Volver */}
              <View style={styles.buttonContainer}>
                <PrimaryButton title={t('consultJustify.back')} onPress={handleBack} />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}