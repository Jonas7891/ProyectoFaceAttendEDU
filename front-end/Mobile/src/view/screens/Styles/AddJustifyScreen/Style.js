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

buttonContainer: {
        marginBottom: Platform.OS === 'ios' ? 60 : 130,
        marginHorizontal: 20
    },

containerAddJustification: {
        flex: 1,
        marginTop: 25,
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: Platform.OS === "android" ? 50 : 10,
    },

descriptionText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
    },

inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 10,
        marginTop: 5,
    },

keyboardview: {
        flex: 1,
    },

mainTitleAddJustification: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A1A1A",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 10,
    },

safeAreaWhite: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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

secondaryButtonText: {
        color: '#2563EB',
        fontWeight: '600',
    },

spacer: {
        flex: 1,
        minHeight: 20,
    },

supportedFormats: {
        fontSize: 11,
        color: "#999",
        marginTop: 8,
        textAlign: "center",
    },

textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
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

typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        minWidth: '30%',
        alignItems: 'center',
    },

typeButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },

typeSelector: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 5,
    },

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
}));

export default styles;