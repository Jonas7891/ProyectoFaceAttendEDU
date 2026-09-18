import {Platform, StyleSheet} from 'react-native';
import {normalizeTypography} from '../../../../utils/typography';

const styles = StyleSheet.create(normalizeTypography({
ScrollView: {
        flex: 1,
    },

ScrollViewContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },

activeSectionTab: {
        backgroundColor: "#4A90E2",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

buttonContainer: {
        marginBottom: Platform.OS === 'ios' ? 60 : 130,
        marginHorizontal: 20
    },

cardDate: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4A90E2",
    },

cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

cardReason: {
        fontSize: 14,
        color: "#444",
        lineHeight: 20,
    },

cardTime: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },

containerValidJustifications: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },

dateTimeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

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

keyboardview: {
        flex: 1,
    },

listContainer: {
        marginTop: 10,
        marginBottom: 20,
    },

mainTitleValidJustifications: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A1A1A",
        textAlign: "center",
        paddingTop: Platform.OS === "android" ? 30 : 10,
        marginBottom: 10,
    },

safeAreaWhite: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

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

sectionTabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },

sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 15,
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

subTitleValidJustifications: {
        fontSize: 16,
        fontWeight: "500",
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
}));

export default styles;
