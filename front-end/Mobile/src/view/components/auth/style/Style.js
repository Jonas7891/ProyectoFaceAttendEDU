import {Platform, StyleSheet} from 'react-native';

const styleAuth = StyleSheet.create({
    /* ── CodeInput ───────────────────────────────────────────── */
    codeInputRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    codeDigit: {
        width: 44,
        height: 52,
        marginHorizontal: 4,
        borderWidth: 2,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
    },

    /* ── PasswordRequirement ─────────────────────────────────── */
    passwordReqRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3,
    },
    passwordReqIcon: {
        fontSize: 14,
        width: 16,
        marginRight: 8,
        textAlign: 'center',
    },
    passwordReqText: {
        fontSize: 13,
    },

    /* ── PasswordModal ───────────────────────────────────────── */
    modalWrapper: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    passwordModalCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {elevation: 8},
        }),
    },
    passwordModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    passwordModalDescription: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 6,
    },
    passwordModalDivider: {
        height: 1,
        marginVertical: 14,
    },
    passwordFieldWrapper: {
        marginBottom: 12,
    },
    passwordModalInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 4,
    },
    strengthBarContainer: {
        marginBottom: 10,
    },
    strengthBarTrack: {
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
    },
    strengthBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    passwordReqContainer: {
        marginBottom: 12,
    },
    passwordMatchIndicator: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    passwordModalErrorRow: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
    },
    passwordModalError: {
        fontSize: 13,
    },
    passwordModalButtons: {
        alignItems: 'center',
        marginTop: 8,
    },
    passwordModalCancelButton: {
        marginTop: 12,
        padding: 8,
    },
    passwordModalCancelText: {
        fontSize: 14,
        fontWeight: '600',
    },

    /* ── SuccessScreen ───────────────────────────────────────── */
    safeAreaWhite: {
        flex: 1,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 12,
    },

    /* ── Botón primario (compartido) ─────────────────────────── */
    recoveryPrimaryButton: {
        borderRadius: 12,
        paddingVertical: 14,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recoveryPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    dangerButton: {
        backgroundColor: '#ff0000',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 70,
    },
    dangerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },
    buttonPrimary: {
        backgroundColor: '#1081D2',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#1081D2',
        width: "100%",
        alignSelf: 'center',
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonDisabledPrimary: {
        textAlign: 'center',
        opacity: 0.6,
    },
    textPrimaryButton: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    overlayRegister: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainerRegister: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 20,
    },
    titleRegister: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0B5FA5',
        marginBottom: 16,
        textAlign: 'center',
    },
    contentRegister: {
        marginBottom: 20,
    },
    paragraphRegister: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 14
    },
    buttonRegister: {
        backgroundColor: '#118FC3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonTextRegister: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default styleAuth;