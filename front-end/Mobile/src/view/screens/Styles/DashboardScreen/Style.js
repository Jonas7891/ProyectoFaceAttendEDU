import {StyleSheet} from 'react-native';
import {normalizeTypography} from '../../../../utils/typography';

const styles = StyleSheet.create(normalizeTypography({
actionDescription: {
        fontSize: 11,
        color: "#666666",
        textAlign: "center",
    },

actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

actionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000000",
        textAlign: "center",
        marginBottom: 4,
    },

adminName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 4,
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

bottomSpace: {
        height: 90,
    },

container: {
        flex: 1,
        paddingTop: 15,
        marginHorizontal: 20
    },

dataBar: {
        flex: 1,
    },

date: {
        fontSize: 12,
        color: "#999999",
    },

greeting: {
        fontSize: 14,
        color: "#666666",
        marginBottom: 4,
    },

header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginTop: 20,
        marginBottom: 20,
    },

indicatorDetails: {
        alignItems: "center",
    },

indicatorHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

indicatorText: {
        fontSize: 12,
        color: "#666666",
    },

leftContent: {
        flex: 1,
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

novedadContent: {
        flex: 1,
    },

novedadDescripcion: {
        fontSize: 12,
        color: "#666666",
        marginBottom: 4,
    },

novedadIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

novedadTiempo: {
        fontSize: 10,
        color: "#999999",
    },

novedadTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 2,
    },

novedadesSection: {
        marginBottom: 20,
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

quickActionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 25,
    },

recentInfo: {
        flex: 1,
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

recentName: {
        fontSize: 17,
        fontWeight: "500",
        color: "#000000",
    },

recentSection: {
        marginBottom: 25,
    },

recentTime: {
        fontSize: 15,
        color: "#999999",
        marginTop: 2,
    },

safeArea: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },

sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },

sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 15,
    },

sectionTitleAdmin: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 6,
        paddingLeft: 4,
    },

seeAllText: {
        fontSize: 12,
        color: "#4CAF50",
        fontWeight: "500",
    },

statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

statusText: {
        fontSize: 12,
        fontWeight: "500",
    },
}));

export default styles;
