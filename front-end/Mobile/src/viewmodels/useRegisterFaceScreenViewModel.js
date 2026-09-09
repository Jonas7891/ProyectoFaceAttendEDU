import {useCallback, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useCameraPermissions} from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCustomAlert} from '../view/components/common/useCustomAlert';

const STORAGE_KEY = '@faceattend_edu:rostro_registrado';
const FACE_FILE = 'rostro_faceattend.jpg';

export function useRegisterFaceScreenViewModel() {
    const navigation = useNavigation();
    const cameraRef = useRef(null);

    const {alertConfig, hideAlert, showSuccess, showError} = useCustomAlert();

    const [permission, requestPermission] = useCameraPermissions();
    const [cameraReady, setCameraReady] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleCameraReady = useCallback(() => setCameraReady(true), []);

    const handleMountError = useCallback((event) => {
        console.error('Error montando cámara:', event?.message);
        showError('Error de cámara', 'No fue posible iniciar la cámara. Intenta nuevamente.');
    }, [showError]);

    const handleCapture = useCallback(async () => {
        const camera = cameraRef.current;
        if (!camera || !cameraReady) return;

        try {
            const takePicture = camera.takePictureAsync || camera.takePhotoAsync;
            const photo = await takePicture.call(camera, {base64: true, quality: 0.9});
            setCapturedPhoto(photo);
        } catch (error) {
            console.error('Error de captura:', error);
            showError('Error de captura', 'No fue posible tomar la fotografía. Intenta nuevamente.');
        }
    }, [cameraReady, showError]);

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
            showSuccess('Registro exitoso', 'Tu rostro fue registrado correctamente en este dispositivo.');
        } catch (error) {
            console.error('Error al guardar:', error);
            showError('Error al guardar', 'Ocurrió un problema al guardar tu registro facial.');
        } finally {
            setSaving(false);
        }
    }, [capturedPhoto, saving, showSuccess, showError]);

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