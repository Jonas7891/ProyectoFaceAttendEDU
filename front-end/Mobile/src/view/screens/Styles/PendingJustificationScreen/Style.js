import {Platform, StyleSheet} from 'react-native';
import {normalizeTypography} from '../../../../utils/typography';

const styles = StyleSheet.create(normalizeTypography({
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

attachmentIndicatorPending: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

attachmentTextPending: {
        fontSize: 11,
        color: '#9CA3AF',
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

badgeRowPending: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },

buttonContainer: {
        marginBottom: Platform.OS === 'ios' ? 60 : 130,
        marginHorizontal: 20
    },

cardDatePending: {
        fontSize: 12,
        color: '#9CA3AF',
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

cardHeaderInfoPending: {
        flex: 1,
    },

cardHeaderPending: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },

cardMetaPending: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 1,
    },

cardNamePending: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },

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

containerPending: {
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

detailCardPending: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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

detailRowLastPending: {
        borderBottomWidth: 0,
    },

detailRowPending: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 10,
    },

detailUserMetaPending: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 1,
    },

detailUserNamePending: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

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

detailValuePending: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },

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

emptySubtitlePending: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
    },

emptyTitlePending: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },

filterChipPending: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },

filterChipTextPending: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },

filterRowPending: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 12,
        gap: 8,
    },

headerPending: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#F4F6FB',
    },

headerSubtitlePending: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },

headerTitlePending: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },

listContentPending: {
        paddingHorizontal: 16,
        paddingBottom: 24,
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

modalOverlayPending: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
        margin: Platform.OS === 'ios' ? 0 : 30,
    },

modalScrollPending: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },

modalSheetPending: {
        backgroundColor: '#F4F6FB',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '92%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },

modalTitlePending: {
        fontSize: 17,
        fontWeight: '800',
        color: '#111827',
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

roleBadgePending: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },

roleBadgeTextPending: {
        fontSize: 11,
        fontWeight: '600',
    },

safeAreaPending: {
        flex: 1,
        backgroundColor: '#F4F6FB',
        margin: Platform.OS === 'ios' ? 0 : 30,
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
}));

export default styles;
