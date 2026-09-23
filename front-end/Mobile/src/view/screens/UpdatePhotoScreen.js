import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../components/common/ThemeContext';
import {QuestionInput} from '../components/common/QuestionInput';
import PrimaryButton from '../components/auth/PrimaryButton';
import styles from './Styles/UpdatePhotoScreen/Style';
import {useUpdatePhotoViewModel} from '../../viewmodels/useUpdatePhotoViewModel';
import ENV from '../../config/env';

const FACE_REGISTER_URL = process.env.EXPO_PUBLIC_FACE_URL || `${ENV.API_BASE_URL}face/register`;

function FaceGuideOval({status, colors}) {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (status === 'ready') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {toValue: 1.03, duration: 600, useNativeDriver: true}),
                    Animated.timing(pulseAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [status]);

    const borderColor = {
        idle: 'rgba(255,255,255,0.4)',
        ready: colors.success ?? '#10B981',
        capturing: '#F59E0B',
        done: colors.success ?? '#10B981',
    }[status] || 'rgba(255,255,255,0.4)';

    return (
        <Animated.View
            style={[styles.ovalContainer, {borderColor, transform: [{scale: pulseAnim}]}]}
        >
            <View style={[styles.ovalInner, {borderColor}]}/>
        </Animated.View>
    );
}

