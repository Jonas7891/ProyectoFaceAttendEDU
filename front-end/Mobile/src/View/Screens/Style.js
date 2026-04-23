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

    // ========== DASHBOARD STYLES ==========
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
        shadowOffset: { width: 0, height: 2 },
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
        shadowOffset: { width: 0, height: 2 },
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
        shadowOffset: { width: 0, height: 2 },
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
        shadowOffset: { width: 0, height: 1 },
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
        shadowOffset: { width: 0, height: 1 },
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
        shadowOffset: { width: 0, height: 1 },
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

    // ========== MENU SCREEN STYLES ==========
    scrollView: {
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
        transform: [{ rotate: '180deg' }],
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
        fontStyle: "italic",
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

    // ========== UPDATE PHOTO SCREEN STYLES ==========
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
        shadowOffset: { width: 0, height: 4 },
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

    // ========== HISTORICAL SCREEN STYLES ==========
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

    // ========== DISPLAYING ATTENDANCE SCREEN STYLES ==========
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

    // ========== MENU JUSTIFY SCREEN STYLES ==========
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
        paddingBottom: Platform.OS === 'ios' ? 10 : 20,
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
        shadowOffset: { width: 0, height: 2 },
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

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
        paddingLeft: 4,
    },

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
        shadowOffset: { width: 0, height: 2 },
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

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },

    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFF",
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

    // ========== ESTILOS PARA AGREGAR JUSTIFICACIÓN ==========
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

    typeButton: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },

    activeTypeButton: {
        backgroundColor: "#4A90E2",
        borderColor: "#4A90E2",
    },

    typeButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#666",
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
        borderStyle: "dashed",
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

    secondaryButton: {
        alignItems: "center",
        paddingVertical: 12,
        marginTop: 10,
        marginBottom: 20,
    },

    secondaryButtonText: {
        fontSize: 15,
        color: "#4A90E2",
        fontWeight: "500",
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
        borderWidth: 1,
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
        shadowOffset: {
            width: 0,
            height: 1,
        },
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
        shadowOffset: {
            width: 0,
            height: 1,
        },
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    // Selector de categoría horizontal
    categoryScroll: {
        marginBottom: 20,
    },

    categoryButton: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
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
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
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

    // Input de texto
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
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20,
    },

    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },

    // Toggle para requiere documento
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

    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});

export default styles;