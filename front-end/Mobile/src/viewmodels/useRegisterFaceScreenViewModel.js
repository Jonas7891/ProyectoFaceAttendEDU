import {useCallback, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useCameraPermissions} from 'expo-camera';
import {useCustomAlert} from '../view/components/common/useCustomAlert';
import {getCurrentUser} from '../services/UserService';
import {enrollFaceWithLiveness} from '../services/faceLivenessEnrollment';

// Debe coincidir con los `action` que el backend puede devolver en el reto
// de vida (ver back-end/06-ms-biometric/infrastructure/web/liveness.py) —
// los mismos tres gestos que ya usa Web (useFaceCapture.js).
const ACTION_LABEL_KEYS = {
    blink: 'registerFace.gestureBlink',
    turn: 'registerFace.gestureTurn',
    open_mouth: 'registerFace.gestureOpenMouth',
};

export function useRegisterFaceScreenViewModel() {
    const navigation = useNavigation();
    const {t} = useTranslation();
    const cameraRef = useRef(null);

    const {alertConfig, hideAlert, showSuccess, showError} = useCustomAlert();

    const [permission, requestPermission] = useCameraPermissions();
    const [cameraReady, setCameraReady] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [livenessAction, setLivenessAction] = useState('');
    const [livenessProgress, setLivenessProgress] = useState(null); // {done, total}

    const handleCameraReady = useCallback(() => setCameraReady(true), []);

    const handleMountError = useCallback((event) => {
        console.error('Error montando cámara:', event?.message);
        showError(t('registerFace.cameraErrorTitle'), t('registerFace.cameraErrorMsg'));
    }, [showError, t]);

    const translateActionLabel = useCallback(
        (action, isRetry) => {
            const label = t(ACTION_LABEL_KEYS[action] || 'registerFace.gestureDefault');
            return isRetry ? `${label} ${t('registerFace.retrySameGesture')}` : label;
        },
        [t]
    );

    const captureFrame = useCallback(async () => {
        const camera = cameraRef.current;
        if (!camera) throw new Error('camera not ready');
        const takePicture = camera.takePictureAsync || camera.takePhotoAsync;
        // Calidad baja a propósito: son fotogramas de prueba de vida (y, el del
        // medio, la imagen enrolada), no una foto para mostrar al usuario —
        // igual que Web limita el ancho del fotograma en captureFrame().
        const photo = await takePicture.call(camera, {base64: true, quality: 0.5, skipProcessing: true});
        return photo.base64;
    }, []);

    const resetLiveness = useCallback(() => {
        setLivenessAction('');
        setLivenessProgress(null);
    }, []);

    const handleStart = useCallback(async () => {
        const camera = cameraRef.current;
        if (!camera || !cameraReady || enrolling) return;

        setEnrolling(true);
        try {
            const user = await getCurrentUser();
            if (!user?.personId) {
                throw new Error('No se encontró tu identidad de persona en la sesión actual.');
            }

            await enrollFaceWithLiveness({
                personId: user.personId,
                captureFrame,
                translateActionLabel,
                onGestureStart: (label, progress) => {
                    setLivenessAction(label);
                    setLivenessProgress(progress);
                },
                onGestureRetry: (message) => {
                    console.warn('Gesto no detectado, reintentando:', message);
                },
            });

            showSuccess(t('registerFace.saveSuccessTitle'), t('registerFace.saveSuccessMsg'));
        } catch (error) {
            console.error('Error al registrar rostro:', error);
            showError(t('registerFace.saveErrorTitle'), error?.message || t('registerFace.saveErrorMsg'));
        } finally {
            resetLiveness();
            setEnrolling(false);
        }
    }, [cameraReady, enrolling, captureFrame, translateActionLabel, showSuccess, showError, resetLiveness, t]);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    return {
        permissionLoading: !permission,
        permissionGranted: !!permission?.granted,
        requestPermission,
        cameraRef,
        cameraReady,
        handleCameraReady,
        handleMountError,
        enrolling,
        livenessAction,
        livenessProgress,
        handleStart,
        handleBack,
        alertConfig,
        hideAlert,
    };
}
