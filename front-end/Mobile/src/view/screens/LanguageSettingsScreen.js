import React from 'react';
import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  View,
  Modal,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { useTheme } from '../components/common/ThemeContext';
import { useAlertsConfig } from '../../utils/AlertsConfigContext';
import ScrollViewWrapper from '../components/common/ScrollView';
import PrimaryButton from '../components/auth/PrimaryButton';
import styles from './Style';
import { useLanguageSettingsViewModel } from '../../viewmodels/useLanguageSettingsViewModel';

export default function LanguageSettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { alertsConfig, toggleAlertType } = useAlertsConfig();
  const [showAlertsModal, setShowAlertsModal] = React.useState(false);

  const {
    selectedLanguage,
    setSelectedLanguage,
    selectedTheme,
    setSelectedTheme,
    isLoading,
    componentKey,
    languages,
    themes,
    handleSave,
    handleBack,
  } = useLanguageSettingsViewModel();

  return (
      <SafeAreaView
          style={[
            styles.languageSettingsSafeArea,
            { backgroundColor: colors.background },
          ]}
          key={componentKey}
      >
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollViewWrapper>
            <View style={[{marginHorizontal: 25}]} >
              <Text
                  style={[
                    styles.languageSettingsTitle,
                    { color: colors.text, marginTop: 30 },
                  ]}
              >
                {t('settings.language')}
              </Text>

              <Text
                  style={[
                    styles.languageSettingsSubtitle,
                    { color: colors.textSecondary },
                  ]}
              >
                {t('settings.selectLanguage')}
              </Text>

              {languages.map((lang) => (
                  <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.languageSettingsOption,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                        selectedLanguage === lang.code && {
                          borderColor: colors.primary,
                          backgroundColor: colors.primary + '20',
                        },
                      ]}
                      onPress={() => setSelectedLanguage(lang.code)}
                  >
                    <Text
                        style={[
                          styles.languageSettingsOptionText,
                          { color: colors.text },
                        ]}
                    >
                      {lang.flag} {lang.name}
                    </Text>

                    {selectedLanguage === lang.code && (
                        <Text
                            style={[
                              styles.languageSettingsCheckmark,
                              { color: colors.primary },
                            ]}
                        >
                          ✓
                        </Text>
                    )}
                  </TouchableOpacity>
              ))}

              <Text
                  style={[
                    styles.languageSettingsTitle,
                    { marginTop: 28, color: colors.text },
                  ]}
              >
                {t('settings.theme', {
                  defaultValue: 'Apariencia',
                })}
              </Text>

              <Text
                  style={[
                    styles.languageSettingsSubtitle,
                    { color: colors.textSecondary },
                  ]}
              >
                {t('settings.selectTheme', {
                  defaultValue:
                      'Selecciona el tema de la aplicación',
                })}
              </Text>

              {themes.map((th) => (
                  <TouchableOpacity
                      key={th.code}
                      style={[
                        styles.languageSettingsOption,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                        selectedTheme === th.code && {
                          borderColor: colors.primary,
                          backgroundColor: colors.primary + '20',
                        },
                      ]}
                      onPress={() => setSelectedTheme(th.code)}
                  >
                    <Text
                        style={[
                          styles.languageSettingsOptionText,
                          { color: colors.text },
                        ]}
                    >
                      {th.icon} {th.label}
                    </Text>

                    {selectedTheme === th.code && (
                        <Text
                            style={[
                              styles.languageSettingsCheckmark,
                              { color: colors.primary },
                            ]}
                        >
                          ✓
                        </Text>
                    )}
                  </TouchableOpacity>
              ))}

              <Text
                  style={[
                    styles.languageSettingsTitle,
                    { marginTop: 28, color: colors.text },
                  ]}
              >
                {t('settings.alertsConfiguration', {
                  defaultValue: 'Configuración de Alertas',
                })}
              </Text>

              <Text
                  style={[
                    styles.languageSettingsSubtitle,
                    { color: colors.textSecondary },
                  ]}
              >
                {t('settings.alertsConfigDesc', {
                  defaultValue:
                      'Personaliza qué tipos de alertas deseas recibir',
                })}
              </Text>

              <TouchableOpacity
                  style={[
                    styles.languageSettingsOption,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowAlertsModal(true)}
              >
                <Text
                    style={[
                      styles.languageSettingsOptionText,
                      { color: colors.text },
                    ]}
                >
                  {t('settings.configureAlerts', {
                    defaultValue: 'Configurar Alertas',
                  })}
                </Text>

                <Text
                    style={{
                      fontSize: 18,
                      color: colors.primary,
                    }}
                >
                  ›
                </Text>
              </TouchableOpacity>

              <PrimaryButton
                  title={t('common.save')}
                  onPress={handleSave}
                  isLoading={isLoading}
              />

              <TouchableOpacity
                  onPress={handleBack}
                  style={styles.secondaryButton}
              >
                <Text
                    style={[
                      styles.secondaryButtonText,
                      { color: colors.textSecondary },
                    ]}
                >
                  {t('common.back')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollViewWrapper>

          {/* ═══ MODAL DE CONFIGURACIÓN DE ALERTAS ═══ */}
          <Modal
              visible={showAlertsModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowAlertsModal(false)}
          >
            <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 15,
                }}
            >
              <View
                  style={[
                    {
                      backgroundColor: colors.card,
                      borderRadius: 15,
                      padding: 20,
                      width: '100%',
                      maxHeight: '85%',
                    },
                  ]}
              >
                <Text
                    style={[
                      styles.languageSettingsTitle,
                      {
                        color: colors.text,
                        marginBottom: 5,
                      },
                    ]}
                >
                  🔔{' '}
                  {t('settings.configureAlerts', {
                    defaultValue: 'Configurar Alertas',
                  })}
                </Text>

                <Text
                    style={[
                      styles.languageSettingsSubtitle,
                      {
                        color: colors.textSecondary,
                        marginBottom: 15,
                      },
                    ]}
                >
                  {t('settings.selectAlertTypes', {
                    defaultValue:
                        'Selecciona qué tipos de alertas deseas ver',
                  })}
                </Text>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                      paddingBottom: 10,
                    }}
                >
                  {/* Alerta de Éxito */}
                  <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor:
                            colors.border ??
                            colors.textSecondary + '20',
                        marginBottom: 5,
                      }}
                  >
                    <View
                        style={{
                          flex: 1,
                          marginRight: 12,
                        }}
                    >
                      <Text
                          style={[
                            styles.languageSettingsOptionText,
                            { color: colors.text },
                          ]}
                      >
                        {t('settings.successAlerts', {
                          defaultValue: 'Alertas de Éxito',
                        })}
                      </Text>

                      <Text
                          style={[
                            styles.languageSettingsSubtitle,
                            {
                              color: colors.textSecondary,
                              fontSize: 12,
                              marginTop: 4,
                              textAlign: 'left',
                            },
                          ]}
                      >
                        {t('settings.successAlertsDesc', {
                          defaultValue:
                              'Confirmación de operaciones exitosas',
                        })}
                      </Text>
                    </View>

                    <Switch
                        value={alertsConfig.enableSuccess}
                        onValueChange={() =>
                            toggleAlertType('success')
                        }
                        trackColor={{
                          false: colors.textSecondary + '40',
                          true: colors.success + '70',
                        }}
                        thumbColor={
                          alertsConfig.enableSuccess
                              ? colors.success
                              : colors.textSecondary
                        }
                    />
                  </View>

                  {/* Alerta de Error */}
                  <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor:
                            colors.border ??
                            colors.textSecondary + '20',
                        marginBottom: 5,
                      }}
                  >
                    <View
                        style={{
                          flex: 1,
                          marginRight: 12,
                        }}
                    >
                      <Text
                          style={[
                            styles.languageSettingsOptionText,
                            { color: colors.text },
                          ]}
                      >
                        {t('settings.errorAlerts', {
                          defaultValue: 'Alertas de Error',
                        })}
                      </Text>

                      <Text
                          style={[
                            styles.languageSettingsSubtitle,
                            {
                              color: colors.textSecondary,
                              fontSize: 12,
                              marginTop: 4,
                              textAlign: 'left',
                            },
                          ]}
                      >
                        {t('settings.errorAlertsDesc', {
                          defaultValue:
                              'Notificaciones de errores y problemas',
                        })}
                      </Text>
                    </View>

                    <Switch
                        value={alertsConfig.enableError}
                        onValueChange={() =>
                            toggleAlertType('error')
                        }
                        trackColor={{
                          false: colors.textSecondary + '40',
                          true: colors.error + '70',
                        }}
                        thumbColor={
                          alertsConfig.enableError
                              ? colors.error
                              : colors.textSecondary
                        }
                    />
                  </View>

                  {/* Alerta de Advertencia */}
                  <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor:
                            colors.border ??
                            colors.textSecondary + '20',
                        marginBottom: 5,
                      }}
                  >
                    <View
                        style={{
                          flex: 1,
                          marginRight: 12,
                        }}
                    >
                      <Text
                          style={[
                            styles.languageSettingsOptionText,
                            { color: colors.text },
                          ]}
                      >
                        {t('settings.warningAlerts', {
                          defaultValue:
                              'Alertas de Advertencia',
                        })}
                      </Text>

                      <Text
                          style={[
                            styles.languageSettingsSubtitle,
                            {
                              color: colors.textSecondary,
                              fontSize: 12,
                              marginTop: 4,
                              textAlign: 'left',
                            },
                          ]}
                      >
                        {t('settings.warningAlertsDesc', {
                          defaultValue:
                              'Advertencias y notificaciones importantes',
                        })}
                      </Text>
                    </View>

                    <Switch
                        value={alertsConfig.enableWarning}
                        onValueChange={() =>
                            toggleAlertType('warning')
                        }
                        trackColor={{
                          false: colors.textSecondary + '40',
                          true:
                              (colors.warning ?? '#FF9800') + '70',
                        }}
                        thumbColor={
                          alertsConfig.enableWarning
                              ? colors.warning ?? '#FF9800'
                              : colors.textSecondary
                        }
                    />
                  </View>

                  {/* Alerta de Confirmación */}
                  <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor:
                            colors.border ??
                            colors.textSecondary + '20',
                        marginBottom: 5,
                      }}
                  >
                    <View
                        style={{
                          flex: 1,
                          marginRight: 12,
                        }}
                    >
                      <Text
                          style={[
                            styles.languageSettingsOptionText,
                            { color: colors.text },
                          ]}
                      >
                        {t('settings.confirmAlerts', {
                          defaultValue:
                              'Alertas de Confirmación',
                        })}
                      </Text>

                      <Text
                          style={[
                            styles.languageSettingsSubtitle,
                            {
                              color: colors.textSecondary,
                              fontSize: 12,
                              marginTop: 4,
                              textAlign: 'left',
                            },
                          ]}
                      >
                        {t('settings.confirmAlertsDesc', {
                          defaultValue:
                              'Solicitudes de confirmación de acciones',
                        })}
                      </Text>
                    </View>

                    <Switch
                        value={alertsConfig.enableConfirm}
                        onValueChange={() =>
                            toggleAlertType('confirm')
                        }
                        trackColor={{
                          false: colors.textSecondary + '40',
                          true: colors.primary + '70',
                        }}
                        thumbColor={
                          alertsConfig.enableConfirm
                              ? colors.primary
                              : colors.textSecondary
                        }
                    />
                  </View>

                  {/* Alerta por Defecto */}
                  <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        paddingVertical: 12,
                      }}
                  >
                    <View
                        style={{
                          flex: 1,
                          marginRight: 12,
                        }}
                    >
                      <Text
                          style={[
                            styles.languageSettingsOptionText,
                            { color: colors.text },
                          ]}
                      >
                        {t('settings.defaultAlerts', {
                          defaultValue:
                              'Alertas Generales',
                        })}
                      </Text>

                      <Text
                          style={[
                            styles.languageSettingsSubtitle,
                            {
                              color: colors.textSecondary,
                              fontSize: 12,
                              marginTop: 4,
                              textAlign: 'left',
                            },
                          ]}
                      >
                        {t('settings.defaultAlertsDesc', {
                          defaultValue:
                              'Mensajes informativos generales',
                        })}
                      </Text>
                    </View>

                    <Switch
                        value={alertsConfig.enableDefault}
                        onValueChange={() =>
                            toggleAlertType('default')
                        }
                        trackColor={{
                          false: colors.textSecondary + '40',
                          true: colors.primary + '70',
                        }}
                        thumbColor={
                          alertsConfig.enableDefault
                              ? colors.primary
                              : colors.textSecondary
                        }
                    />
                  </View>
                </ScrollView>

                {/* Botón Cerrar */}
                <TouchableOpacity
                    onPress={() => setShowAlertsModal(false)}
                    style={{
                      marginTop: 15,
                      backgroundColor: colors.primary,
                      padding: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                >
                  <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: '600',
                      }}
                  >
                    {t('common.close', {
                      defaultValue: 'Cerrar',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}