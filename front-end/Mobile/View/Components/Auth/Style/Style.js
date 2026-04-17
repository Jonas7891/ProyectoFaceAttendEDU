import { StyleSheet, Platform } from 'react-native';

const stylesAuth = StyleSheet.create({
    button: {
        backgroundColor: '#ff0000',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ff0000',
        width: 200,
        alignSelf: 'center',
        position: 'absolute',
        bottom: -80,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    container: {
        alignSelf: "center",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
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
    containerSelectable: {
        flexDirection: 'row',
        alignItems: 'left',
        paddingVertical: 12,
        marginTop: 10,
        alignSelf: 'left',
    },
    checkboxSelectable: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#1081D2',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxCheckedSelectable: {
        backgroundColor: '#1081D2',
    },
    checkboxDisabledSelectable: {
        opacity: 0.5,
    },
    checkmarkSelectable: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textSelectable: {
        color: '#333333',
        fontSize: 16,
        fontWeight: '500',
    },
    textDisabledSelectable: {
        opacity: 0.5,
    },
    containerDisabledSelectable: {
        opacity: 0.6,
    },
    overlayTerminos: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainerTerminos: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 20,
    },
    titleTerminos: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0B5FA5',
        marginBottom: 16,
        textAlign: 'center',
    },
    contentTerminos: {
        marginBottom: 20,
    },
    paragraphTerminos: {
        fontSize: 17,
        color: '#374151',
        marginBottom: 14,
        lineHeight: 24,
    },
    buttonTerminos: {
        backgroundColor: '#118FC3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonTextTerminos: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    subtitleTerminos: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0B5FA5',
    },
});

export default stylesAuth;