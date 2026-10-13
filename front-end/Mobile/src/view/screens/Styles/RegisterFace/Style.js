import {StyleSheet} from 'react-native';
import {normalizeTypography} from '../../../../utils/typography';

const styles = StyleSheet.create(normalizeTypography({
cameraPreview: {
        width: '100%',
        height: '100%',
    },

cameraWrapper: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },

captureButtonRegister: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 50,
    },

captureButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

livenessBanner: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: 'center',
    },

livenessBannerText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },

livenessProgressText: {
        color: '#E2E8F0',
        fontSize: 12,
        marginTop: 4,
    },

faceOval: {
        position: 'absolute',
        left: '16%',
        top: '11%',
        width: '68%',
        height: '78%',
        borderRadius: '50%',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.9)',
    },

registerFaceActions: {
        marginTop: 25,
        gap: 10,
    },

registerFaceContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },

registerFaceFooter: {
        paddingBottom: 20,
    },

registerFaceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },

registerFacePermissionButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#2563EB',
    },

registerFacePermissionButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

registerFacePermissionText: {
        color: '#F8FAFC',
        textAlign: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },

registerFaceSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginVertical: 14,
    },

registerFaceTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
    },

safeAreaRegisterFace: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
}));

export default styles;
