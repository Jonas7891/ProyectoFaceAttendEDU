import React from 'react';
import {ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View,} from 'react-native';
import {CameraView} from 'expo-camera';
import {useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import CustomLogo from '../components/common/logo';
import CustomAlert from '../components/common/CustomAlert';
import PrimaryButton from '../components/auth/PrimaryButton';
import styles from './Styles/RegisterFace/Style';
import {useRegisterFaceScreenViewModel} from '../../viewmodels/useRegisterFaceScreenViewModel';

export default function RegisterFace() {
    const isFocused = useIsFocused();
    const {t} = useTranslation();

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
        ? t('registerFace.subtitleReview')
        : cameraReady
            ? t('registerFace.subtitleReady')
            : t('registerFace.subtitleStarting');

    return (
        <SafeAreaView style={styles.safeAreaRegisterFace}>
            <View style={styles.registerFaceContainer}>
                <View style={styles.registerFaceHeader}>
                    <Text style={styles.registerFaceTitle}>{t('registerFace.title')}</Text>
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
                            {t('registerFace.permissionText')}
                        </Text>
                        <TouchableOpacity
                            style={styles.registerFacePermissionButton}
                            onPress={requestPermission}
                        >
                            <Text style={styles.registerFacePermissionButtonText}>{t('registerFace.allowCamera')}</Text>
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
                                title={saving ? t('registerFace.saving') : t('registerFace.saveFace')}
                                onPress={handleSave}
                            />
                            <TouchableOpacity
                                style={styles.secondaryButtonRegister}
                                onPress={handleRetake}
                                disabled={saving}
                            >
                                <Text style={styles.secondaryButtonText}>{t('registerFace.retake')}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[styles.captureButtonRegister, !cameraReady && {opacity: 0.6}]}
                            onPress={handleCapture}
                            disabled={!cameraReady}
                        >
                            <Text style={styles.captureButtonText}>
                                {cameraReady ? t('registerFace.captureFace') : t('registerFace.startingCamera')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!capturedPhoto && (
                    <View style={styles.registerFaceFooter}>
                        <PrimaryButton
                            title={t('common.back')}
                            onPress={handleBack}
                        />
                    </View>
                )}
            </View>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                type={alertConfig.type}
                onClose={hideAlert}
            />
        </SafeAreaView>
    );
}