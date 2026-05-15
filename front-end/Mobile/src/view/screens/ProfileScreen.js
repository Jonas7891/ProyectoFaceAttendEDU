import React from 'react';
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../components/common/ThemeContext';
import {useLanguageRefresh} from '../../utils/useLanguageRefresh';
import PrimaryButton from '../components/auth/PrimaryButton';
import styles from './Style';
import {useProfileViewModel} from '../../viewmodels/useProfileViewModel';

// ─────────────────────────────────────────────
//  Sub-componentes internos
// ─────────────────────────────────────────────

/** Campo de información genérico */
const InfoField = ({label, value, icon, colors}) => (
    <View style={styles.infoFieldContainerProfile}>
        <Text style={[styles.infoFieldLabelProfile, {color: colors.textSecondary}]}>
            {icon ? `${icon}  ` : ''}{label}
        </Text>
        <Text style={[styles.infoFieldValueProfile, {color: colors.text}]}>
            {value ?? '—'}
        </Text>
    </View>
);

/** Tarjeta de curso (matriculado o asignado) */
const CourseCard = ({course, colors}) => (
    <View
        style={[
            styles.courseCardProfile,
            {backgroundColor: colors.card, borderLeftColor: colors.primary, borderLeftWidth: 3},
        ]}
    >
        <Text style={[styles.courseNameProfile, {color: colors.text}]}>
            {course.course_name}
        </Text>
        <Text style={[styles.courseCodeProfile, {color: colors.textSecondary}]}>
            {course.course_code}
        </Text>
        {course.status && (
            <Text
                style={[
                    styles.courseStatusProfile,
                    {
                        color:
                            course.status === 'Active'
                                ? colors.success
                                : course.status === 'Withdrawn'
                                    ? colors.error
                                    : colors.textSecondary,
                    },
                ]}
            >
                {course.status}
            </Text>
        )}
    </View>
);

const StatItem = ({label, value, color}) => (
    <View style={styles.statItemProfile}>
        <Text style={[styles.statValueProfile, {color}]}>{value ?? 0}</Text>
        <Text style={[styles.statLabelProfile, {color}]}>{label}</Text>
    </View>
);

// ─────────────────────────────────────────────
//  Pantalla principal
// ─────────────────────────────────────────────

