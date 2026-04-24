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
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../components/auth/PrimaryButton";
import Separador from "../components/common/Separador";
import styles from "./Style";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from "../components/common/ThemeContext";
import { restoreLanguageForRole } from "../components/common/languageByRole";

export default function AddJustification() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { colors, theme } = useTheme();

  const [refreshKey, setRefreshKey] = useState(0);
  const [justificationType, setJustificationType] = useState("inasistencia");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const init = async () => {
      const role = await AsyncStorage.getItem('userRole');
      await restoreLanguageForRole(role);
    };
    init();

    const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  const handleBack = () => navigation.goBack();

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('justify.enterReason'));
      return;
    }

    if (!date) {
      Alert.alert(t('common.error'), t('justify.selectDate'));
      return;
    }

    if (justificationType === "retardo" && !time) {
      Alert.alert(t('common.error'), t('justify.missingTimeError'));
      return;
    }

    if (!selectedFile) {
      Alert.alert(t('common.error'), t('justify.missingAttachmentError'));
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(t('common.success'), t('justify.successMessage'), [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeAreaWhite, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardview}
      >
        <ScrollView
          style={styles.ScrollView}
          contentContainerstyle={styles.ScrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.containerAddJustification}>

            {/* TITULO */}
            <Text style={[styles.mainTitleAddJustification, { color: colors.text }]}>
              {t('justify.title')}
            </Text>

            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {t('justify.addAbsence')}
            </Text>

            <Separador />

            {/* TIPO */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t('justify.selectDate')}
            </Text>

            <View style={styles.typeSelector}>
              {["inasistencia", "retardo"].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        justificationType === type
                          ? colors.primary
                          : colors.card,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setJustificationType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          justificationType === type
                            ? "#fff"
                            : colors.text
                      }
                    ]}
                  >
                    {type === "inasistencia"
                      ? t('justify.absenceType')
                      : t('justify.delayType')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* INPUT FECHA */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t('justify.dateLabel')}
            </Text>

            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder={t('justify.dateFormat')}
              placeholderTextColor={colors.textMuted}
              value={date}
              onChangeText={setDate}
            />

            {/* INPUT HORA */}
            {justificationType === "retardo" && (
              <>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('justify.timeLabel')}
                </Text>

                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border
                    }
                  ]}
                  placeholder={t('justify.timeFormat')}
                  placeholderTextColor={colors.textMuted}
                  value={time}
                  onChangeText={setTime}
                />
              </>
            )}

            {/* DESCRIPCIÓN */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t('justify.descriptionLabel')}
            </Text>

            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder={t('justify.descriptionPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* SUBIR */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t('justify.attachDocument')}
            </Text>

            <TouchableOpacity
              style={[
                styles.uploadButton,
                { backgroundColor: colors.primary }
              ]}
            >
              <Text style={[styles.uploadButtonText, { color: "#fff" }]}>
                {t('justify.selectFile')}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.supportedFormats, { color: colors.textMuted }]}>
              {t('justify.supportedFormats')}
            </Text>

            <View style={styles.spacer} />

            {/* BOTÓN */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={t('justify.upload')}
                onPress={handleSubmit}
                isLoading={isLoading}
              />
            </View>

            {/* VOLVER */}
            <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                {t('common.back')}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}