import {Platform, StyleSheet} from 'react-native';
import {normalizeTypography} from '../../../../utils/typography';

const styles = StyleSheet.create(normalizeTypography({
actionButtonsContainerSchoolConfig: {
        marginTop: 24,
        marginBottom: 30,
        gap: 12,
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

containerSchoolConfig: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
    },

countryDialCodeSchoolConfig: {
        fontSize: 14,
        color: '#666666',
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

countryPickerSchoolConfig: {
        justifyContent: 'center',
        minHeight: 52,
    },

countryPickerTextSchoolConfig: {
        fontSize: 14,
        color: '#333333',
    },

formGroupSchoolConfig: {
        marginBottom: 16,
    },

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

headerTitleSchoolConfig: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
    },

inputErrorMessageSchoolConfig: {
        fontSize: 12,
        color: '#F44336',
        marginTop: 6,
        fontWeight: '500',
    },

inputFieldDisabledSchoolConfig: {
        backgroundColor: '#F5F5F5',
        color: '#CCCCCC',
    },

inputFieldErrorSchoolConfig: {
        borderColor: '#F44336',
        backgroundColor: '#FFEBEE',
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

inputLabelRequiredSchoolConfig: {
        color: '#F44336',
        marginLeft: 4,
    },

inputLabelSchoolConfig: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },

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

mainContentSchoolConfig: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

modalActionsSchoolConfig: {
        gap: 10,
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

modalSubtitleSchoolConfig: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },

modalTitleSchoolConfig: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },

pickerContainerSchoolConfig: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },

quickInfoItemSchoolConfig: {
        alignItems: 'center',
        flex: 1,
    },

quickInfoLabelSchoolConfig: {
        fontSize: 11,
        color: '#888888',
        textAlign: 'center',
    },

quickInfoRowSchoolConfig: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },

quickInfoValueSchoolConfig: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },

safeAreaSchoolConfig: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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

schoolNameSchoolConfig: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 6,
    },

scrollContentSchoolConfig: {
        paddingBottom: 40,
    },

sectionTabActiveSchoolConfig: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

sectionTabSchoolConfig: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },

sectionTabTextActiveSchoolConfig: {
        color: '#1A1A1A',
    },

sectionTabTextSchoolConfig: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999999',
    },

sectionTabsSchoolConfig: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },

textAreaSchoolConfig: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },

toggleDescriptionSchoolConfig: {
        fontSize: 12,
        color: '#888888',
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
}));

export default styles;
