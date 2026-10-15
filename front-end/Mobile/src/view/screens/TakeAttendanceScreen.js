import React from 'react';
import {ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {CameraView} from 'expo-camera';
import {useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../components/common/ThemeContext';
import BackButton from '../components/common/BackButton';
import CustomAlert from '../components/common/CustomAlert';
import cameraStyles from './Styles/RegisterFace/Style';
import {useTakeAttendanceViewModel} from '../../viewmodels/useTakeAttendanceViewModel';

const STATUS_KEYS = {Present: 'takeAttendance.present', Absent: 'takeAttendance.absent', Late: 'takeAttendance.late', Justified: 'takeAttendance.justified'};
const hhmm = (time) => String(time || '').slice(0, 5);

export default function TakeAttendanceScreen() {
    const {t, i18n} = useTranslation();
    const {colors} = useTheme();
    const isFocused = useIsFocused();
    const vm = useTakeAttendanceViewModel();
    const {capture} = vm;

    const statusColor = (status) => (status === 'Present' ? colors.success : status ? colors.danger : colors.textSecondary);
    const card = {backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder};
    const button = (enabled = true) => ({
        backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12, opacity: enabled ? 1 : 0.6,
    });

    const renderClasses = () => (
        <>
            <Text style={{color: colors.textSecondary, marginBottom: 12}}>{t('takeAttendance.pickClass')}</Text>
            {vm.classes.length === 0 && (
                <Text style={{color: colors.textSecondary, textAlign: 'center', marginTop: 30}}>{t('takeAttendance.noClasses')}</Text>
            )}
            {vm.classes.map((item) => (
                <TouchableOpacity key={item.block.schedule_block_id} style={card} onPress={() => vm.selectClass(item)}
                                  accessibilityRole="button" disabled={item.session?.session_status === 'Cancelled'}>
                    <Text style={{color: colors.text, fontWeight: 'bold'}}>{item.courseName || t('takeAttendance.class')}</Text>
                    <Text style={{color: colors.textSecondary, marginTop: 4}}>
                        {`${hhmm(item.block.starts_at)} – ${hhmm(item.block.ends_at)}`}
                    </Text>
                    <Text style={{color: colors.primary, marginTop: 4}}>
                        {t(item.session ? `takeAttendance.session${item.session.session_status}` : 'takeAttendance.notStarted')}
                    </Text>
                </TouchableOpacity>
            ))}
        </>
    );

    const renderSession = () => {
        const {selected} = vm;
        const progress = capture.livenessProgress
            ? t('faceCapture.gestureProgress', {
                current: Math.min(capture.livenessProgress.done + 1, capture.livenessProgress.total),
                total: capture.livenessProgress.total,
            })
            : null;
        return (
            <>
                <Text style={{color: colors.text, fontWeight: 'bold', fontSize: 16}}>{selected.courseName}</Text>
                <Text style={{color: colors.textSecondary, marginTop: 4}}>
                    {t('takeAttendance.deadline', {time: vm.deadline.toLocaleTimeString(i18n.language, {hour: '2-digit', minute: '2-digit'})})}
                </Text>

                {vm.isOpen && (
                    vm.permissionLoading ? <ActivityIndicator style={{marginTop: 16}} color={colors.primary}/>
                        : !vm.permissionGranted ? (
                            <TouchableOpacity style={button()} onPress={vm.requestPermission} accessibilityRole="button">
                                <Text style={{color: colors.modalButtonText}}>{t('registerFace.allowCamera')}</Text>
                            </TouchableOpacity>
                        ) : isFocused && (
                            <View style={[cameraStyles.cameraWrapper, {marginTop: 12}]}>
                                <CameraView ref={capture.cameraRef} facing="front" pictureSize={capture.pictureSize}
                                            style={cameraStyles.cameraPreview} onCameraReady={capture.handleCameraReady}/>
                                <View pointerEvents="none" style={cameraStyles.faceOval}/>
                                {!!capture.livenessAction && (
                                    <View pointerEvents="none" style={cameraStyles.livenessBanner}>
                                        <Text style={cameraStyles.livenessLabel}>{t('faceCapture.currentInstruction')}</Text>
                                        <Text style={cameraStyles.livenessAction}>{capture.livenessAction}</Text>
                                        {!!progress && <Text style={cameraStyles.livenessProgress}>{progress}</Text>}
                                    </View>
                                )}
                            </View>
                        )
                )}

                {!!capture.status.message && (
                    <Text accessibilityLiveRegion="polite" style={{marginTop: 10, color: capture.status.tone === 'error' ? colors.danger : colors.textSecondary}}>
                        {capture.status.message}
                    </Text>
                )}
                {!!vm.lastResult && (
                    <Text accessibilityLiveRegion="polite" style={{marginTop: 10, fontWeight: '600', color: statusColor(vm.lastResult.status)}}>
                        {t(vm.lastResult.duplicate ? 'takeAttendance.alreadyRecorded' : 'takeAttendance.recorded', {
                            name: vm.lastResult.name,
                            status: t(STATUS_KEYS[vm.lastResult.status] || 'takeAttendance.present'),
                        })}
                    </Text>
                )}

                {vm.isOpen ? (
                    <>
                        <TouchableOpacity style={button(capture.cameraReady && !capture.busy)} onPress={vm.handleCapture}
                                          disabled={!capture.cameraReady || capture.busy} accessibilityRole="button">
                            {capture.busy ? <ActivityIndicator color={colors.modalButtonText}/>
                                : <Text style={{color: colors.modalButtonText, fontWeight: '600'}}>{t('takeAttendance.capture')}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={{alignItems: 'center', marginTop: 12}} onPress={vm.handleClose} accessibilityRole="button">
                            <Text style={{color: colors.danger}}>{t('takeAttendance.closeSession')}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={{color: colors.textSecondary, marginTop: 12}}>{t('takeAttendance.sessionClosed')}</Text>
                )}

                <Text style={{color: colors.text, fontWeight: 'bold', marginTop: 20, marginBottom: 8}}>
                    {t('takeAttendance.roster', {count: vm.roster.length})}
                </Text>
                {vm.roster.map((member) => {
                    const status = vm.statusOf(member.actorId);
                    return (
                        <View key={member.actorId} style={[card, {flexDirection: 'row', justifyContent: 'space-between'}]}>
                            <Text style={{color: colors.text, flex: 1}}>{member.name || member.actorId}</Text>
                            <Text style={{color: statusColor(status)}}>{status ? t(STATUS_KEYS[status]) : t('takeAttendance.pending')}</Text>
                        </View>
                    );
                })}
            </>
        );
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, marginTop: 30}}>
                <BackButton onPress={vm.handleBack}/>
                <Text style={{color: colors.text, fontSize: 20, fontWeight: 'bold', flex: 1}}>{t('takeAttendance.title')}</Text>
            </View>
            {vm.loading ? (
                <ActivityIndicator size="large" color={colors.primary}/>
            ) : (
                <ScrollView contentContainerStyle={{padding: 16}}>
                    {vm.selected ? renderSession() : renderClasses()}
                </ScrollView>
            )}
            <CustomAlert
                visible={vm.alertConfig.visible}
                title={vm.alertConfig.title}
                message={vm.alertConfig.message}
                buttons={vm.alertConfig.buttons}
                onClose={vm.hideAlert}
                type={vm.alertConfig.type}
            />
        </SafeAreaView>
    );
}
