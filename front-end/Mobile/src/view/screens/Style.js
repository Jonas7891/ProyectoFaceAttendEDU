import {Platform, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    safeAreaWhite: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeAreaFacialFail: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        marginTop: Platform.OS === 'android' ? 25 : 0
    },
    keyboardview: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingTop: 15,
        marginHorizontal: 20
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

    // ========== DASHBOARD styles ==========
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginTop: 20,
        marginBottom: 20,
    },
    dataBar: {
        flex: 1,
    },
    leftContent: {
        flex: 1,
    },
    greeting: {
        fontSize: 14,
        color: "#666666",
        marginBottom: 4,
    },
    adminName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: "#999999",
    },
    notificationButton: {
        position: "relative",
        padding: 8,
    },
    notificationBadge: {
        position: "absolute",
        top: 2,
        right: 2,
        backgroundColor: "#F44336",
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    notificationCount: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "bold",
    },
    statsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIcon: {
        width: 32,
        height: 32,
        marginBottom: 8,
        tintColor: "#4CAF50",
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#000000",
        marginVertical: 8,
    },
    statLabel: {
        fontSize: 12,
        color: "#666666",
    },
    attendanceIndicator: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    indicatorHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    percentageText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#4CAF50",
    },
    progressBar: {
        height: 8,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#4CAF50",
        borderRadius: 4,
    },
    indicatorDetails: {
        alignItems: "center",
    },
    indicatorText: {
        fontSize: 12,
        color: "#666666",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 15,
    },
    quickActionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 25,
    },
    quickActionCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    actionIconImage: {
        width: 28,
        height: 28,
        tintColor: "#FFFFFF",
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000000",
        textAlign: "center",
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 11,
        color: "#666666",
        textAlign: "center",
    },
    recentSection: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    seeAllText: {
        fontSize: 12,
        color: "#4CAF50",
        fontWeight: "500",
    },
    recentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    recentItemHistorical: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginRight: 20,
        marginLeft: 20,
    },
    recentInfo: {
        flex: 1,
    },
    recentName: {
        fontSize: 17,
        fontWeight: "500",
        color: "#000000",
    },
    recentTime: {
        fontSize: 15,
        color: "#999999",
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusPresente: {
        backgroundColor: "#E8F5E9",
    },
    statusTarde: {
        backgroundColor: "#FFF3E0",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "500",
    },
    statusTextPresente: {
        color: "#4CAF50",
    },
    statusTextTarde: {
        color: "#FF9800",
    },
    novedadesSection: {
        marginBottom: 20,
    },
    novedadCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    novedadIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    novedadIconImage: {
        width: 20,
        height: 20,
        tintColor: "#FFFFFF",
    },
    novedadSuccess: {
        backgroundColor: "#4CAF50",
    },
    novedadWarning: {
        backgroundColor: "#FF9800",
    },
    novedadInfo: {
        backgroundColor: "#2196F3",
    },
    novedadContent: {
        flex: 1,
    },
    novedadTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 2,
    },
    novedadDescripcion: {
        fontSize: 12,
        color: "#666666",
        marginBottom: 4,
    },
    novedadTiempo: {
        fontSize: 10,
        color: "#999999",
    },

    // ========= UPDATE PHOTO SCREEN styles ==========
    imagePhoto: {
        width: 150,
        height: 150,
        marginBottom: 20,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A2E',
        textAlign: 'center',
        alignSelf: 'center',
    },
    instructionText: {
        marginHorizontal: 20,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 20,
        textAlign: 'center',
    },
    registerButton: {
        backgroundColor: '#4CAF50',
        marginHorizontal: 20,
        marginVertical: 15,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#4CAF50',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        alignSelf: 'center',
    },
    registerButtonSuccess: {
        backgroundColor: '#2E7D32',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: "#FFFFFF",
    },
    settingsContainer: {
        marginTop: 10,
        alignSelf: "center",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    settingsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIcon: {
        width: 40,
        height: 40,
        tintColor: "black"
    },
    settingsText: {
        color: 'black',
        fontSize: 20,
        fontWeight: '600',
    },
    footer: {
        height: 40,
    },
    keyboardAvoidingViewUpdatePhoto: {
        flex: 1,
    },
    scrollViewContentUpdatePhoto: {
        paddingBottom: 40,
    },
    mainContainerUpdatePhoto: {
        paddingHorizontal: 20,
    },
    imageContainerUpdatePhoto: {
        alignItems: "center",
        marginTop: 20,
    },
    formCardDarkUpdatePhoto: {
        borderWidth: 1,
    },
    inputFieldContainerUpdatePhoto: {
        marginBottom: 15,
    },
    registerButtonSuccessUpdatePhoto: {
        backgroundColor: "#2da351",
    },
    registerButtonTextUpdatePhoto: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    registerButtonIconUpdatePhoto: {
        width: 22,
        height: 22,
        tintColor: "#fff",
        marginRight: 8,
    },
    backButtonContainerUpdatePhoto: {
        marginTop: 20,
    },
    spacerUpdatePhoto: {
        height: 10,
    },
    smallSpacerUpdatePhoto: {
        height: 5,
    },
    largeSpacerUpdatePhoto: {
        height: 20,
    },

    // ========== HOMES SCREEN styleS ==========
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

    // ========== MENU SCREEN styleS ==========
    ScrollView: {
        flex: 1,
    },
    containerMenu: {
        flex: 1,
    },
    containerSesion: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        alignItems: "left",
    },
    userText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 15,
        color: "#000000",
    },
    sectionTitleMenu: {
        fontSize: 18,
        fontFamily: "Bold",
        textAlign: "justify",
        marginBottom: 15,
        color: "#000000",
        fontWeight: '600',
        marginTop: 15,
        alignSelf: "left",
    },
    backIcon: {
        top: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    backIconImage: {
        width: '80%',
        height: '80%',
    },
    arrowImage: {
        transform: [{rotate: '180deg'}],
        width: 26,
        height: 26,
        marginLeft: "auto",
        opacity: 0.5,
    },

    // ========== FACIAL FAIL SCREEN STYLES ==========
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        marginTop: 10,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: "800",
        flex: 1,
        textAlign: "left",
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 24,
        marginBottom: 24,
        opacity: 0.8,
    },
    optionCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    optionDescription: {
        fontSize: 14,
        lineHeight: 22,
        fontStyle: "italic",
    },
    separator: {
        height: 1,
        marginVertical: 32,
        opacity: 0.1,
    },
    recommendationsTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        marginTop: 20,
        textAlign: "left",
    },
    recommendationCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
    },
    recommendationSubtitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    recommendationText: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: "left",
    },
    buttonContainerFixed: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 100,
        alignItems: 'center',
    },

    // ========== HISTORICAL SCREEN styleS ==========
    informacionContainer: {
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: "#B5EAF4",
        borderRadius: 10,
    },
    informacionText: {
        fontSize: 25,
        fontWeight: "800",
        color: "#000000",
        alignSelf: "center",
        marginTop: 25,
        marginBottom: 25,
    },
    iconSearch: {
        width: 28,
        height: 28,
        tintColor: "#000",
    },

    // ========== DISPLAYING ATTENDANCE SCREEN styleS ==========
    filterButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 10
    },
    filterButton: {
        padding: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: "center"
    },
    activeFilter: {
        backgroundColor: "#41c0ff"
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        margin: 10,
        borderRadius: 5
    },
    filterButtonText: {
        fontSize: 15,
        color: "#000",
        fontWeight: "700"
    },
    containerAttendance: {
        flex: 1,
        marginTop: 20,
        marginHorizontal: 10,
    },

    // ========== MENU JUSTIFY SCREEN styleS ==========
    containerMenuJustify: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginTop: 40,
    },

    mainContent: {
        flex: 1,
    },

    spacer: {
        flex: 1,
        minHeight: 20,
    },

    buttonContainer: {
        marginBottom: Platform.OS === 'ios' ? 60 : 130,
        marginHorizontal: 20
    },

    menuItem: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 5,
    },

    // ========== ESTILOS PARA PANTALLA DE JUSTIFICACIONES VÁLIDAS ==========
    containerValidJustifications: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },

    mainTitleValidJustifications: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A1A1A",
        textAlign: "center",
        paddingTop: Platform.OS === "android" ? 30 : 10,
        marginBottom: 10,
    },

    subTitleValidJustifications: {
        fontSize: 16,
        fontWeight: "500",
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },

    // Selector de sección (pestañas)
    sectionSelector: {
        flexDirection: "row",
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: "#F5F5F5",
        padding: 4,
    },

    sectionTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 8,
    },

    activeSectionTab: {
        backgroundColor: "#4A90E2",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    sectionTabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },

    activeSectionTabText: {
        color: "#FFF",
    },

    listContainer: {
        marginTop: 10,
        marginBottom: 20,
    },

    sectionTitleAdmin: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 6,
        paddingLeft: 4,
    },

    justificationCard: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    dateTimeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    cardDate: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4A90E2",
    },

    cardTime: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },

    cardReason: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
    },

    // Estado vacío
    emptyContainer: {
        padding: 40,
        alignItems: "center",
        backgroundColor: "#F9F9F9",
        borderRadius: 12,
    },

    emptyText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },

    // ========== ESTILOS PARA AGREGAR JUSTIFICACIÓN (ADMIN) ==========
    containerAddValidJustification: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
    },

    formSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    // Selector de categoría horizontal
    categoryScroll: {
        marginBottom: 20,
    },

    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        // borderWidth y borderColor se aplican inline según el tema
    },

    categoryButtonActive: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },

    categoryButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },

    categoryButtonTextActive: {
        color: '#FFFFFF',
    },

    // Grid de tipos
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        gap: 8,
    },

    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        minWidth: '30%',
        alignItems: 'center',
    },

    typeButtonActive: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },

    typeButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },

    typeButtonTextActive: {
        color: '#FFFFFF',
    },

    // Inputs
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 10,
        marginTop: 5,
    },

    textInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333',
        marginBottom: 20,
    },

    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },

    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 4,
        marginBottom: 10,
    },

    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },

    toggleButtonActive: {
        backgroundColor: '#4A90E2',
    },

    toggleButtonInactive: {
        backgroundColor: '#E74C3C',
    },

    toggleButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },

    toggleButtonTextActive: {
        color: '#FFFFFF',
    },

    toggleButtonTextInactive: {
        color: '#FFFFFF',
    },

    // Botones de acción
    actionButtonsContainer: {
        marginTop: 30,
        marginBottom: 30,
        gap: 12,
    },

    cancelButton: {
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    cancelButtonManage: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center'
    },

    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },

    // ========== LANGUAGE SETTINGS SCREEN STYLES ==========
    languageSettingsSafeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
    languageSettingsContainer: {
        flex: 1,
        padding: 20
    },
    languageSettingsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    languageSettingsSubtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
        color: '#666'
    },
    languageSettingsOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
    },
    languageSettingsSelectedOption: {
        borderColor: '#41c0ff',
        backgroundColor: '#E0F7FA',
        borderWidth: 2
    },
    languageSettingsOptionText: {
        fontSize: 16
    },
    languageSettingsCheckmark: {
        fontSize: 18,
        color: '#41c0ff',
        fontWeight: 'bold'
    },

    // Badge para justificaciones pendientes
    badgeContainer: {
        backgroundColor: '#E74C3C',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        paddingHorizontal: 6,
    },

    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Estilos para items de justificaciones válidas
    justificationItem: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3498DB',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    justificationHeader: {
        marginBottom: 8,
    },

    justificationType: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C3E50',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    justificationDescription: {
        fontSize: 14,
        color: '#546E7A',
        marginBottom: 10,
        lineHeight: 20,
    },

    justificationRequirement: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7F8C8D',
        fontStyle: 'italic',
    },

    // Estilos para items de justificaciones pendientes
    pendingItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },

    pendingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    // Loading indicator
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#7F8C8D',
    },

    // Empty state
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },

    emptyStateText: {
        fontSize: 16,
        color: '#95A5A6',
        textAlign: 'center',
        marginTop: 10,
    },

    // ========== VALID JUSTIFICATIONS SCREEN STYLES (ESPECÍFICOS) ==========
    safeAreaWhiteValidJustifi: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    containerJustificationsScreenValidJustifi: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // Header
    justificationsHeaderValidJustifi: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 45 : 15,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },

    backButtonValidJustifi: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    backButtonTextValidJustifi: {
        fontSize: 20,
        color: '#4A90E2',
        fontWeight: '600',
    },

    justificationsTitleValidJustifi: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
    },

    justificationsCountValidJustifi: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: '#4A90E2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },

    // Contenido del scroll
    justificationsScrollContentValidJustifi: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },

    // Sección de categoría
    categorySectionValidJustifi: {
        marginBottom: 10,
    },

    categoryHeaderValidJustifi: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    categoryIconContainerValidJustifi: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    categoryIconValidJustifi: {
        fontSize: 24,
    },

    categoryInfoValidJustifi: {
        flex: 1,
    },

    categoryTitleTextValidJustifi: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },

    categoryCountTextValidJustifi: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },

    categoryArrowValidJustifi: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    categoryArrowTextValidJustifi: {
        fontSize: 20,
        color: '#4A90E2',
        fontWeight: '600',
    },

    // Contenedor de items
    categoryItemsContainerValidJustifi: {
        paddingLeft: 10,
        marginBottom: 5,
    },

    // Item de justificación
    justificationItemCardValidJustifi: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },

    justificationItemHeaderValidJustifi: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    justificationNumberContainerValidJustifi: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    justificationNumberTextValidJustifi: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A90E2',
    },

    justificationTypeContainerValidJustifi: {
        flex: 1,
    },

    justificationTypeTextValidJustifi: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    documentRequiredBadgeValidJustifi: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },

    documentRequiredTextValidJustifi: {
        fontSize: 16,
    },

    justificationDescriptionTextValidJustifi: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        marginBottom: 12,
        paddingLeft: 38,
    },

    justificationFooterValidJustifi: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 38,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },

    categoryBadgeValidJustifi: {
        backgroundColor: '#E8F4FD',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    categoryBadgeTextValidJustifi: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4A90E2',
    },

    documentInfoTextValidJustifi: {
        fontSize: 11,
        color: '#999',
        fontWeight: '500',
    },

    // Divider entre categorías
    categoryDividerValidJustifi: {
        height: 8,
        backgroundColor: '#F5F5F5',
        marginVertical: 10,
        borderRadius: 4,
    },

    // Estado vacío
    emptyStateContainerValidJustifi: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },

    emptyStateIconValidJustifi: {
        fontSize: 64,
        marginBottom: 20,
    },

    emptyStateTitleValidJustifi: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },

    emptyStateDescriptionValidJustifi: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 22,
    },

    // Botón volver secundario
    justificationsBackButtonValidJustifi: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    justificationsBackButtonTextValidJustifi: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A90E2',
    },

    // ========== VALID ALL JUSTIFICATIONS SCREEN STYLES ==========
    validAllJustificationsSafeArea: {
        flex: 1,
    },

    validAllJustificationsContainer: {
        flex: 1,
    },

    validAllJustificationsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },

    validAllJustificationsTitle: {
        fontSize: 20,
        fontWeight: '700',
    },

    validAllJustificationsBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    validAllJustificationsBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    validAllJustificationsSeparator: {
        height: 1,
        marginHorizontal: 20,
        marginBottom: 8,
    },

    validAllJustificationsScrollView: {
        flexGrow: 1,
    },

    validAllJustificationsScrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    validAllJustificationsCategorySection: {
        marginBottom: 24,
    },

    validAllJustificationsCategoryHeader: {
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    validAllJustificationsCategoryTitle: {
        fontSize: 15,
        fontWeight: '700',
    },

    validAllJustificationsCategoryCount: {
        fontSize: 12,
    },

    validAllJustificationsItemCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderLeftWidth: 3,
    },

    validAllJustificationsItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    validAllJustificationsItemNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    validAllJustificationsItemNumberText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },

    validAllJustificationsItemType: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },

    validAllJustificationsItemDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },

    validAllJustificationsItemSeparator: {
        height: 1,
        marginBottom: 10,
    },

    validAllJustificationsItemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    validAllJustificationsItemBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },

    validAllJustificationsItemBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },

    validAllJustificationsItemDocText: {
        fontSize: 12,
    },

    validAllJustificationsEmptyState: {
        alignItems: 'center',
        marginTop: 60,
    },

    validAllJustificationsEmptyIcon: {
        fontSize: 40,
        marginBottom: 16,
    },

    validAllJustificationsEmptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },

    validAllJustificationsEmptyDescription: {
        fontSize: 14,
        textAlign: 'center',
    },

    validAllJustificationsBackButton: {
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
    },

    // ========== PROFILE SCREEN STYLES (mejorados) ==========
    profileHeaderSectionProfile: {
        alignItems: 'center',
        marginBottom: 28,
        paddingBottom: 24,
    },
    userNameProfile: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    roleBadgeProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    roleBadgeDotProfile: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    roleBadgeTextProfile: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    infoFieldContainerProfile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    infoFieldLabelProfile: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    infoFieldValueProfile: {
        fontSize: 13,
        fontWeight: '400',
        maxWidth: '55%',
        textAlign: 'right',
    },
    profileSettingsButtonProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    settingsIconBoxProfile: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsChevronProfile: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    profileSettingsTitleProfile: {
        fontSize: 15,
        fontWeight: '600',
    },
    profileSettingsSubtitleProfile: {
        fontSize: 12,
        marginTop: 2,
    },
    sectionTitleMenuProfile: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        letterSpacing: 0.1,
    },
    secondaryButton: {
        alignItems: "center",
        paddingVertical: 12,
        marginTop: 10,
        marginBottom: 30,
        borderColor: "#E0E0E0",
        borderWidth: 1,
        borderRadius: 12,
    },
    // Externos
    containerAddJustification: {
        flex: 1,
        marginTop: 25,
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: Platform.OS === "android" ? 50 : 10,
    },

    mainTitleAddJustification: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A1A1A",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 10,
    },

    subTitleAddJustification: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 15,
    },

    descriptionText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
    },

    // Selector de tipo
    typeSelector: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 5,
    },

    activeTypeButton: {
        backgroundColor: "#4A90E2",
        borderColor: "#4A90E2",
    },

    activeTypeButtonText: {
        color: "#FFF",
    },

    // Botón de subir archivo
    uploadButton: {
        backgroundColor: "#E3F2FD",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#4A90E2",
        borderstyle: "dashed",
        marginBottom: 10,
    },

    uploadButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#4A90E2",
    },

    // Información del archivo
    fileInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F0F8FF",
        padding: 12,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 10,
    },

    fileInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    fileName: {
        fontSize: 13,
        color: "#333",
        flex: 1,
    },

    fileSize: {
        fontSize: 11,
        color: "#666",
    },

    removeFileButton: {
        backgroundColor: "#FFE5E5",
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },

    removeFileText: {
        fontSize: 14,
        color: "#FF4444",
        fontWeight: "bold",
    },

    supportedFormats: {
        fontSize: 11,
        color: "#999",
        marginTop: 8,
        textAlign: "center",
    },

    // --- ManageUsersScreen specific styles (moved) ---
    headerManage: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Platform.OS === 'android' ? 25 : 5
    },
    titleManage: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    title: {fontSize: 20, fontWeight: '700'},
    tabs: {flexDirection: 'row', paddingHorizontal: 16, marginLeft: 10,},
    tabButton: {flex: 1, paddingVertical: 12, alignItems: 'center'},
    actionsRow: {padding: 16},
    list: {paddingHorizontal: 16, paddingBottom: 40},
    item: {flexDirection: 'row', padding: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center'},
    itemInfo: {flex: 1},
    itemName: {fontSize: 16, fontWeight: '600'},
    itemMeta: {fontSize: 12, marginTop: 4},
    itemActions: {flexDirection: 'row'},
    actionButton: {marginLeft: 12},
    actionText: {fontSize: 14},
    empty: {padding: 30, alignItems: 'center'},

    modalWrapper: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.68)'},
    modal: {width: '90%', borderRadius: 8, padding: 16},
    modalTitle: {fontSize: 20, fontWeight: '700', marginBottom: 10, textAlign: 'center'},
    input: {borderWidth: 0.2, borderRadius: 6, padding: 10, marginBottom: 10},
    modalActions: {alignItems: 'center', marginTop: 5, width: '100%', textAlign: "center"},
    sectionTitleContainer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10},
    sectionBadge: {borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4},
    sectionBadgeText: {fontSize: 12, fontWeight: '700'},
    searchItem: {
        flexDirection: 'row',
        padding: 10,
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 8,
        alignItems: 'center'
    },
    // ========== PROFILE styles (mejorados) ==========
    avatarRingProfile: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 14,
    },
    avatarCircleProfile: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    avatarInitialsProfile: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: 1,
    },

    courseCardProfile: {
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderLeftWidth: 3,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    courseCardInnerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    courseCardDotProfile: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 2,
        alignSelf: 'flex-start',
    },
    courseNameProfile: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 3,
    },
    courseCodeProfile: {
        fontSize: 12,
    },
    courseStatusBadgeProfile: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginLeft: 4,
    },
    courseStatusProfile: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    statsCardProfile: {
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8,
        borderWidth: 1,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statsCircleContainer: {
        alignItems: 'center',
        minWidth: 80,
    },
    statsCircleRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsPctText: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statsLabel: {
        fontSize: 10,
        marginTop: 2,
        fontWeight: '500',
    },
    statsBreakdown: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statItemProfile: {
        alignItems: 'center',
        minWidth: 60,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    statValueProfile: {
        fontSize: 20,
        fontWeight: '800',
    },
    statLabelProfile: {
        fontSize: 10,
        marginTop: 3,
        textAlign: 'center',
        fontWeight: '500',
    },

    justCardProfile: {
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    justIndicatorProfile: {
        width: 4,
        height: '100%',
        minHeight: 40,
        borderRadius: 2,
        alignSelf: 'stretch',
    },
    justDateProfile: {
        fontSize: 11,
        marginBottom: 3,
        fontWeight: '500',
    },
    justTextProfile: {
        fontSize: 13,
        lineHeight: 18,
    },
    justBadgeProfile: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
        borderWidth: 1,
    },
    justBadgeTextProfile: {
        fontSize: 11,
        fontWeight: '700',
    },

    // Tarjeta de dispositivo IoT (mejorada)
    deviceCardProfile: {
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    deviceIconContainerProfile: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deviceNameProfile: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 3,
    },
    deviceDetailProfile: {
        fontSize: 12,
        marginBottom: 2,
    },
    deviceStatusChipProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 5,
    },
    deviceStatusDotProfile: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    deviceStatusProfile: {
        fontSize: 11,
        fontWeight: '700',
    },

    // Acento de sección
    sectionTitleAccentProfile: {
        width: 4,
        height: 18,
        borderRadius: 2,
        marginRight: 8,
    },

    // ========== REPORTE DE INASISTENCIAS Y RETARDOS ==========

    // --- Contenedor principal ---
    safeAreaReport: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    containerReport: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 16 : 10,
    },

    scrollContentReport: {
        paddingBottom: 40,
    },

    // --- Encabezado ---
    headerReport: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 45 : 15,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 3,
    },

    headerTitleReport: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
    },

    headerBackButtonReport: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerBackTextReport: {
        fontSize: 20,
        color: '#4A90E2',
        fontWeight: '600',
    },

    exportButtonReport: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },

    exportIconReport: {
        fontSize: 18,
    },

    // --- Selector de rol: Estudiantes / Profesores ---
    roleSelectorReport: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 4,
        marginTop: 20,
        marginBottom: 16,
    },

    roleTabReport: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },

    roleTabActiveReport: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    roleTabTextReport: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999999',
    },

    roleTabTextActiveReport: {
        color: '#1A1A1A',
    },

    // --- Selector de tipo: Inasistencias / Retardos ---
    typeSelectorReport: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },

    typeTabReport: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },

    typeTabAbsenceActiveReport: {
        backgroundColor: '#FDECEA',
    },

    typeTabLatenessActiveReport: {
        backgroundColor: '#FFF3E0',
    },

    typeTabTextReport: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999999',
    },

    typeTabTextAbsenceActiveReport: {
        color: '#C62828',
    },

    typeTabTextLatenessActiveReport: {
        color: '#E65100',
    },

    // --- Tarjeta resumen de alertas ---
    summaryCardReport: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },

    summaryTitleReport: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    summaryRowReport: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    summaryItemReport: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        marginHorizontal: 4,
    },

    summaryItemCriticalReport: {
        backgroundColor: '#FDECEA',
    },

    summaryItemWarningReport: {
        backgroundColor: '#FFF3E0',
    },

    summaryItemOkReport: {
        backgroundColor: '#E8F5E9',
    },

    summaryCountReport: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },

    summaryCountCriticalReport: {
        color: '#C62828',
    },

    summaryCountWarningReport: {
        color: '#E65100',
    },

    summaryCountOkReport: {
        color: '#2E7D32',
    },

    summaryLabelReport: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },

    summaryLabelCriticalReport: {
        color: '#C62828',
    },

    summaryLabelWarningReport: {
        color: '#E65100',
    },

    summaryLabelOkReport: {
        color: '#2E7D32',
    },

    // --- Título de sección de lista ---
    sectionTitleReport: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        paddingLeft: 4,
    },

    // --- Tarjeta de estudiante/profesor en alerta ---
    studentCardReport: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderLeftWidth: 4,
    },

    studentCardCriticalReport: {
        borderLeftColor: '#F44336',
    },

    studentCardWarningReport: {
        borderLeftColor: '#FF9800',
    },

    // Fila superior: avatar + info + badge de alerta
    studentCardHeaderReport: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },

    avatarCircleReport: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    avatarCriticalReport: {
        backgroundColor: '#FDECEA',
    },

    avatarWarningReport: {
        backgroundColor: '#FFF3E0',
    },

    avatarInitialsReport: {
        fontSize: 17,
        fontWeight: '700',
    },

    avatarInitialsCriticalReport: {
        color: '#C62828',
    },

    avatarInitialsWarningReport: {
        color: '#E65100',
    },

    studentInfoReport: {
        flex: 1,
    },

    studentNameReport: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 3,
    },

    studentMetaReport: {
        fontSize: 12,
        color: '#888888',
    },

    alertBadgeReport: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },

    alertBadgeCriticalReport: {
        backgroundColor: '#FDECEA',
    },

    alertBadgeWarningReport: {
        backgroundColor: '#FFF3E0',
    },

    alertBadgeTextReport: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    alertBadgeTextCriticalReport: {
        color: '#C62828',
    },

    alertBadgeTextWarningReport: {
        color: '#E65100',
    },

    // Fila de contadores: Inasistencias | Retardos
    countersRowReport: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 14,
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        paddingVertical: 10,
    },

    counterItemReport: {
        alignItems: 'center',
        flex: 1,
    },

    counterDividerReport: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 4,
    },

    counterValueReport: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 2,
    },

    counterValueOverLimitReport: {
        color: '#F44336',
    },

    counterValueNormalReport: {
        color: '#4CAF50',
    },

    counterLabelReport: {
        fontSize: 11,
        color: '#888888',
        fontWeight: '500',
    },

    counterLimitReport: {
        fontSize: 10,
        color: '#BBBBBB',
        marginTop: 1,
    },

    // Barra de progreso de inasistencias
    progressSectionReport: {
        marginBottom: 14,
    },

    progressRowReport: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },

    progressLabelReport: {
        fontSize: 12,
        fontWeight: '600',
        color: '#555555',
    },

    progressValueReport: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F44336',
    },

    progressBarContainerReport: {
        height: 7,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },

    progressBarFillAbsenceReport: {
        height: '100%',
        backgroundColor: '#F44336',
        borderRadius: 4,
    },

    progressBarFillLatenessReport: {
        height: '100%',
        backgroundColor: '#FF9800',
        borderRadius: 4,
    },

    progressBarFillSafeReport: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },

    // Botón de generar reporte individual
    generateButtonReport: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 6,
    },

    generateButtonAbsenceReport: {
        borderColor: '#FFCDD2',
        backgroundColor: '#FDECEA',
    },

    generateButtonLatenessReport: {
        borderColor: '#FFE0B2',
        backgroundColor: '#FFF3E0',
    },

    generateButtonTextReport: {
        fontSize: 13,
        fontWeight: '600',
    },

    generateButtonTextAbsenceReport: {
        color: '#C62828',
    },

    generateButtonTextLatenessReport: {
        color: '#E65100',
    },

    // --- Barra de búsqueda ---
    searchBarContainerReport: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    searchIconReport: {
        fontSize: 16,
        color: '#BBBBBB',
        marginRight: 8,
    },

    searchInputReport: {
        flex: 1,
        fontSize: 14,
        color: '#333333',
        paddingVertical: 0,
    },

    // --- Botón principal de generar reporte general ---
    mainGenerateButtonReport: {
        backgroundColor: '#4A90E2',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 24,
        gap: 8,
        shadowColor: '#4A90E2',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },

    mainGenerateButtonTextReport: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // --- Modal de confirmación de reporte ---
    modalOverlayReport: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },

    modalSheetReport: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    },

    modalHandleReport: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },

    modalTitleReport: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
        textAlign: 'center',
    },

    modalSubtitleReport: {
        fontSize: 13,
        color: '#888888',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },

    modalInfoRowReport: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
    },

    modalInfoItemReport: {
        alignItems: 'center',
        flex: 1,
    },

    modalInfoValueReport: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 4,
    },

    modalInfoLabelReport: {
        fontSize: 11,
        color: '#888888',
        textAlign: 'center',
    },

    modalInfoDividerReport: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 4,
    },

    modalActionsReport: {
        gap: 10,
    },

    modalConfirmButtonReport: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
    },

    modalConfirmButtonTextReport: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    modalCancelButtonReport: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    modalCancelButtonTextReport: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666666',
    },

    // --- Estado vacío ---
    emptyStateReport: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
    },

    emptyStateIconReport: {
        fontSize: 56,
        marginBottom: 16,
    },

    emptyStateTitleReport: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },

    emptyStateDescriptionReport: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 22,
    },

    // --- Indicador de carga ---
    loadingContainerReport: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },

    loadingTextReport: {
        marginTop: 12,
        fontSize: 14,
        color: '#7F8C8D',
    },

    // --- Chip de filtro rápido (Todos / Críticos / En límite) ---
    filterChipsRowReport: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },

    filterChipReport: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: 'transparent',
    },

    filterChipAllActiveReport: {
        backgroundColor: '#E3F2FD',
        borderColor: '#4A90E2',
    },

    filterChipCriticalActiveReport: {
        backgroundColor: '#FDECEA',
        borderColor: '#F44336',
    },

    filterChipWarningActiveReport: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800',
    },

    filterChipTextReport: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888888',
    },

    filterChipTextAllActiveReport: {
        color: '#4A90E2',
    },

    filterChipTextCriticalActiveReport: {
        color: '#C62828',
    },

    filterChipTextWarningActiveReport: {
        color: '#E65100',
    },

    // ========== SCHOOL CONFIGURATION SCREEN STYLES ==========

    // --- Contenedor principal ---
    safeAreaSchoolConfig: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    containerSchoolConfig: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
    },

    scrollContentSchoolConfig: {
        paddingBottom: 40,
    },

    // --- Encabezado ---
    headerSchoolConfig: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 45 : 15,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 3,
    },

    headerBackButtonSchoolConfig: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerBackTextSchoolConfig: {
        fontSize: 20,
        color: '#4A90E2',
        fontWeight: '600',
    },

    headerTitleSchoolConfig: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
    },

    headerIconButtonSchoolConfig: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerIconSchoolConfig: {
        fontSize: 18,
    },

    // --- Contenedor principal de contenido ---
    mainContentSchoolConfig: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    // --- Tarjeta de información del colegio ---
    schoolInfoCardSchoolConfig: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },

    schoolLogoContainerSchoolConfig: {
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#E3F2FD',
    },

    schoolLogoSchoolConfig: {
        fontSize: 48,
    },

    schoolNameSchoolConfig: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 6,
    },

    schoolCodeSchoolConfig: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '500',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'center',
    },

    schoolStatusBadgeSchoolConfig: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#E8F5E9',
        color: '#2E7D32',
        alignSelf: 'center',
        overflow: 'hidden',
    },

    // --- Separador ---
    dividerSchoolConfig: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 16,
    },

    // --- Información rápida (fila de 3 columnas) ---
    quickInfoRowSchoolConfig: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },

    quickInfoItemSchoolConfig: {
        alignItems: 'center',
        flex: 1,
    },

    quickInfoIconSchoolConfig: {
        fontSize: 24,
        marginBottom: 6,
        color: '#4A90E2',
    },

    quickInfoValueSchoolConfig: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },

    quickInfoLabelSchoolConfig: {
        fontSize: 11,
        color: '#888888',
        textAlign: 'center',
    },

    // --- Tabs de secciones ---
    sectionTabsSchoolConfig: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },

    sectionTabSchoolConfig: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },

    sectionTabActiveSchoolConfig: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    sectionTabTextSchoolConfig: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999999',
    },

    sectionTabTextActiveSchoolConfig: {
        color: '#1A1A1A',
    },

    // --- Secciones de formulario ---
    formSectionSchoolConfig: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },

    formSectionTitleSchoolConfig: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 14,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#E3F2FD',
    },

    formSectionIconSchoolConfig: {
        fontSize: 16,
        marginRight: 8,
        color: '#4A90E2',
    },

    // --- Campos de entrada ---
    formGroupSchoolConfig: {
        marginBottom: 16,
    },

    formGroupLastSchoolConfig: {
        marginBottom: 0,
    },

    inputLabelSchoolConfig: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },

    inputLabelRequiredSchoolConfig: {
        color: '#F44336',
        marginLeft: 4,
    },

    inputFieldSchoolConfig: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    inputFieldFocusedSchoolConfig: {
        borderColor: '#4A90E2',
        backgroundColor: '#F0F8FF',
    },

    inputFieldErrorSchoolConfig: {
        borderColor: '#F44336',
        backgroundColor: '#FFEBEE',
    },

    inputFieldDisabledSchoolConfig: {
        backgroundColor: '#F5F5F5',
        color: '#CCCCCC',
    },

    textAreaSchoolConfig: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },

    inputErrorMessageSchoolConfig: {
        fontSize: 12,
        color: '#F44336',
        marginTop: 6,
        fontWeight: '500',
    },

    inputSuccessMessageSchoolConfig: {
        fontSize: 12,
        color: '#2E7D32',
        marginTop: 6,
        fontWeight: '500',
    },

    inputHelperTextSchoolConfig: {
        fontSize: 11,
        color: '#888888',
        marginTop: 6,
        fontStyle: 'italic',
    },

    // --- Select / Picker ---
    pickerContainerSchoolConfig: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },

    countryPickerSchoolConfig: {
        justifyContent: 'center',
        minHeight: 52,
    },

    countryPickerTextSchoolConfig: {
        fontSize: 14,
        color: '#333333',
    },

    countryOptionSchoolConfig: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    countryOptionTextSchoolConfig: {
        fontSize: 15,
        color: '#1A1A1A',
    },

    countryDialCodeSchoolConfig: {
        fontSize: 14,
        color: '#666666',
    },

    pickerLabelSchoolConfig: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },

    // --- Toggle / Switch ---
    toggleRowSchoolConfig: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    toggleLabelContainerSchoolConfig: {
        flex: 1,
    },

    toggleLabelSchoolConfig: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },

    toggleDescriptionSchoolConfig: {
        fontSize: 12,
        color: '#888888',
    },

    // --- Tarjetas de información dentro del formulario ---
    infoCardSchoolConfig: {
        backgroundColor: '#F0F8FF',
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2',
        borderRadius: 10,
        padding: 12,
        marginBottom: 14,
    },

    infoCardTitleSchoolConfig: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },

    infoCardTextSchoolConfig: {
        fontSize: 12,
        color: '#555555',
        lineHeight: 18,
    },

    infoCardIconSchoolConfig: {
        fontSize: 14,
        color: '#4A90E2',
        marginRight: 6,
    },

    // --- Grid de opciones (2 columnas) ---
    optionsGridSchoolConfig: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },

    optionButtonSchoolConfig: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        gap: 6,
    },

    optionButtonActiveSchoolConfig: {
        borderColor: '#4A90E2',
        backgroundColor: '#E3F2FD',
    },

    optionButtonIconSchoolConfig: {
        fontSize: 24,
    },

    optionButtonTextSchoolConfig: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666666',
    },

    optionButtonTextActiveSchoolConfig: {
        color: '#4A90E2',
    },

    // --- Botones de acción ---
    actionButtonsContainerSchoolConfig: {
        marginTop: 24,
        marginBottom: 30,
        gap: 12,
    },

    saveButtonSchoolConfig: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#4A90E2',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },

    saveButtonTextSchoolConfig: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    saveButtonIconSchoolConfig: {
        fontSize: 18,
        color: '#FFFFFF',
    },

    saveButtonDisabledSchoolConfig: {
        backgroundColor: '#CCCCCC',
        shadowOpacity: 0,
        elevation: 0,
    },

    cancelButtonSchoolConfig: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
    },

    cancelButtonTextSchoolConfig: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
    },

    discardButtonSchoolConfig: {
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },

    discardButtonTextSchoolConfig: {
        fontSize: 14,
        fontWeight: '600',
        color: '#C62828',
    },

    // --- Indicador de cambios no guardados ---
    unsavedChangesIndicatorSchoolConfig: {
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },

    unsavedChangesIconSchoolConfig: {
        fontSize: 18,
        color: '#FF9800',
        marginRight: 10,
    },

    unsavedChangesTextSchoolConfig: {
        fontSize: 13,
        color: '#E65100',
        fontWeight: '500',
        flex: 1,
    },

    // --- Indicador de éxito ---
    successIndicatorSchoolConfig: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#2E7D32',
    },

    successIndicatorIconSchoolConfig: {
        fontSize: 18,
        color: '#2E7D32',
        marginRight: 10,
    },

    successIndicatorTextSchoolConfig: {
        fontSize: 13,
        color: '#1B5E20',
        fontWeight: '500',
        flex: 1,
    },

    // --- Modal de confirmación ---
    modalOverlaySchoolConfig: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalSheetSchoolConfig: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },

    modalTitleSchoolConfig: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },

    modalSubtitleSchoolConfig: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },

    modalMessageSchoolConfig: {
        fontSize: 13,
        color: '#555555',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        padding: 12,
    },

    modalActionsSchoolConfig: {
        gap: 10,
    },

    modalConfirmButtonSchoolConfig: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },

    modalConfirmButtonTextSchoolConfig: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    modalCancelButtonSchoolConfig: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    modalCancelButtonTextSchoolConfig: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666666',
    },

    // --- Estado de carga ---
    loadingOverlaySchoolConfig: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 8,
    },

    loadingTextSchoolConfig: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
    },

    // --- Tarjeta de configuración avanzada (oculta por defecto) ---
    advancedSettingsCardSchoolConfig: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
        marginBottom: 16,
    },

    advancedSettingsHeaderSchoolConfig: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },

    advancedSettingsTitleSchoolConfig: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    advancedSettingsToggleSchoolConfig: {
        fontSize: 20,
        color: '#4A90E2',
    },

    advancedSettingsContentSchoolConfig: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },

    // --- Fila de información (clave-valor) ---
    infoRowSchoolConfig: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    infoRowLastSchoolConfig: {
        borderBottomWidth: 0,
    },

    infoKeySchoolConfig: {
        fontSize: 13,
        color: '#888888',
        fontWeight: '500',
    },

    infoValueSchoolConfig: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '600',
    },

    // --- Badges de estado ---
    statusBadgeActiveSchoolConfig: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },

    statusBadgeInactiveSchoolConfig: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },

    statusBadgeTextActiveSchoolConfig: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2E7D32',
    },

    statusBadgeTextInactiveSchoolConfig: {
        fontSize: 11,
        fontWeight: '700',
        color: '#999999',
    },

    // --- Botón flotante de ayuda ---
    helpButtonSchoolConfig: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4A90E2',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },

    helpButtonIconSchoolConfig: {
        fontSize: 24,
        color: '#FFFFFF',
    },

    // --- Validación visual de campos ---
    fieldWithValidationSchoolConfig: {
        marginBottom: 12,
    },

    fieldValidatedSchoolConfig: {
        backgroundColor: '#F0F8FF',
        borderColor: '#4CAF50',
    },

    validationCheckmarkSchoolConfig: {
        position: 'absolute',
        right: 12,
        top: '50%',
        marginTop: -10,
        fontSize: 18,
        color: '#4CAF50',
    },

    validationErrorIconSchoolConfig: {
        position: 'absolute',
        right: 12,
        top: '50%',
        marginTop: -10,
        fontSize: 18,
        color: '#F44336',
    },

    // ========== PENDING JUSTIFICATION SCREEN styles ==========
    // Layout principal
    safeAreaPending: {
        flex: 1,
        backgroundColor: '#F4F6FB',
    },
    containerPending: {
        flex: 1,
    },

    // Header
    headerPending: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#F4F6FB',
    },
    headerTitlePending: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    headerSubtitlePending: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },

    // Filtros de rol
    filterRowPending: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 12,
        gap: 8,
    },
    filterChipPending: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    filterChipActivePending: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    filterChipTextPending: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterChipTextActivePending: {
        color: '#FFFFFF',
    },

    // Contador de resultados
    resultsRowPending: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        gap: 6,
    },
    resultsTextPending: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    resultsBadgePending: {
        backgroundColor: '#2563EB',
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 1,
    },
    resultsBadgeTextPending: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Lista
    listContentPending: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },

    // Tarjeta de justificación
    cardPending: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    cardHeaderPending: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    avatarContainerPending: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarTextPending: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cardHeaderInfoPending: {
        flex: 1,
    },
    cardNamePending: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    cardMetaPending: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 1,
    },
    badgeRowPending: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },
    typeBadgePending: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    typeBadgeTextPending: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    roleBadgePending: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    roleBadgeTextPending: {
        fontSize: 11,
        fontWeight: '600',
    },
    cardDescriptionPending: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 10,
    },
    cardFooterPending: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 10,
        marginTop: 2,
    },
    cardDatePending: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    viewButtonPending: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    viewButtonTextPending: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    attachmentIndicatorPending: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    attachmentTextPending: {
        fontSize: 11,
        color: '#9CA3AF',
    },

    // Empty state
    emptyContainerPending: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIconPending: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitlePending: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    emptySubtitlePending: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
    },

    // Modal overlay
    modalOverlayPending: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalSheetPending: {
        backgroundColor: '#F4F6FB',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '92%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHandlePending: {
        width: 40,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 4,
    },
    modalHeaderPending: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitlePending: {
        fontSize: 17,
        fontWeight: '800',
        color: '#111827',
    },
    modalCloseBtnPending: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalCloseTextPending: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 18,
    },
    modalScrollPending: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },

    // Modal — Secciones de detalle
    detailUserRowPending: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 12,
    },
    detailAvatarLargePending: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailAvatarTextPending: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    detailUserNamePending: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    detailUserMetaPending: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 1,
    },
    sectionLabelPending: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginTop: 4,
    },
    detailCardPending: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    detailRowPending: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 10,
    },
    detailRowLastPending: {
        borderBottomWidth: 0,
    },
    detailIconPending: {
        fontSize: 16,
        width: 22,
        textAlign: 'center',
    },
    detailKeyPending: {
        fontSize: 13,
        color: '#6B7280',
        width: 80,
    },
    detailValuePending: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    descriptionBoxPending: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    descriptionTextPending: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 21,
    },
    attachmentBoxPending: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 12,
    },
    attachmentIconBoxPending: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachmentIconTextPending: {
        fontSize: 22,
    },
    attachmentFileNamePending: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
    },
    attachmentFileSizePending: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    actionRowPending: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    approveBtnPending: {
        flex: 1,
        backgroundColor: '#16A34A',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    approveBtnTextPending: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    rejectBtnPending: {
        flex: 1,
        backgroundColor: '#DC2626',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    rejectBtnTextPending: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },cameraContainer: {
        flex: 1
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    ovalContainer: {
        width: 280,
        height: 380,
        borderRadius: 200,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    ovalInner: {
        width: 260,
        height: 360,
        borderRadius: 190,
        borderWidth: 2,
        borderStyle: 'dashed'
    },
    cameraHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20
    },
    previewHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 12,
        zIndex: 10,
    },
    previewHeaderTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    flipButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flipButtonText: {
        fontSize: 20
    },
    cameraTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'},
    statusOverlay: {
        position: 'absolute',
        bottom: 220,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20
    },
    statusContainer: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20
    },
    statusTextUpdate: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center'
    },
    captureContainer: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff'
    },
    previewOverlayWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -10},
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    previewOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        paddingTop: 30,
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
        paddingHorizontal: 24,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderBottomWidth: 0,
    },
    previewIconContainer: {
        alignSelf: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    previewIcon: {
        fontSize: 28,
    },
    previewTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    previewSubtitle: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    previewStatusBox: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
    },
    previewStatus: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    previewButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 14,
        flex: 1,
        gap: 8,
    },
    retakeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    confirmButton: {
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    previewButtonIcon: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    previewButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    alreadyRegisteredBox: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderLeftWidth: 3,
        borderLeftColor: '#10B981',
        padding: 10,
        borderRadius: 6,
        marginTop: 10,
    },
    alreadyRegisteredText: {
        fontSize: 13,
        fontWeight: '500'
    },

    /* ========== RegisterFace ========== */
    safeAreaRegisterFace: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    registerFaceContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    registerFaceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    registerFaceTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
    },
    registerFaceSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginVertical: 14,
    },
    cameraWrapper: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraPreview: {
        width: '100%',
        height: '100%',
    },
    faceOval: {
        position: 'absolute',
        left: '16%',
        top: '11%',
        width: '68%',
        height: '78%',
        borderRadius: '50%',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.9)',
    },
    registerFacePermissionText: {
        color: '#F8FAFC',
        textAlign: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    registerFacePermissionButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#2563EB',
    },
    registerFacePermissionButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    registerFaceActions: {
        marginTop: 25,
        gap: 10,
    },
    secondaryButtonRegister: {
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2563EB',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#2563EB',
        fontWeight: '600',
    },
    registerFaceFooter: {
        paddingBottom: 20,
    },
    captureButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    captureButtonRegister: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 50,
    },
});

export default styles;