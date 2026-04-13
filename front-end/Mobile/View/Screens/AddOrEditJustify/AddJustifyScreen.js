import React, { useState } from "react";
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
import PrimaryButton from "../../Components/Auth/PrimaryButton";
import Separador from "../../Components/Common/Separador";
import styles from "../Style/Style";

export default function AddJustification() {
  const navigation = useNavigation();
  
  const [justificationType, setJustificationType] = useState("inasistencia");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleBack = () => {
    navigation.goBack();
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Error", "Por favor ingresa una descripción de la justificación");
      return;
    }

    if (!date) {
      Alert.alert("Error", "Por favor ingresa la fecha");
      return;
    }

    if (justificationType === "retardo" && !time) {
      Alert.alert("Error", "Por favor ingresa la hora del retardo");
      return;
    }

    if (!selectedFile) {
      Alert.alert("Error", "Por favor sube un archivo adjunto");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        "Éxito", 
        `Justificación de ${justificationType === "inasistencia" ? "Inasistencia" : "Retardo"} enviada correctamente`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la justificación");
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
              Agregar Excusa por Retardo o Inasistencia
            </Text>

            <Text style={styles.descriptionText}>
              Llena el formato para agregar la justificación en caso de Inasistencia o Retardo.
            </Text>

            <Separador />

            {/* Selector de tipo de justificación */}
            <Text style={styles.inputLabel}>Tipo de Justificación</Text>
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
                   Inasistencia
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
                   Retardo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Campo de fecha */}
            <Text style={styles.inputLabel}>Fecha</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={date}
              onChangeText={setDate}
            />

            {/* Campo de hora (solo para retardos) */}
            {justificationType === "retardo" && (
              <>
                <Text style={styles.inputLabel}>Hora</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="HH:MM AM/PM"
                  placeholderTextColor="#999"
                  value={time}
                  onChangeText={setTime}
                />
              </>
            )}

            {/* Campo de descripción */}
            <Text style={styles.inputLabel}>Descripción de la Justificación</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Escribe aquí la descripción del motivo..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Sección de subir archivo */}
            <Text style={styles.inputLabel}>Adjuntar Documento</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Seleccionar Archivo</Text>
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
              Formatos soportados: PDF, Imagen (JPG, PNG), Word (DOC, DOCX)
            </Text>

            {/* Espaciador */}
            <View style={styles.spacer} />

            {/* Botón Subir */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Subir"
                onPress={handleSubmit}
                isLoading={isLoading}
              />
            </View>

            {/* Botón Volver secundario */}
            <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}