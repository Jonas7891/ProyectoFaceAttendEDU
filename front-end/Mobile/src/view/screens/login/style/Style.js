import {Platform, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        marginTop: 10
    },
    safeAreaWhite: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeAreaFacialFail: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        marginTop: Platform.OS === 'android' ? 25 : 20
    },
    keyboardview: {
        flex: 1,
    },
    container: {
        flex: 1,
        marginHorizontal: 12,
        paddingTop: 15,
    },
    containerDefault: {
        flex: 1,
        justifyContent: "space-between",
    },
    scrollContent: {
        flexGrow: 1,
    },
    ScrollViewContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    bottomSpace: {
        height: 90,
    },

    // ========== LOGIN SCREEN ==========
    contentContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    logoContainer: {
        marginTop: 40,
    },
    textoSesion: {
        textAlign: "left",
        color: "#000000",
        fontWeight: "700",
        fontSize: 30,
        marginBottom: 10,
        marginTop: 10,
    },
    textoCredenciales: {
        textAlign: "left",
        color: "#666666",
        fontWeight: "400",
        fontSize: 16,
        marginBottom: 30,
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputTitulo: {
        textAlign: "left",
        color: "#000000",
        fontWeight: "500",
        marginBottom: 8,
        fontSize: 16,
    },
    inputEscrito: {
        textAlign: "left",
        color: "#000000",
        fontWeight: "400",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#FFFFFF",
    },
    noRegistro: {
        color: "#666666",
        fontSize: 14,
        textAlign: "center",
    },
    sesionNoRegistro: {
        marginHorizontal: 60,
        marginTop: 120,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    terminosText: {
        marginLeft: -4,
        marginTop: 10,
        fontSize: 14,
        color: '#0B5FA5',
        textDecorationLine: 'underline',
    },

    // ── Link "¿Olvidaste tu contraseña?" ──
    forgotPasswordContainer: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#0B5FA5',
        textDecorationLine: 'underline',
        fontWeight: '500',
    },

    // ========== RECOVERY / VERIFY SCREENS ==========
    backButton: {
        paddingHorizontal: 15,
        paddingTop: 8,
        paddingBottom: 4,
    },
    backButtonText: {
        fontSize: 17,
        color: '#0B5FA5',
        fontWeight: '500',
    },
    recoveryIconContainer: {
        marginTop: 24,
        marginBottom: 12,
    },
    recoveryIcon: {
        fontSize: 48,
    },
    recoveryErrorBox: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
    },
    recoveryErrorText: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    recoveryPrimaryButton: {
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    recoveryPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // ── Input código alfanumérico ──
    codeInput: {
        textAlign: 'center',
        color: "#000000",
        fontWeight: '700',
        fontSize: 26,
        letterSpacing: 8,
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 14,
        backgroundColor: "#FFFFFF",
    },

    // ========== SUCCESS SCREEN ==========
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    successIcon: {
        fontSize: 64,
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },

    // ========== PASSWORD MODAL (PasswordUpdateModal + VerifyCodeScreen) ==========
    modalWrapper: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    modalScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    passwordModalCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 10,
    },
    passwordModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
    },
    passwordModalDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    passwordModalDivider: {
        height: 1,
        marginBottom: 20,
    },
    passwordModalInput: {
        fontSize: 15,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
    },
    passwordModalErrorRow: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
    },
    passwordModalError: {
        fontSize: 13,
        fontWeight: '500',
    },
    passwordModalButtons: {
        marginTop: 8,
        alignItems: 'center',
    },
    passwordModalCancelButton: {
        marginTop: 14,
        paddingVertical: 8,
    },
    passwordModalCancelText: {
        fontSize: 15,
        fontWeight: '500',
    },

    // ── Trigger button (PasswordUpdateModal original) ──
    passwordSettingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
    },
    passwordSettingsTitle: {
        fontSize: 16,
        fontWeight: '500',
    },

    // ── Fortaleza de contraseña ──
    strengthBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -8,
        marginBottom: 12,
        gap: 10,
    },
    strengthBarTrack: {
        flex: 1,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E2E8F0',
        overflow: 'hidden',
    },
    strengthBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 64,
        textAlign: 'right',
    },

    // ── Requisitos de contraseña ──
    passwordReqContainer: {
        marginBottom: 16,
        gap: 5,
    },
    passwordReqRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    passwordReqIcon: {
        fontSize: 13,
        fontWeight: '700',
        width: 16,
        textAlign: 'center',
    },
    passwordReqText: {
        fontSize: 13,
    },

    // ── Campo con ojo (mostrar/ocultar contraseña) ──
    passwordFieldWrapper: {
        position: 'relative',
        marginBottom: 0,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        top: 9.5,
        bottom: 12,
    },

    // ── Indicador de coincidencia ──
    passwordMatchIndicator: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: -8,
        marginBottom: 14,
    },

    eyeIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },

    codeInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
    },

    codeDigit: {
        width: 48,
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
    },
});

export default styles;