export default function UpdatePhoto() {
    const {t} = useTranslation();
    const {colors, theme} = useTheme();

    const {
        attendanceRegistered,
        updateKey,
        formData,
        handleInputChange,
        handleRegisterAttendance,
        handleBack,
    } = useUpdatePhotoViewModel();

    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facing, setFacing] = useState('front');
    const [captureStatus, setCaptureStatus] = useState('idle');
    const [statusMessage, setStatusMessage] = useState(t('updatePhoto.camera.positionFace'));
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const cameraRef = useRef(null);

    const dynamicStyles = {
        safeAreaUpdatePhoto: {flex: 1, backgroundColor: colors.background},
        profileImageUpdatePhoto: {width: 120, height: 120, tintColor: colors.text},
        titleUpdatePhoto: {fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: colors.text, marginTop: 10},
        instructionTextUpdatePhoto: {textAlign: 'center', color: colors.textMuted, marginVertical: 15},
        formCardUpdatePhoto: {
            backgroundColor: colors.card, borderRadius: 15, padding: 20,
            borderWidth: theme === 'dark' ? 1 : 0, borderColor: colors.cardBorder,
        },
        formTitleUpdatePhoto: {fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15},
        inputLabelUpdatePhoto: {color: colors.text, marginBottom: 5, fontSize: 14, fontWeight: '500'},
        questionInputUpdatePhoto: {
            backgroundColor: colors.inputBackground, color: colors.text,
            borderColor: colors.border || colors.separator, borderWidth: 1,
            borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
        },
        registerButtonUpdatePhoto: {
            backgroundColor: '#2da351', padding: 12, borderRadius: 10,
            marginTop: 20, alignItems: 'center', flexDirection: 'row',
            justifyContent: 'center', marginHorizontal: 'auto',
        },
    };

    const isFormValid =
        formData.nombreCompleto?.trim().length >= 3 &&
        formData.documento?.trim().length >= 5 &&
        formData.telefono?.trim().length >= 7;

    const openCamera = async () => {
        if (!isFormValid) {
            Alert.alert(t('updatePhoto.camera.incompleteTitle'), t('updatePhoto.camera.incompleteMsg'));
            return;
        }

        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert(t('updatePhoto.camera.permissionTitle'), t('updatePhoto.camera.permissionMsg'));
                return;
            }
        }

        setCaptureStatus('idle');
        setCapturedPhoto(null);
        setStatusMessage(t('updatePhoto.camera.positionFace'));
        setIsProcessing(false);
        setIsCameraOpen(true);
    };

    const closeCamera = () => {
        if (isProcessing) return;

        if (capturedPhoto) {
            Alert.alert(
                t('updatePhoto.camera.discardTitle'),
                t('updatePhoto.camera.discardMsg'),
                [
                    {text: t('common.cancel'), style: 'cancel'},
                    {
                        text: t('common.discard'),
                        style: 'destructive',
                        onPress: () => {
                            setIsCameraOpen(false);
                            setCapturedPhoto(null);
                            setCaptureStatus('idle');
                        },
                    },
                ]
            );
            return;
        }

        setIsCameraOpen(false);
        setCapturedPhoto(null);
        setCaptureStatus('idle');
    };

    const takePicture = async () => {
        if (!cameraRef.current || isProcessing) return;

        try {
            setCaptureStatus('capturing');
            setStatusMessage(t('updatePhoto.camera.capturing'));

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
                skipProcessing: false,
            });

            setCapturedPhoto(photo);
            setCaptureStatus('done');
            setStatusMessage(t('updatePhoto.camera.confirmPhoto'));

        } catch (err) {
            console.error('Error al tomar foto:', err);
            setCaptureStatus('idle');
            setStatusMessage(t('updatePhoto.camera.captureError'));
        }
    };

    const handleConfirmPhoto = async () => {
        if (!capturedPhoto || isProcessing) return;
        await processFacePhoto(capturedPhoto);
    };

    const retakePicture = () => {
        setCapturedPhoto(null);
        setCaptureStatus('idle');
        setStatusMessage(t('updatePhoto.camera.positionFace'));
    };

    const processFacePhoto = async (photo) => {
        setIsProcessing(true);
        setStatusMessage(t('updatePhoto.camera.processing'));

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('photo', {
                uri: photo.uri,
                name: `face_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            formDataToSend.append('documento', formData.documento.trim());
            formDataToSend.append('nombre', formData.nombreCompleto.trim());

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(FACE_REGISTER_URL, {
                method: 'POST',
                body: formDataToSend,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Face register failed: ${response.status}`);
            }

            const backendResponse = await response.json();

            const faceData = {
                embedding: backendResponse.embedding,
                nombre: formData.nombreCompleto.trim(),
                telefono: formData.telefono.trim(),
                documento: formData.documento.trim(),
                photoUri: photo.uri,
                timestamp: Date.now(),
            };

            await SecureStore.setItemAsync(
                `face_${formData.documento.trim()}`,
                JSON.stringify(faceData)
            );

            if (Platform.OS === 'ios') {
                Vibration.vibrate([0, 50, 100, 50]);
            } else {
                Vibration.vibrate([0, 100, 50, 100, 50]);
            }

            setStatusMessage(t('updatePhoto.camera.success'));

            setTimeout(() => {
                setIsCameraOpen(false);
                setCapturedPhoto(null);
                handleRegisterAttendance();
            }, 1500);

        } catch (err) {
            console.error('Error procesando rostro:', err);
            Alert.alert(t('common.error'), t('updatePhoto.camera.processError'));

            setStatusMessage(t('updatePhoto.camera.retryError'));
            setCaptureStatus('done');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!permission) {
        return (
            <SafeAreaView style={dynamicStyles.safeAreaUpdatePhoto}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={colors.primary}/>
                </View>
            </SafeAreaView>
        );
    }

    const statusIsError = [
        t('updatePhoto.camera.captureError'),
        t('updatePhoto.camera.retryError'),
        t('updatePhoto.camera.processError'),
    ].includes(statusMessage);

    return (
        <SafeAreaView style={[styles.safeAreaUpdatePhoto, dynamicStyles.safeAreaUpdatePhoto]} key={`${updateKey}`}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                  style={styles.keyboardAvoidingViewUpdatePhoto}>
                <ScrollView showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollViewContentUpdatePhoto}
                            keyboardShouldPersistTaps="handled">
                    <View style={[styles.mainContainerUpdatePhoto, {marginTop: Platform.OS === 'ios' ? 0 : 50}]}>
                        <View style={styles.imageContainerUpdatePhoto}>
                            <Image
                                source={require('../../assets/images/perfil-del-usuario.png')}
                                style={[styles.profileImageUpdatePhoto, dynamicStyles.profileImageUpdatePhoto]}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={[styles.titleUpdatePhoto, dynamicStyles.titleUpdatePhoto]}>
                            {t('updatePhoto.title')}
                        </Text>
                        <Text style={[styles.instructionTextUpdatePhoto, dynamicStyles.instructionTextUpdatePhoto]}>
                            {t('updatePhoto.instructions')}
                        </Text>

                        <View style={[styles.formCardUpdatePhoto, dynamicStyles.formCardUpdatePhoto]}>
                            <Text style={[styles.formTitleUpdatePhoto, dynamicStyles.formTitleUpdatePhoto]}>
                                {t('updatePhoto.personalInfo')}
                            </Text>

                            <View style={styles.inputFieldContainerUpdatePhoto}>
                                <Text
                                    style={[styles.inputLabelUpdatePhoto, dynamicStyles.inputLabelUpdatePhoto]}>{t('updatePhoto.fullName')}</Text>
                                <QuestionInput
                                    placeholder={t('updatePhoto.fullNamePlaceholder')}
                                    value={formData.nombreCompleto}
                                    onChangeText={(value) => handleInputChange('nombreCompleto', value)}
                                    keyboardType="default"
                                    style={dynamicStyles.questionInputUpdatePhoto}
                                    placeholderTextColor={colors.textMuted}
                                    autoCapitalize="words"
                                    accessibilityLabel="Nombre completo"
                                />
                            </View>

                            <View style={styles.inputFieldContainerUpdatePhoto}>
                                <Text
                                    style={[styles.inputLabelUpdatePhoto, dynamicStyles.inputLabelUpdatePhoto]}>{t('updatePhoto.documentNumber')}</Text>
                                <QuestionInput
                                    placeholder={t('updatePhoto.documentPlaceholder')}
                                    value={formData.documento}
                                    onChangeText={(value) => handleInputChange('documento', value)}
                                    keyboardType="numeric"
                                    style={dynamicStyles.questionInputUpdatePhoto}
                                    placeholderTextColor={colors.textMuted}
                                    accessibilityLabel="Número de documento"
                                />
                            </View>

                            <View style={styles.inputFieldContainerUpdatePhoto}>
                                <Text
                                    style={[styles.inputLabelUpdatePhoto, dynamicStyles.inputLabelUpdatePhoto]}>{t('updatePhoto.phoneNumber')}</Text>
                                <QuestionInput
                                    placeholder={t('updatePhoto.phonePlaceholder')}
                                    value={formData.telefono}
                                    onChangeText={(value) => handleInputChange('telefono', value)}
                                    keyboardType="phone-pad"
                                    style={dynamicStyles.questionInputUpdatePhoto}
                                    placeholderTextColor={colors.textMuted}
                                    accessibilityLabel="Número de teléfono"
                                />
                            </View>

                            {attendanceRegistered && (
                                <View style={styles.alreadyRegisteredBox}>
                                    <Text
                                        style={[styles.alreadyRegisteredText, {color: colors.success ?? '#10B981'}]}>
                                        {t('updatePhoto.camera.alreadyRegistered')}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.registerButtonUpdatePhoto,
                                    dynamicStyles.registerButtonUpdatePhoto,
                                    attendanceRegistered && styles.registerButtonSuccessUpdatePhoto,
                                    !isFormValid && {opacity: 0.5},
                                ]}
                                onPress={openCamera}
                                disabled={!isFormValid || attendanceRegistered}
                                accessibilityLabel="Abrir cámara para registro facial"
                                accessibilityRole="button"
                            >
                                <Image source={require('../../assets/images/fotografia.png')}
                                       style={styles.registerButtonIconUpdatePhoto}/>
                                <Text style={styles.registerButtonTextUpdatePhoto}>
                                    {attendanceRegistered ? t('updatePhoto.attendanceRegistered') : t('updatePhoto.registerAttendance')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.backButtonContainerUpdatePhoto}>
                            <PrimaryButton title={t('common.back')} onPress={handleBack}/>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={isCameraOpen} transparent={false} animationType="slide" onRequestClose={closeCamera}
                   statusBarTranslucent>
                <View style={styles.cameraContainer}>
                    {capturedPhoto ? (
                        // la foto se queda HASTA que se confirme
                        <>
                            <Image source={{uri: capturedPhoto.uri}} style={StyleSheet.absoluteFill}
                                   resizeMode="cover"/>

                            {/* Header de la preview */}
                            <View style={styles.previewHeader}>
                                <TouchableOpacity
                                    onPress={closeCamera}
                                    style={styles.closeButton}
                                    disabled={isProcessing}
                                    accessibilityLabel="Cerrar cámara"
                                >
                                    <Text style={styles.closeButtonText}>✕</Text>
                                </TouchableOpacity>
                                <Text style={styles.previewHeaderTitle}>{t('updatePhoto.camera.reviewPhoto')}</Text>
                                <View style={{width: 40}}/>
                            </View>

                            {/* ⬇️ Panel inferior de confirmación con fondo oscuro */}
                            <View style={styles.previewOverlayWrapper} pointerEvents="box-none">
                                <View style={styles.previewOverlay}>

                                    <Text style={styles.previewTitle}>
                                        {t('updatePhoto.camera.photoOk')}
                                    </Text>
                                    <Text style={styles.previewSubtitle}>
                                        {t('updatePhoto.camera.photoHint')}
                                    </Text>

                                    {statusMessage && statusMessage !== t('updatePhoto.camera.confirmPhoto') && (
                                        <View style={[
                                            styles.previewStatusBox,
                                            {
                                                backgroundColor: statusIsError
                                                    ? 'rgba(239, 68, 68, 0.15)'
                                                    : 'rgba(16, 185, 129, 0.15)',
                                                borderColor: statusIsError
                                                    ? 'rgba(239, 68, 68, 0.4)'
                                                    : 'rgba(16, 185, 129, 0.4)',
                                            }
                                        ]}>
                                            <Text style={[styles.previewStatus, {
                                                color: statusIsError ? '#FCA5A5' : '#6EE7B7'
                                            }]}>
                                                {statusMessage}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.previewButtons}>
                                        <TouchableOpacity
                                            style={[styles.previewButton, styles.retakeButton]}
                                            onPress={retakePicture}
                                            disabled={isProcessing}
                                            accessibilityLabel="Repetir foto"
                                        >
                                            <Text style={styles.previewButtonIcon}>↻</Text>
                                            <Text style={styles.previewButtonText}>
                                                {t('updatePhoto.camera.retake')}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.previewButton, styles.confirmButton, {
                                                backgroundColor: isProcessing ? (colors.primary + '80') : (colors.primary),
                                                shadowColor: colors.primary,
                                            }]}
                                            onPress={handleConfirmPhoto}
                                            disabled={isProcessing}
                                            accessibilityLabel="Confirmar y guardar foto"
                                        >
                                            {isProcessing ? (
                                                <ActivityIndicator color="#fff"/>
                                            ) : (
                                                <>
                                                    <Text style={styles.previewButtonIcon}>✓</Text>
                                                    <Text style={styles.previewButtonText}>
                                                        {t('updatePhoto.camera.usePhoto')}
                                                    </Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </>
                    ) : (
                        // ── CÁMARA EN VIVO ──
                        <>
                            <CameraView
                                ref={cameraRef}
                                style={StyleSheet.absoluteFill}
                                facing={facing}
                                flash="off"
                            />

                            <View style={styles.cameraOverlay}>
                                <View style={styles.overlayContainer} pointerEvents="none">
                                    <FaceGuideOval status={captureStatus} colors={colors}/>
                                    <View style={styles.statusOverlay}>
                                        <View style={styles.statusContainer}>
                                            <Text style={styles.statusTextUpdate}>{statusMessage}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.cameraHeader}>
                                    <TouchableOpacity
                                        onPress={closeCamera}
                                        style={styles.closeButton}
                                        accessibilityLabel="Cerrar cámara"
                                    >
                                        <Text style={styles.closeButtonText}>✕</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.cameraTitle}>{t('updatePhoto.camera.title')}</Text>
                                    <TouchableOpacity
                                        onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
                                        style={styles.flipButton}
                                        accessibilityLabel="Cambiar cámara"
                                    >
                                        <Text style={styles.flipButtonText}>🔄</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.captureContainer}>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={takePicture}
                                    accessibilityLabel="Tomar foto"
                                    accessibilityRole="button"
                                >
                                    <View style={styles.captureButtonInner}/>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}