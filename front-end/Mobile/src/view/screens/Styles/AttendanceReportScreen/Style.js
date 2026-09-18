import {Platform, StyleSheet} from 'react-native';
import {normalizeTypography} from '../../../../utils/typography';

const styles = StyleSheet.create(normalizeTypography({
alertBadgeCriticalReport: {
        backgroundColor: '#FDECEA',
    },

alertBadgeReport: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },

alertBadgeTextCriticalReport: {
        color: '#C62828',
    },

alertBadgeTextReport: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

alertBadgeTextWarningReport: {
        color: '#E65100',
    },

alertBadgeWarningReport: {
        backgroundColor: '#FFF3E0',
    },

containerReport: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 16 : 10,
    },

counterDividerReport: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 4,
    },

counterItemReport: {
        alignItems: 'center',
        flex: 1,
    },

counterLabelReport: {
        fontSize: 11,
        color: '#888888',
        fontWeight: '500',
    },

counterValueOverLimitReport: {
        color: '#F44336',
    },

counterValueReport: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 2,
    },

countersRowReport: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 14,
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        paddingVertical: 10,
    },

emptyStateDescriptionReport: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 22,
    },

emptyStateReport: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
    },

emptyStateTitleReport: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },

filterChipAllActiveReport: {
        backgroundColor: '#E3F2FD',
        borderColor: '#4A90E2',
    },

filterChipCriticalActiveReport: {
        backgroundColor: '#FDECEA',
        borderColor: '#F44336',
    },

filterChipReport: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: 'transparent',
    },

filterChipTextAllActiveReport: {
        color: '#4A90E2',
    },

filterChipTextCriticalActiveReport: {
        color: '#C62828',
    },

filterChipTextReport: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888888',
    },

filterChipTextWarningActiveReport: {
        color: '#E65100',
    },

filterChipWarningActiveReport: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800',
    },

filterChipsRowReport: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },

generateButtonAbsenceReport: {
        borderColor: '#FFCDD2',
        backgroundColor: '#FDECEA',
    },

generateButtonLatenessReport: {
        borderColor: '#FFE0B2',
        backgroundColor: '#FFF3E0',
    },

generateButtonReport: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 6,
    },

generateButtonTextAbsenceReport: {
        color: '#C62828',
    },

generateButtonTextLatenessReport: {
        color: '#E65100',
    },

generateButtonTextReport: {
        fontSize: 13,
        fontWeight: '600',
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

modalActionsReport: {
        gap: 10,
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

modalHandleReport: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },

modalInfoDividerReport: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 4,
    },

modalInfoItemReport: {
        alignItems: 'center',
        flex: 1,
    },

modalInfoLabelReport: {
        fontSize: 11,
        color: '#888888',
        textAlign: 'center',
    },

modalInfoRowReport: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
    },

modalInfoValueReport: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 4,
    },

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

modalSubtitleReport: {
        fontSize: 13,
        color: '#888888',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },

modalTitleReport: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
        textAlign: 'center',
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

progressLabelReport: {
        fontSize: 12,
        fontWeight: '600',
        color: '#555555',
    },

progressRowReport: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },

progressSectionReport: {
        marginBottom: 14,
    },

progressValueReport: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F44336',
    },

roleSelectorReport: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 4,
        marginTop: 20,
        marginBottom: 16,
    },

roleTabActiveReport: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

roleTabReport: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },

roleTabTextReport: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999999',
    },

safeAreaReport: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

scrollContentReport: {
        paddingBottom: 40,
    },

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

searchInputReport: {
        flex: 1,
        fontSize: 14,
        color: '#333333',
        paddingVertical: 0,
    },

sectionTitleReport: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        paddingLeft: 4,
    },

studentCardCriticalReport: {
        borderLeftColor: '#F44336',
    },

studentCardHeaderReport: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },

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

studentCardWarningReport: {
        borderLeftColor: '#FF9800',
    },

studentInfoReport: {
        flex: 1,
    },

studentMetaReport: {
        fontSize: 12,
        color: '#888888',
    },

studentNameReport: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 3,
    },

typeSelectorReport: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },

typeTabAbsenceActiveReport: {
        backgroundColor: '#FDECEA',
    },

typeTabLatenessActiveReport: {
        backgroundColor: '#FFF3E0',
    },

typeTabReport: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },

typeTabTextAbsenceActiveReport: {
        color: '#C62828',
    },

typeTabTextLatenessActiveReport: {
        color: '#E65100',
    },

typeTabTextReport: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999999',
    },
}));

export default styles;
