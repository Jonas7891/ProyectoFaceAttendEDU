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
  const [userRole, setUserRole] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role || 'student');
        await saveLanguageForRole(role || 'student');

        // Cargar conteo de pendientes para admin
        const pendingData = await AsyncStorage.getItem('pendingJustifications');
        if (pendingData) {
          const pendings = JSON.parse(pendingData);
          setPendingCount(pendings.filter(j => j.status === 'pending').length);
        }
      } catch (error) {
        console.error('Error:', error);
        setUserRole('student');
      }
    };
    init();

    const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
    i18n.on('languageChanged', handleLanguageChange);

    // Refrescar conteo cuando la pantalla obtiene el foco
    const unsubscribe = navigation.addListener('focus', () => {
      loadPendingCount();
    });

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      unsubscribe();
    };
  }, [i18n, navigation]);

  const loadPendingCount = async () => {
    try {
      const pendingData = await AsyncStorage.getItem('pendingJustifications');
      if (pendingData) {
        const pendings = JSON.parse(pendingData);
        setPendingCount(pendings.filter(j => j.status === 'pending').length);
      }
    } catch (error) {
      console.error('Error al cargar conteo:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConsultJustify = () => {
    navigation.navigate("ConsultJustify");
  };

  const handleAddOrEditJustify = () => {
    // Redirigir según el rol
    if (userRole === 'student') {
      navigation.navigate("AddJustify");
    } else {
      navigation.navigate("AddValidJustification");
    }
  };

  const handleValidJustifications = () => {
    navigation.navigate("ValidJustifications");
  };

  const handlePendingJustifications = () => {
    navigation.navigate("PendingJustifications");
  };

  const renderStudentView = () => (
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
            source={require("../../Assets/Images/flecha.png")}
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
            source={require("../../Assets/Images/flecha.png")}
            style={styles.arrowImage}
          />
        </View>
      </TouchableOpacity>

      <Separador />
    </View>
  );

  const renderAdminView = () => (
    <View style={styles.mainContent}>
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>
          {t('admin.justificationManagement')} {"\n"}
        </Text>
        <CustomLogo
          size="small"
          rounded={true}
          backgroundColor="#000000"
          marginBottom={35}
        />
      </View>

      <Separador />

      <TouchableOpacity onPress={handleValidJustifications}>
        <View style={styles.menuItem}>
          <Text style={styles.sectionTitleMenu}>
            {t('admin.validJustifications')}
          </Text>
          <Image
            source={require("../../Assets/Images/flecha.png")}
            style={styles.arrowImage}
          />
        </View>
      </TouchableOpacity>

      <Separador />

      <TouchableOpacity onPress={handlePendingJustifications}>
        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.sectionTitleMenu}>
              {t('admin.pendingJustifications')}
            </Text>
            {pendingCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </View>
          <Image
            source={require("../../Assets/Images/flecha.png")}
            style={styles.arrowImage}
          />
        </View>
      </TouchableOpacity>

      <Separador />

      {/* MISMO BOTÓN QUE ESTUDIANTES PERO CON TEXTO DIFERENTE */}
      <TouchableOpacity onPress={handleAddOrEditJustify}>
        <View style={styles.menuItem}>
          <Text style={styles.sectionTitleMenu}>
            {t('admin.addNewJustification')}
          </Text>
          <Image
            source={require("../../Assets/Images/flecha.png")}
            style={styles.arrowImage}
          />
        </View>
      </TouchableOpacity>

      <Separador />
    </View>
  );

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
            {/* Mostrar vista según el rol */}
            {userRole === 'student' ? renderStudentView() : renderAdminView()}

            {/* Espaciador flexible que empuja el botón hacia abajo */}
            <View style={styles.spacer} />

            {/* Botón Volver */}
            <View style={styles.buttonContainer}>
              <PrimaryButton title={t('consultJustify.back')} onPress={handleBack} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}