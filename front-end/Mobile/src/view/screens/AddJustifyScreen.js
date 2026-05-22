import React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../components/auth/PrimaryButton';
import Separador from '../components/common/Separador';
import styles from './Style';
import { useTheme } from '../components/common/ThemeContext';
import { useAddJustificationViewModel } from '../../viewmodels/useAddJustifyViewModel';

export default function AddJustification() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
    justificationType,
    setJustificationType,
    description,
    setDescription,
    date,
    setDate,
    time,
    setTime,
    isLoading,
    updateKey,
    handleBack,
    handleSubmit,
  } = useAddJustificationViewModel();

  return (
      <SafeAreaView
          style={[styles.safeAreaWhite, { backgroundColor: colors.background }]}
          key={`${updateKey}`}
      >
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardview}
        >
          <ScrollView
              style={styles.ScrollView}
              contentContainerStyle={styles.ScrollViewContent}
              showsVerticalScrollIndicator={false}
          >
            <View style={styles.containerAddJustification}>
              <Text style={[styles.mainTitleAddJustification, { color: colors.text }]}>
                {t('justify.title')}
              </Text>

              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {t('justify.addAbsence')}
              </Text>

              <Separador />

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('justify.selectDate')}
              </Text>

              <View style={styles.typeSelector}>
                {['inasistencia', 'retardo'].map(type => (
                    <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          {
                            backgroundColor:
                                justificationType === type ? colors.primary : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setJustificationType(type)}
                    >
                      <Text
                          style={[
                            styles.typeButtonText,
                            {
                              color: justificationType === type ? '#fff' : colors.text,
                            },
                          ]}
                      >
                        {type === 'inasistencia'
                            ? t('justify.absenceType')
                            : t('justify.delayType')}
                      </Text>
                    </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('justify.dateLabel')}
              </Text>
              <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={t('justify.dateFormat')}
                  placeholderTextColor={colors.textMuted}
                  value={date}
                  onChangeText={setDate}
              />

              {justificationType === 'retardo' && (
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
                            borderColor: colors.border,
                          },
                        ]}
                        placeholder={t('justify.timeFormat')}
                        placeholderTextColor={colors.textMuted}
                        value={time}
                        onChangeText={setTime}
                    />
                  </>
              )}

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
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={t('justify.descriptionPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('justify.attachDocument')}
              </Text>

              {/* Botón de adjuntar archivo (mock) */}
              <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    // Aquí en un futuro podrías abrir el selector de archivos
                    // y setear selectedFile. Por ahora queda como demostración.
                  }}
              >
                <Text style={[styles.uploadButtonText, { color: '#fff' }]}>
                  {t('justify.selectFile')}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.supportedFormats, { color: colors.textMuted }]}>
                {t('justify.supportedFormats')}
              </Text>

              <View style={styles.spacer} />

              <View style={styles.buttonContainer}>
                <PrimaryButton
                    title={t('justify.upload')}
                    onPress={handleSubmit}
                    isLoading={isLoading}
                />
              </View>

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