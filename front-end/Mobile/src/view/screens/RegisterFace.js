import React from 'react';
import {ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View,} from 'react-native';
import {CameraView} from 'expo-camera';
import {useIsFocused} from '@react-navigation/native';
import CustomLogo from '../components/common/logo';
import CustomAlert from '../components/common/CustomAlert';
import PrimaryButton from '../components/auth/PrimaryButton';
import styles from './Style';
import {useRegisterFaceScreenViewModel} from '../../viewmodels/useRegisterFaceScreenViewModel';

export default function RegisterFace() {
    const isFocused = useIsFocused();

    const {
        permissionLoading,
        permissionGranted,
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
    } = useRegisterFaceScreenViewModel();

    const subtitle = capturedPhoto
        ? 'Revisa la fotografía. Si estás conforme guárdala; de lo contrario, vuelve a tomarla.'
        : cameraReady
            ? 'Coloca tu rostro dentro del óvalo y presiona el botón cuando estés acomodado.'
            : 'Iniciando cámara...';

    return (
        <SafeAreaView style={styles.safeAreaRegisterFace}>
            <View style={styles.registerFaceContainer}>
                <View style={styles.registerFaceHeader}>
                    <Text style={styles.registerFaceTitle}>Registro de rostro</Text>
                    <CustomLogo size="small" rounded={true} backgroundColor="#000000" marginBottom={-2}/>
                </View>

                <Text style={styles.registerFaceSubtitle}>{subtitle}</Text>

                {capturedPhoto ? (
                    <View style={styles.cameraWrapper}>
                        <Image source={{uri: capturedPhoto.uri}} style={styles.cameraPreview}/>
                    </View>
                ) : permissionLoading ? (
                    <View style={styles.cameraWrapper}>
                        <ActivityIndicator color="#2563EB"/>
                    </View>
                ) : !permissionGranted ? (
                    <View style={styles.cameraWrapper}>
                        <Text style={styles.registerFacePermissionText}>
                            Se requiere acceso a la cámara para registrar tu rostro.
                        </Text>
                        <TouchableOpacity
                            style={styles.registerFacePermissionButton}
                            onPress={requestPermission}
                        >
                            <Text style={styles.registerFacePermissionButtonText}>Permitir cámara</Text>
                        </TouchableOpacity>
                    </View>
                ) : isFocused ? (
                    <View style={styles.cameraWrapper}>
                        <CameraView
                            ref={cameraRef}
                            facing="front"
                            style={styles.cameraPreview}
                            onCameraReady={handleCameraReady}
                            onMountError={handleMountError}
                        />
                        <View pointerEvents="none" style={styles.faceOval}/>
                    </View>
                ) : null}

                <View style={styles.registerFaceActions}>
                    {capturedPhoto ? (
                        <>
                            <PrimaryButton
                                title={saving ? 'Guardando...' : 'Guardar rostro'}
                                onPress={handleSave}
                            />
                            <TouchableOpacity
                                style={styles.secondaryButtonRegister}
                                onPress={handleRetake}
                                disabled={saving}
                            >
                                <Text style={styles.secondaryButtonText}>Volver a tomar</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[styles.captureButtonRegister, !cameraReady && {opacity: 0.6}]}
                            onPress={handleCapture}
                            disabled={!cameraReady}
                        >
                            <Text style={styles.captureButtonText}>
                                {cameraReady ? 'Capturar rostro' : 'Iniciando cámara...'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!capturedPhoto && (
                    <View style={styles.registerFaceFooter}>
                        <PrimaryButton
                            title="Volver"
                            onPress={handleBack}
                        />
                    </View>
                )}
            </View>

            <CustomAlert {...alertConfig} onDismiss={hideAlert}/>
        </SafeAreaView>
    );
}