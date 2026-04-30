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
import PrimaryButton from "../components/auth/PrimaryButton";
import CustomLogo from "../components/auth/logo";
import { useNavigation } from "@react-navigation/native";
import Separador from "../components/common/Separador";
import styles from "./Style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../components/common/languageByRole";
import { useTheme } from "../components/common/ThemeContext";
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import LanguageSelector from '../components/common/LanguageSelector';

export default function MenuJustifyScreen() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { colors, theme } = useTheme();

  const refreshKey = useLanguageRefresh();
  const [userRole, setUserRole] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const handleLanguageChange = (newLang) => setSelectedLanguage(newLang);

  useEffect(() => {
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role || 'student');
        await saveLanguageForRole(role || 'student');

        const pendingData = await AsyncStorage.getItem('pendingJustifications');
        if (pendingData) {
          const pendings = JSON.parse(pendingData);
          setPendingCount(pendings.filter(j => j.status === 'pending').length);
        }
      } catch {
        setUserRole('student');
      }
    };
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadPendingCount);
    return unsubscribe;
  }, [navigation]);

  const loadPendingCount = async () => {
    try {
      const pendingData = await AsyncStorage.getItem('pendingJustifications');
      if (pendingData) {
        const pendings = JSON.parse(pendingData);
        setPendingCount(pendings.filter(j => j.status === 'pending').length);
      }
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  const handleBack = () => navigation.goBack();

  const handleConsultJustify = () => navigation.navigate("ConsultJustify");

  const handleAddOrEditJustify = () => {
    const screenName = userRole === 'student' ? "AddJustify" : "AddValidJustification";
    navigation.navigate(screenName);
  };

  const handleValidJustifications = () => navigation.navigate("ValidJustifications");
  const handlePendingJustifications = () => navigation.navigate("PendingJustifications");

  const MenuItem = ({ label, onPress, showBadge = false }) => (
    <>
      <Separador />
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuItem}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={[styles.sectionTitleMenu, { color: colors.text, flex: 1 }]}>
              {label}
            </Text>

            {showBadge && pendingCount > 0 && (
              <View style={[styles.badgeContainer, { backgroundColor: colors.primary, marginLeft: 10 }]}>
                <Text style={[styles.badgeText, { color: "#fff" }]}>
                  {pendingCount}
                </Text>
              </View>
            )}
          </View>

          <Image
            source={require("../../assets/images/flecha.png")}
            style={[styles.arrowImage, { tintColor: colors.text }]}
          />
        </View>
      </TouchableOpacity>
    </>
  );

  const Header = ({ title }) => (
    <View style={styles.headerContainer}>
      <Text style={[styles.mainTitle, { color: colors.text }]}>
        {title}
      </Text>

      <CustomLogo
        size="small"
        rounded={true}
        backgroundColor={colors.card}
        marginBottom={35}
      />
    </View>
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
          contentContainerStyle={styles.ScrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.containerMenuJustify}>

            {userRole === 'student' ? (
              <View style={styles.mainContent}>
                <Header title={t('justify.title')} />

                <MenuItem
                  label={t('consultJustify.mainTitle')}
                  onPress={handleConsultJustify}
                />

                <MenuItem
                  label={t('justify.addAbsence')}
                  onPress={handleAddOrEditJustify}
                />
              </View>
            ) : (
              <View style={styles.mainContent}>
                <Header title={t('admin.justificationManagement')} />

                <MenuItem
                  label={t('admin.validJustifications')}
                  onPress={handleValidJustifications}
                />

                <MenuItem
                  label={t('admin.pendingJustifications')}
                  onPress={handlePendingJustifications}
                  showBadge
                />

                <MenuItem
                  label={t('admin.addNewJustification')}
                  onPress={handleAddOrEditJustify}
                />
              </View>
            )}

            <View style={styles.spacer} />

            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={t('consultJustify.back')}
                onPress={handleBack}
              />
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}