import {StyleSheet} from 'react-native';
import {normalizeTypography} from '../../../../utils/typography';

const styles = StyleSheet.create(normalizeTypography({
languageSettingsCheckmark: {
        fontSize: 18,
        color: '#41c0ff',
        fontWeight: 'bold'
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

languageSettingsOptionText: {
        fontSize: 16
    },

languageSettingsSafeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },

languageSettingsSubtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
        color: '#666'
    },

languageSettingsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
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
}));

export default styles;