export default function ProfileScreen() {
    const {t} = useTranslation();
    const {colors, theme} = useTheme();
    const refreshKey = useLanguageRefresh();

    const {
        userRole,
        userInfo,
        updateKey,
        handleBack,
        toggleTheme,

        // ── Datos adicionales que debe proveer el ViewModel ──
        courses,
        attendanceStats,
        justifications,
        iotDevices,
    } = useProfileViewModel();

    const isAdmin = userRole === 'Administrador';
    const isStudent = userRole === 'Estudiante';

    return (
        <SafeAreaView
            style={[styles.safeAreaWhite, {backgroundColor: colors.backgroundWhite}]}
            key={`${refreshKey}-${updateKey}`}
        >
            <ScrollView contentContainerStyle={styles.ScrollViewContent}>
                <View style={styles.container} marginHorizontal={15}>

                    {/* ── Cabecera de perfil ── */}
                    <View
                        style={[
                            styles.profileHeaderSectionProfile,
                            {marginTop: Platform.OS === 'ios' ? 45 : 70},
                        ]}
                    >
                        {/* Avatar con iniciales */}
                        <View
                            style={[
                                styles.avatarCircleProfile,
                                {backgroundColor: isAdmin ? colors.primary + '25' : colors.success + '25'},
                            ]}
                        >
                            <Text
                                style={[styles.avatarInitialsProfile, {color: isAdmin ? colors.primary : colors.success}]}>
                                {userInfo.name
                                    ?.split(' ')
                                    .slice(0, 2)
                                    .map((w) => w[0])
                                    .join('')
                                    .toUpperCase() ?? '??'}
                            </Text>
                        </View>

                        <Text style={[styles.userNameProfile, {color: colors.text}]}>
                            {userInfo.name}
                        </Text>

                        <View
                            style={[
                                styles.roleBadgeProfile,
                                {backgroundColor: isAdmin ? colors.primary + '20' : colors.success + '20'},
                            ]}
                        >
                            <Text
                                style={[styles.roleBadgeTextProfile, {color: isAdmin ? colors.primary : colors.success}]}
                            >
                                {userInfo.role}
                            </Text>
                        </View>
                    </View>

                    {/* ── Información personal ── */}
                    <SectionTitle title={t('profile.personalInfo')} colors={colors}/>

                    <InfoField label={t('profile.email')} value={userInfo.email} colors={colors}/>
                    <InfoField label={t('profile.employeeId')} value={userInfo.identification}
                               colors={colors}/>
                    <InfoField label={t('profile.joinDate')} value={userInfo.joinDate} colors={colors}/>
                    <InfoField label={t('profile.school')} value={userInfo.school} colors={colors}/>

                    {/* ── Cursos matriculados — Estudiante ── */}
                    {isStudent && courses?.length > 0 && (
                        <>
                            <SectionTitle title={t('profile.enrolledCourses', 'Cursos matriculados')} colors={colors}/>
                            {courses.map((c) => (
                                <CourseCard key={c.id_enrollment ?? c.id_course} course={c} colors={colors}/>
                            ))}
                        </>
                    )}

                    {/* ── Estadísticas de asistencia — Estudiante ── */}
                    {isStudent && attendanceStats && (
                        <>
                            <SectionTitle title={t('profile.attendanceStats', 'Estadísticas de asistencia')}
                                          colors={colors}/>
                            <AttendanceStatsCard stats={attendanceStats} colors={colors}/>
                        </>
                    )}

                    {/* ── Justificaciones pendientes — Estudiante ── */}
                    {isStudent && justifications?.length > 0 && (
                        <>
                            <SectionTitle
                                title={t('profile.pendingJustifications', 'Justificaciones')}
                                colors={colors}
                                badge={justifications.filter((j) => j.approval === 'Pending').length}
                            />
                            {justifications.map((j) => (
                                <JustificationCard key={j.id_justification} item={j} colors={colors}/>
                            ))}
                        </>
                    )}

                    {/* ── Dispositivos IoT — solo Administrador ── */}
                    {isAdmin && iotDevices?.length > 0 && (
                        <>
                            <SectionTitle
                                title={t('profile.iotDevices', 'Dispositivos IoT')}
                                colors={colors}
                                badge={iotDevices.filter((d) => d.status === 'Active').length}
                                badgeLabel="activos"
                            />
                            {iotDevices.map((d) => (
                                <DeviceCard key={d.id_device} device={d} colors={colors}/>
                            ))}
                        </>
                    )}

                    {/* ── Configuración rápida ── */}
                    <View style={{marginTop: 25}}>
                        <SectionTitle title={t('profile.quickSettings')} colors={colors}/>
                        <TouchableOpacity
                            style={[styles.profileSettingsButtonProfile, {backgroundColor: colors.card}]}
                            onPress={toggleTheme}
                        >
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <View>
                                    <Text style={[styles.profileSettingsTitleProfile, {color: colors.text}]}>
                                        {t('settings.theme')}
                                    </Text>
                                    <Text
                                        style={[styles.profileSettingsSubtitleProfile, {color: colors.textSecondary}]}>
                                        {theme === 'dark' ? t('settings.darkTheme') : t('settings.lightTheme')}
                                    </Text>
                                </View>
                            </View>
                            <Text style={{fontSize: 14, color: colors.text, textDecorationLine: 'underline'}}>
                                {t('settings.changeTheme')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Botón volver ── */}
                    <View style={{marginTop: Platform.OS === 'ios' ? 20 : 10}}>
                        <View style={styles.buttonContainer} marginTop={5}>
                            <PrimaryButton title={t('consultJustify.back')} onPress={handleBack}/>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────
//  Helper: título de sección con badge opcional
// ─────────────────────────────────────────────
const SectionTitle = ({title, colors, badge, badgeLabel}) => (
    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10}}>
        <Text style={[styles.sectionTitleMenuProfile, {color: colors.text, flex: 1}]}>
            {title}
        </Text>
        {badge !== undefined && badge > 0 && (
            <View style={{
                backgroundColor: colors.primary + '20',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2
            }}>
                <Text style={{fontSize: 12, color: colors.primary, fontWeight: '600'}}>
                    {badge}{badgeLabel ? ` ${badgeLabel}` : ''}
                </Text>
            </View>
        )}
    </View>
);