import React from 'react';
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    View,
} from 'react-native';
import PrimaryButton from '../../components/auth/PrimaryButton';
import { PasswordRequirement } from './PasswordRequirement';
import { calculatePasswordStrength } from '../../../utils/passwordValidator';
import styleAuth from './style/Style';

/**
 * Modal de nueva contraseña
 */
export function PasswordModal({
                                  visible,
                                  passwordUpdate,
                                  colors,
                                  t,
                                  newPasswordRef,
                                  confirmPasswordRef,
                                  onClose,
                              }) {
    const modalScale = React.useRef(new Animated.Value(0.92)).current;
    const modalOpacity = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(modalScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 120,
                    friction: 8
                }),
                Animated.timing(modalOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true
                }),
            ]).start();
        }
    }, [visible, modalScale, modalOpacity]);

    const strength = calculatePasswordStrength(
        passwordUpdate.requirements,
        passwordUpdate.newPassword.length
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styleAuth.modalWrapper}>
                            <ScrollView
                                contentContainerStyle={styleAuth.modalScrollContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Animated.View style={[
                                    styleAuth.passwordModalCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.border ?? colors.textSecondary + '50',
                                        transform: [{ scale: modalScale }],
                                        opacity: modalOpacity,
                                    },
                                ]}>
                                    {/* Encabezado */}
                                    <Text style={[styleAuth.passwordModalTitle, { color: colors.text }]}>
                                        {t('passwordUpdate.title', { defaultValue: 'Nueva contraseña' })}
                                    </Text>
                                    <Text style={[styleAuth.passwordModalDescription, { color: colors.textSecondary }]}>
                                        {t('passwordUpdate.description', {
                                            defaultValue: 'Crea una contraseña segura para tu cuenta.'
                                        })}
                                    </Text>

                                    <View style={[
                                        styleAuth.passwordModalDivider,
                                        { backgroundColor: colors.border ?? colors.textSecondary + '30' }
                                    ]} />

                                    {/* Campo nueva contraseña */}
                                    <View style={styleAuth.passwordFieldWrapper}>
                                        <TextInput
                                            ref={newPasswordRef}
                                            style={[styleAuth.passwordModalInput, {
                                                borderColor: colors.border ?? colors.textSecondary + '50',
                                                color: colors.text,
                                                backgroundColor: colors.background,
                                                paddingRight: 48,
                                            }]}
                                            placeholder={t('passwordUpdate.newPassword', {
                                                defaultValue: 'Nueva contraseña'
                                            })}
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!passwordUpdate.showNewPassword}
                                            value={passwordUpdate.newPassword}
                                            onChangeText={(v) => {
                                                passwordUpdate.setNewPassword(v);
                                                passwordUpdate.clearError();
                                            }}
                                            returnKeyType="next"
                                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                            accessibilityLabel="Nueva contraseña"
                                            accessibilityHint="Debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales"
                                            editable={!passwordUpdate.isLoading}
                                        />
                                        <TouchableOpacity
                                            style={styleAuth.eyeButton}
                                            onPress={() => passwordUpdate.setShowNewPassword(!passwordUpdate.showNewPassword)}
                                            accessibilityLabel={passwordUpdate.showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            accessibilityRole="button"
                                        >
                                            <Image
                                                source={
                                                    passwordUpdate.showNewPassword
                                                        ? require('../../../assets/images/lupa.png')
                                                        : require('../../../assets/images/esconder.png')
                                                }
                                                style={{ width: 24, height: 24, resizeMode: 'contain' }}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Barra de fortaleza */}
                                    {passwordUpdate.newPassword.length > 0 && (
                                        <View style={styleAuth.strengthBarContainer}>
                                            <View style={styleAuth.strengthBarTrack}>
                                                <View style={[styleAuth.strengthBarFill, {
                                                    width: `${(strength.score / 5) * 100}%`,
                                                    backgroundColor: strength.color,
                                                }]} />
                                            </View>
                                            <Text style={[styleAuth.strengthLabel, { color: strength.color }]}>
                                                {strength.label}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Requisitos */}
                                    <View style={styleAuth.passwordReqContainer}>
                                        <PasswordRequirement
                                            met={passwordUpdate.requirements.length}
                                            label={t('passwordUpdate.reqLength', { defaultValue: 'Mínimo 8 caracteres' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={passwordUpdate.requirements.uppercase}
                                            label={t('passwordUpdate.reqUppercase', { defaultValue: 'Al menos una mayúscula' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={passwordUpdate.requirements.lowercase}
                                            label={t('passwordUpdate.reqLowercase', { defaultValue: 'Al menos una minúscula' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={passwordUpdate.requirements.number}
                                            label={t('passwordUpdate.reqNumber', { defaultValue: 'Al menos un número' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={passwordUpdate.requirements.special}
                                            label={t('passwordUpdate.reqSpecial', { defaultValue: 'Al menos un carácter especial (!@#$...)' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={passwordUpdate.requirements.notCommon}
                                            label={t('passwordUpdate.reqNotCommon', { defaultValue: 'No es una contraseña común' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={passwordUpdate.requirements.noSequential}
                                            label={t('passwordUpdate.reqNoSequential', { defaultValue: 'Sin patrones secuenciales (123, abc)' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={passwordUpdate.requirements.noRepeated}
                                            label={t('passwordUpdate.reqNoRepeated', { defaultValue: 'Sin caracteres repetidos (aaa, 111)' })}
                                            colors={colors}
                                        />
                                    </View>

                                    {/* Campo confirmar contraseña */}
                                    <View style={styleAuth.passwordFieldWrapper}>
                                        <TextInput
                                            ref={confirmPasswordRef}
                                            style={[styleAuth.passwordModalInput, {
                                                borderColor: passwordUpdate.confirmPassword && !passwordUpdate.passwordsMatch
                                                    ? (colors.error ?? '#E53E3E')
                                                    : (colors.border ?? colors.textSecondary + '50'),
                                                color: colors.text,
                                                backgroundColor: colors.background,
                                                paddingRight: 48,
                                            }]}
                                            placeholder={t('passwordUpdate.confirmPassword', {
                                                defaultValue: 'Confirmar contraseña'
                                            })}
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!passwordUpdate.showConfirmPassword}
                                            value={passwordUpdate.confirmPassword}
                                            onChangeText={(v) => {
                                                passwordUpdate.setConfirmPassword(v);
                                                passwordUpdate.clearError();
                                            }}
                                            returnKeyType="done"
                                            onSubmitEditing={passwordUpdate.updatePassword}
                                            accessibilityLabel="Confirmar contraseña"
                                            editable={!passwordUpdate.isLoading}
                                        />
                                        <TouchableOpacity
                                            style={styleAuth.eyeButton}
                                            onPress={() => passwordUpdate.setShowConfirmPassword(!passwordUpdate.showConfirmPassword)}
                                            accessibilityLabel={passwordUpdate.showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                                            accessibilityRole="button"
                                        >
                                            <Image
                                                source={
                                                    passwordUpdate.showConfirmPassword
                                                        ? require('../../../assets/images/lupa.png')
                                                        : require('../../../assets/images/esconder.png')
                                                }
                                                style={{ width: 24, height: 24, resizeMode: 'contain' }}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Indicador de coincidencia */}
                                    {passwordUpdate.confirmPassword.length > 0 && (
                                        <Text style={[styleAuth.passwordMatchIndicator, {
                                            color: passwordUpdate.passwordsMatch
                                                ? (colors.success ?? '#38A169')
                                                : (colors.error ?? '#E53E3E'),
                                        }]} accessibilityLiveRegion="polite">
                                            {passwordUpdate.passwordsMatch
                                                ? t('passwordUpdate.passwordsMatch', { defaultValue: '✓ Las contraseñas coinciden' })
                                                : t('passwordUpdate.passwordsNoMatch', { defaultValue: '✗ Las contraseñas no coinciden' })}
                                        </Text>
                                    )}

                                    {/* Error general */}
                                    {passwordUpdate.error && (
                                        <View style={[styleAuth.passwordModalErrorRow, {
                                            backgroundColor: (colors.error ?? '#E53E3E') + '12',
                                            borderColor: (colors.error ?? '#E53E3E') + '35',
                                        }]}>
                                            <Text style={[styleAuth.passwordModalError, { color: colors.error ?? '#E53E3E' }]}>
                                                {passwordUpdate.error.message}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Botones */}
                                    <View style={styleAuth.passwordModalButtons}>
                                        <View style={{ width: '100%' }}>
                                            <PrimaryButton
                                                title={
                                                    passwordUpdate.isLoading
                                                        ? t('passwordUpdate.saving', { defaultValue: 'Guardando...' })
                                                        : t('passwordUpdate.saveButton', { defaultValue: 'Guardar contraseña' })
                                                }
                                                onPress={passwordUpdate.updatePassword}
                                                disabled={!passwordUpdate.canSubmit}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={onClose}
                                            style={styleAuth.passwordModalCancelButton}
                                            accessibilityLabel="Cancelar y descartar cambios"
                                            accessibilityRole="button"
                                        >
                                            <Text style={[styleAuth.passwordModalCancelText, { color: colors.primary }]}>
                                                {t('common.cancel', { defaultValue: 'Cancelar' })}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    );
}