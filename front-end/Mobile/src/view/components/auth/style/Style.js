import { StyleSheet, Platform } from 'react-native';

const styleAuth = StyleSheet.create({
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
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    logoutIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        tintColor: '#ff0000',
    },
    logoutText: {
        color: '#ff0000',
        fontSize: 14,
        fontWeight: '600',
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