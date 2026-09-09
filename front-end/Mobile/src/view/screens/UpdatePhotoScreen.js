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
import styles from './Style';
import {useUpdatePhotoViewModel} from '../../viewmodels/useUpdatePhotoViewModel';

const devFaceStore = {};
export {devFaceStore};

// url pal backend
const BACKEND_FACE_URL = ' ';

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
    const [statusMessage, setStatusMessage] = useState('Posiciona tu rostro en el óvalo');
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
            Alert.alert('Datos incompletos', 'Por favor completa todos los campos antes de continuar.');
            return;
        }

        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara.');
                return;
            }
        }

        setCaptureStatus('idle');
        setCapturedPhoto(null);
        setStatusMessage('Posiciona tu rostro en el óvalo');
        setIsProcessing(false);
        setIsCameraOpen(true);
    };

    const closeCamera = () => {
        if (isProcessing) return;

        if (capturedPhoto) {
            Alert.alert(
                '¿Descartar foto?',
                'Si sales, perderás la foto que tomaste.',
                [
                    {text: 'Cancelar', style: 'cancel'},
                    {
                        text: 'Descartar',
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
            setStatusMessage('Capturando...');

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
                skipProcessing: false,
            });

            setCapturedPhoto(photo);
            setCaptureStatus('done');
            setStatusMessage('Foto capturada. ¿La confirmas?');

        } catch (err) {
            console.error('Error al tomar foto:', err);
            setCaptureStatus('idle');
            setStatusMessage('Error al capturar. Intenta de nuevo.');
        }
    };

    const handleConfirmPhoto = async () => {
        if (!capturedPhoto || isProcessing) return;
        await processFacePhoto(capturedPhoto);
    };

    const retakePicture = () => {
        setCapturedPhoto(null);
        setCaptureStatus('idle');
        setStatusMessage('Posiciona tu rostro en el óvalo');
    };

    const processFacePhoto = async (photo) => {
        setIsProcessing(true);
        setStatusMessage('Procesando datos faciales...');

        try {
            let embedding = null;
            let backendResponse = null;

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

                const response = await fetch(BACKEND_FACE_URL, {
                    method: 'POST',
                    body: formDataToSend,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    backendResponse = await response.json();
                    embedding = backendResponse.embedding;
                }
            } catch (backendErr) {
                console.warn('⚠️ Backend no disponible:', backendErr.message);
            }

            if (!embedding) {
                const seed = formData.documento.trim();
                embedding = Array.from({length: 512}, (_, i) => {
                    const x = Math.sin(seed.charCodeAt(i % seed.length) * (i + 1) * 9.8) * 0.5;
                    return parseFloat(x.toFixed(4));
                });
            }

            const faceData = {
                embedding,
                nombre: formData.nombreCompleto.trim(),
                telefono: formData.telefono.trim(),
                documento: formData.documento.trim(),
                photoUri: photo.uri,
                timestamp: Date.now(),
                fromBackend: !!backendResponse,
            };

            devFaceStore[formData.documento.trim()] = faceData;
            await SecureStore.setItemAsync(
                `face_${formData.documento.trim()}`,
                JSON.stringify(faceData)
            );

            console.log('ROSTRO REGISTRADO:', faceData.nombre);

            if (Platform.OS === 'ios') {
                Vibration.vibrate([0, 50, 100, 50]);
            } else {
                Vibration.vibrate([0, 100, 50, 100, 50]);
            }

            setStatusMessage('✓ Rostro registrado con éxito');

            setTimeout(() => {
                setIsCameraOpen(false);
                setCapturedPhoto(null);
                handleRegisterAttendance();
            }, 1500);

        } catch (err) {
            console.error('Error procesando rostro:', err);
            Alert.alert('Error', 'No se pudo procesar el rostro. Intenta de nuevo.');

            setStatusMessage('Error al procesar. Puedes reintentar.');
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

                            {devFaceStore[formData.documento?.trim()] && (
                                <View style={styles.alreadyRegisteredBox}>
                                    <Text
                                        style={[styles.alreadyRegisteredText, {color: colors.success ?? '#10B981'}]}>
                                        ✓ Ya existe un registro facial para este documento.
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
                                <Text style={styles.previewHeaderTitle}>Revisar foto</Text>
                                <View style={{width: 40}}/>
                            </View>

                            {/* ⬇️ Panel inferior de confirmación con fondo oscuro */}
                            <View style={styles.previewOverlayWrapper} pointerEvents="box-none">
                                <View style={styles.previewOverlay}>
                                    {/* Icono decorativo */}
                                    <View style={styles.previewIconContainer}>
                                        <Text style={styles.previewIcon}>📸</Text>
                                    </View>

                                    <Text style={styles.previewTitle}>
                                        ¿La foto se ve bien?
                                    </Text>
                                    <Text style={styles.previewSubtitle}>
                                        Asegúrate de que tu rostro esté claro, bien iluminado y centrado.
                                    </Text>

                                    {statusMessage && statusMessage !== 'Foto capturada. ¿La confirmas?' && (
                                        <View style={[
                                            styles.previewStatusBox,
                                            {
                                                backgroundColor: statusMessage.includes('Error')
                                                    ? 'rgba(239, 68, 68, 0.15)'
                                                    : 'rgba(16, 185, 129, 0.15)',
                                                borderColor: statusMessage.includes('Error')
                                                    ? 'rgba(239, 68, 68, 0.4)'
                                                    : 'rgba(16, 185, 129, 0.4)',
                                            }
                                        ]}>
                                            <Text style={[styles.previewStatus, {
                                                color: statusMessage.includes('Error') ? '#FCA5A5' : '#6EE7B7'
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
                                                Repetir
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.previewButton, styles.confirmButton, {
                                                backgroundColor: isProcessing ? (colors.success + '80') : (colors.success ?? '#10B981'),
                                                shadowColor: colors.success ?? '#10B981',
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
                                                        Usar foto
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

                            <View style={styles.overlayContainer} pointerEvents="none">
                                <FaceGuideOval status={captureStatus} colors={colors}/>
                            </View>

                            <View style={styles.cameraHeader}>
                                <TouchableOpacity
                                    onPress={closeCamera}
                                    style={styles.closeButton}
                                    accessibilityLabel="Cerrar cámara"
                                >
                                    <Text style={styles.closeButtonText}>✕</Text>
                                </TouchableOpacity>
                                <Text style={styles.cameraTitle}>Registro Facial</Text>
                                <TouchableOpacity
                                    onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
                                    style={styles.flipButton}
                                    accessibilityLabel="Cambiar cámara"
                                >
                                    <Text style={styles.flipButtonText}>🔄</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.statusOverlay}>
                                <View style={styles.statusContainer}>
                                    <Text style={styles.statusTextUpdate}>{statusMessage}</Text>
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