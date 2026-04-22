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
import PrimaryButton from "../../Components/Auth/PrimaryButton";
import Separador from "../../Components/Common/Separador";
import styles from "../Style/Style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../../Components/Common/languageByRole";

export default function AddJustification() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
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

  const removeFile = () => {
    setSelectedFile(null);
  };

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

      Alert.alert(
        t('common.success'),
        t('justify.successMessage'),
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), "No se pudo enviar la justificación");
    } finally {
      setIsLoading(false);
    }
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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.containerAddJustification}>
            {/* Título principal */}
            <Text style={styles.mainTitleAddJustification}>
              {t('justify.title')}
            </Text>

            <Text style={styles.descriptionText}>
              {t('justify.addAbsence')}
            </Text>

            <Separador />

            {/* Selector de tipo de justificación */}
            <Text style={styles.inputLabel}>{t('justify.selectDate')}</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  justificationType === "inasistencia" && styles.activeTypeButton,
                ]}
                onPress={() => setJustificationType("inasistencia")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    justificationType === "inasistencia" && styles.activeTypeButtonText,
                  ]}
                >
                  {t('justify.absenceType')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  justificationType === "retardo" && styles.activeTypeButton,
                ]}
                onPress={() => setJustificationType("retardo")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    justificationType === "retardo" && styles.activeTypeButtonText,
                  ]}
                >
                  {t('justify.delayType')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Campo de fecha */}
            <Text style={styles.inputLabel}>{t('justify.dateLabel')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('justify.dateFormat')}
              placeholderTextColor="#999"
              value={date}
              onChangeText={setDate}
            />

            {/* Campo de hora (solo para retardos) */}
            {justificationType === "retardo" && (
              <>
                <Text style={styles.inputLabel}>{t('justify.timeLabel')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('justify.timeFormat')}
                  placeholderTextColor="#999"
                  value={time}
                  onChangeText={setTime}
                />
              </>
            )}

            {/* Campo de descripción */}
            <Text style={styles.inputLabel}>{t('justify.descriptionLabel')}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder={t('justify.descriptionPlaceholder')}
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Sección de subir archivo */}
            <Text style={styles.inputLabel}>{t('justify.attachDocument')}</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>{t('justify.selectFile')}</Text>
            </TouchableOpacity>

            {selectedFile && (
              <View style={styles.fileInfoContainer}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    📄 {selectedFile.name}
                  </Text>
                  <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
                </View>
                <TouchableOpacity onPress={removeFile} style={styles.removeFileButton}>
                  <Text style={styles.removeFileText}>✖</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.supportedFormats}>
              {t('justify.supportedFormats')}
            </Text>

            {/* Espaciador */}
            <View style={styles.spacer} />

            {/* Botón Subir */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={t('justify.upload')}
                onPress={handleSubmit}
                isLoading={isLoading}
              />
            </View>

            {/* Botón Volver secundario */}
            <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}