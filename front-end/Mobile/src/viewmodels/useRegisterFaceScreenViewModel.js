import {useCallback, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useCameraPermissions} from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCustomAlert} from '../view/components/common/useCustomAlert';

const STORAGE_KEY = '@faceattend_edu:rostro_registrado';
const FACE_FILE = 'rostro_faceattend.jpg';

export function useRegisterFaceScreenViewModel() {
    const navigation = useNavigation();
    const {t} = useTranslation();
    const cameraRef = useRef(null);

    const {alertConfig, hideAlert, showSuccess, showError} = useCustomAlert();

    const [permission, requestPermission] = useCameraPermissions();
    const [cameraReady, setCameraReady] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleCameraReady = useCallback(() => setCameraReady(true), []);

    const handleMountError = useCallback((event) => {
        console.error('Error montando cámara:', event?.message);
        showError(t('registerFace.cameraErrorTitle'), t('registerFace.cameraErrorMsg'));
    }, [showError, t]);

    const handleCapture = useCallback(async () => {
        const camera = cameraRef.current;
        if (!camera || !cameraReady) return;

        try {
            const takePicture = camera.takePictureAsync || camera.takePhotoAsync;
            const photo = await takePicture.call(camera, {base64: true, quality: 0.9});
            setCapturedPhoto(photo);
        } catch (error) {
            console.error('Error de captura:', error);
            showError(t('registerFace.captureErrorTitle'), t('registerFace.captureErrorMsg'));
        }
    }, [cameraReady, showError, t]);

    const handleRetake = useCallback(() => {
        setCapturedPhoto(null);
        setCameraReady(false);
    }, []);

    const handleSave = useCallback(async () => {
        if (!capturedPhoto || saving) return;
        setSaving(true);
        try {
            const destination = `${FileSystem.documentDirectory}${FACE_FILE}`;
            const info = await FileSystem.getInfoAsync(destination);
            if (info.exists) await FileSystem.deleteAsync(destination);

            await FileSystem.moveAsync({from: capturedPhoto.uri, to: destination});
            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({uri: destination, registradoEl: new Date().toISOString()})
            );

            setCapturedPhoto(null);
            showSuccess(t('registerFace.saveSuccessTitle'), t('registerFace.saveSuccessMsg'));
        } catch (error) {
            console.error('Error al guardar:', error);
            showError(t('registerFace.saveErrorTitle'), t('registerFace.saveErrorMsg'));
        } finally {
            setSaving(false);
        }
    }, [capturedPhoto, saving, showSuccess, showError, t]);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    return {
        permissionLoading: !permission,
        permissionGranted: !!permission?.granted,
        requestPermission,
        cameraRef,
        cameraReady,
        handleCameraReady,
        handleMountError,
        capturedPhoto,
        saving,
        handleCapture,
        handleRetake,
        handleSave,
        handleBack,
        alertConfig,
        hideAlert,
    };
}