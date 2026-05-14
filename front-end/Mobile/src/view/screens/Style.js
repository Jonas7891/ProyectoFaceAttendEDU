import {StyleSheet, Platform} from 'react-native';

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
    safeAreaUpdatePhoto: {
        flex: 1,
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
    profileImageUpdatePhoto: {
        width: 120,
        height: 120,
    },
    titleUpdatePhoto: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
    },
    instructionTextUpdatePhoto: {
        textAlign: "center",
        marginVertical: 15,
    },
    formCardUpdatePhoto: {
        borderRadius: 15,
        padding: 20,
        borderWidth: 0,
    },
    formCardDarkUpdatePhoto: {
        borderWidth: 1,
    },
    formTitleUpdatePhoto: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    inputFieldContainerUpdatePhoto: {
        marginBottom: 15,
    },
    inputLabelUpdatePhoto: {
        marginBottom: 5,
        fontSize: 14,
        fontWeight: "500",
    },
    questionInputUpdatePhoto: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    registerButtonUpdatePhoto: {
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
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

    // ========== FACIAL FAIL SCREEN styleS ==========
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#1a1a1a",
        flex: 1,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 20,
    },
    optionCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    optionDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        fontstyle: "italic",
    },
    separator: {
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        marginVertical: 20,
    },
    recommendationsTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 20,
        textAlign: "center",
    },
    recommendationCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        marginBottom: 20,
    },
    recommendationSubtitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
        marginHorizontal: 10,
    },
    recommendationText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        textAlign: "justify",
        marginHorizontal: 10,
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

    // Lista containers
    listContainer: {
        marginTop: 10,
        marginBottom: 20,
    },

    // Usamos el mismo sectionTitle que ya existe, pero necesitamos también sectionTitleAdmin
    sectionTitleAdmin: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 6,
        paddingLeft: 4,
    },

    // Tarjetas de justificaciones
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

    // Estilos para ProfileScreen
    profileHeaderSectionProfile: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    userNameProfile: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    roleBadgeProfile: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
    },
    roleBadgeTextProfile: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoFieldContainerProfile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
    },
    infoFieldLabelProfile: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoFieldValueProfile: {
        fontSize: 14,
        fontWeight: '400',
    },
    profileSettingsButtonProfile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
    },
    profileSettingsTitleProfile: {
        fontSize: 16,
        fontWeight: '600',
    },
    profileSettingsSubtitleProfile: {
        fontSize: 13,
        marginTop: 2,
    },
    sectionTitleMenuProfile: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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

    modalWrapper: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)'},
    modal: {width: '90%', borderRadius: 8, padding: 16},
    modalTitle: {fontSize: 18, fontWeight: '700', marginBottom: 12},
    input: {borderWidth: 0.2, borderRadius: 6, padding: 10, marginBottom: 10},
    modalActions: {alignItems: 'center', marginTop: 5, width: '100%', textAlign: "center"},
    searchItem: {
        flexDirection: 'row',
        padding: 10,
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 8,
        alignItems: 'center'
    },
    // ========== PROFILE styles ==========
    avatarCircleProfile: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 10,
    },
    avatarInitialsProfile: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: 1,
    },

    courseCardProfile: {
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
    },
    courseNameProfile: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    courseCodeProfile: {
        fontSize: 12,
        marginBottom: 4,
    },
    courseStatusProfile: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    statsCardProfile: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8,
    },
    statsCircleContainer: {
        alignItems: 'center',
        minWidth: 64,
    },
    statsPctText: {
        fontSize: 28,
        fontWeight: '800',
    },
    statsLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    statsBreakdown: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statItemProfile: {
        alignItems: 'center',
        minWidth: 56,
    },
    statValueProfile: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabelProfile: {
        fontSize: 10,
        marginTop: 2,
        textAlign: 'center',
    },

    justCardProfile: {
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    justDateProfile: {
        fontSize: 11,
        marginBottom: 3,
    },
    justTextProfile: {
        fontSize: 13,
    },
    justBadgeProfile: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },

    // Tarjeta de dispositivo IoT
    deviceCardProfile: {
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
    },
    deviceNameProfile: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    deviceDetailProfile: {
        fontSize: 12,
        marginBottom: 4,
    },
    deviceStatusProfile: {
        fontSize: 12,
        fontWeight: '600',
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
});

export default styles;