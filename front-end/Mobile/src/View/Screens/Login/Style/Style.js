import { StyleSheet, Platform } from 'react-native';

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
    keyboardView: {
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
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    bottomSpace: {
        height: 90,
    },

    // ========== HOMES SCREEN STYLES ==========
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
});

export default styles;