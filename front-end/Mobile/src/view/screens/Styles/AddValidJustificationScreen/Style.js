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

actionButtonsContainer: {
        marginTop: 30,
        marginBottom: 30,
        gap: 12,
    },

containerAddValidJustification: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
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

mainTitle: {
        fontSize: 28,
        fontWeight: "800",
        flex: 1,
        textAlign: "left",
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
}));

export default styles;
