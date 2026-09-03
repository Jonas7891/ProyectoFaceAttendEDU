import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * FileUpload component para subir archivos e imágenes
 * 
 * NOTA: Este es un placeholder UI. Para funcionalidad completa, instalar:
 * 
 * npm install expo-document-picker expo-image-picker
 * 
 * Y implementar la lógica de selección/upload con estas librerías.
 * 
 * @param {Array} value - Array de archivos seleccionados [{ uri, name, size, type }]
 * @param {function} onChange - Callback al cambiar archivos
 * @param {string} label - Etiqueta
 * @param {string} accept - Tipos aceptados: 'image/*', 'application/pdf', etc
 * @param {boolean} multiple - Permitir múltiples archivos
 * @param {number} maxSize - Tamaño máximo en bytes (default: 5MB)
 * @param {number} maxFiles - Máximo número de archivos
 * @param {boolean} preview - Mostrar preview de imágenes
 * @param {boolean} error - Si hay error
 * @param {string} errorMessage - Mensaje de error
 * @param {boolean} disabled - Si está deshabilitado
 * 
 * @example
 * // FileUpload básico (imagen)
 * const [files, setFiles] = useState([]);
 * <FileUpload
 *   label="Foto de perfil"
 *   accept="image/*"
 *   value={files}
 *   onChange={setFiles}
 * />
 * 
 * @example
 * // Múltiples imágenes con preview
 * <FileUpload
 *   label="Galería de imágenes"
 *   accept="image/*"
 *   multiple
 *   maxFiles={5}
 *   preview
 *   value={images}
 *   onChange={setImages}
 * />
 * 
 * @example
 * // Documentos
 * <FileUpload
 *   label="Subir documento"
 *   accept="application/pdf"
 *   maxSize={10 * 1024 * 1024} // 10MB
 *   value={documents}
 *   onChange={setDocuments}
 * />
 */
export function FileUpload({
  value = [],
  onChange,
  label,
  accept = "*/*",
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 10,
  preview = true,
  error = false,
  errorMessage,
  disabled = false,
  style,
}) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (disabled) return;
    
    console.warn(
      "FileUpload: Instalar expo-document-picker y expo-image-picker para funcionalidad completa.\n" +
      "npm install expo-document-picker expo-image-picker"
    );

    // Placeholder: Simular selección
    const mockFile = {
      uri: "https://via.placeholder.com/150",
      name: "archivo-ejemplo.jpg",
      size: 1024000,
      type: "image/jpeg",
    };

    if (multiple) {
      onChange([...value, mockFile]);
    } else {
      onChange([mockFile]);
    }
  };

  const handleRemove = (index) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (file) => {
    return file.type?.startsWith("image/") || file.uri?.match(/\.(jpg|jpeg|png|gif)$/i);
  };

  const canAddMore = !multiple ? value.length === 0 : value.length < maxFiles;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: error ? theme.colors.status.error : theme.colors.text.secondary },
          ]}
        >
          {label}
        </Text>
      )}

      {/* Upload button */}
      {canAddMore && (
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          style={[
            styles.uploadButton,
            {
              borderColor: error
                ? theme.colors.status.error
                : theme.colors.border.primary,
              backgroundColor: disabled
                ? theme.colors.background.hover
                : theme.colors.background.surface,
            },
          ]}
        >
          <Feather
            name="upload-cloud"
            size={32}
            color={theme.colors.text.secondary}
          />
          <Text
            style={[
              styles.uploadText,
              { color: theme.colors.text.primary },
            ]}
          >
            {value.length === 0 ? "Seleccionar archivo" : "Agregar otro archivo"}
          </Text>
          <Text
            style={[
              styles.uploadHint,
              { color: theme.colors.text.tertiary },
            ]}
          >
            {accept === "image/*" ? "Imágenes" : "Archivos"} hasta {formatSize(maxSize)}
          </Text>
        </TouchableOpacity>
      )}

      {/* Files list */}
      {value.length > 0 && (
        <View style={styles.filesList}>
          {value.map((file, index) => (
            <View
              key={index}
              style={[
                styles.fileItem,
                {
                  backgroundColor: theme.colors.background.surface,
                  borderColor: theme.colors.border.primary,
                },
              ]}
            >
              {/* Preview or icon */}
              {preview && isImage(file) ? (
                <Image source={{ uri: file.uri }} style={styles.preview} />
              ) : (
                <View
                  style={[
                    styles.fileIcon,
                    { backgroundColor: theme.colors.background.hover },
                  ]}
                >
                  <Feather
                    name="file"
                    size={24}
                    color={theme.colors.text.secondary}
                  />
                </View>
              )}

              {/* File info */}
              <View style={styles.fileInfo}>
                <Text
                  style={[
                    styles.fileName,
                    { color: theme.colors.text.primary },
                  ]}
                  numberOfLines={1}
                >
                  {file.name}
                </Text>
                <Text
                  style={[
                    styles.fileSize,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {formatSize(file.size)}
                </Text>
              </View>

              {/* Remove button */}
              <TouchableOpacity
                onPress={() => handleRemove(index)}
                style={styles.removeButton}
              >
                <Feather name="x" size={18} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {error && errorMessage && (
        <Text style={[styles.message, { color: theme.colors.status.error }]}>
          {errorMessage}
        </Text>
      )}

      {/* Warning badge */}
      <View style={[styles.warning, { backgroundColor: theme.colors.status.warningLight }]}>
        <Feather name="alert-triangle" size={12} color={theme.colors.status.warning} />
        <Text style={[styles.warningText, { color: theme.colors.status.warning }]}>
          Placeholder: Instalar expo-document-picker y expo-image-picker
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: DESIGN_TOKENS.spacing.xs,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    padding: DESIGN_TOKENS.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: DESIGN_TOKENS.spacing.sm,
  },
  uploadHint: {
    fontSize: 12,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
  filesList: {
    marginTop: DESIGN_TOKENS.spacing.md,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: DESIGN_TOKENS.spacing.sm,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    borderWidth: 1,
  },
  preview: {
    width: 48,
    height: 48,
    borderRadius: DESIGN_TOKENS.borderRadius.sm,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: DESIGN_TOKENS.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
    marginLeft: DESIGN_TOKENS.spacing.sm,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  message: {
    fontSize: 12,
    marginTop: DESIGN_TOKENS.spacing.xs,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: DESIGN_TOKENS.spacing.sm,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.borderRadius.sm,
    gap: DESIGN_TOKENS.spacing.xs,
  },
  warningText: {
    fontSize: 10,
    flex: 1,
  },
});

export default FileUpload;
