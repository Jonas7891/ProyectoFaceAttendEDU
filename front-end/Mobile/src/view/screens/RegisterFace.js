import React from 'react';
import {ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View,} from 'react-native';
import {CameraView} from 'expo-camera';
import {useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import CustomLogo from '../components/common/logo';
import CustomAlert from '../components/common/CustomAlert';
import BackButton from '../components/common/BackButton';
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
        enrolling,
        livenessAction,
        livenessProgress,
        handleStart,
        handleBack,
        alertConfig,
        hideAlert,
    } = useRegisterFaceScreenViewModel();

    const subtitle = enrolling
        ? t('registerFace.subtitleCapturing')
        : cameraReady
            ? t('registerFace.subtitleReady')
            : t('registerFace.subtitleStarting');

    return (
        <SafeAreaView style={styles.safeAreaRegisterFace}>
            <View style={styles.registerFaceContainer}>
                <View style={styles.registerFaceHeader}>
                    <BackButton onPress={handleBack} />
                    <Text style={styles.registerFaceTitle}>{t('registerFace.title')}</Text>
                    <CustomLogo size="small" rounded={true} backgroundColor="#000000" marginBottom={-2}/>
                </View>

                <Text style={styles.registerFaceSubtitle}>{subtitle}</Text>

                {permissionLoading ? (
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
                        {!!livenessAction && (
                            <View pointerEvents="none" style={styles.livenessBanner}>
                                <Text style={styles.livenessBannerText}>{livenessAction}</Text>
                                {!!livenessProgress && (
                                    <Text style={styles.livenessProgressText}>
                                        {t('registerFace.gestureProgress', {
                                            done: livenessProgress.done,
                                            total: livenessProgress.total,
                                        })}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                ) : null}

                <View style={styles.registerFaceActions}>
                    <TouchableOpacity
                        style={[styles.captureButtonRegister, (!cameraReady || enrolling) && {opacity: 0.6}]}
                        onPress={handleStart}
                        disabled={!cameraReady || enrolling}
                    >
                        <Text style={styles.captureButtonText}>
                            {!cameraReady
                                ? t('registerFace.startingCamera')
                                : enrolling
                                    ? t('registerFace.registering')
                                    : t('registerFace.startRegistration')}
                        </Text>
                    </TouchableOpacity>
                </View>
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