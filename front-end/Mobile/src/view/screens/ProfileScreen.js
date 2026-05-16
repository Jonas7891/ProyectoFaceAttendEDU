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
import PasswordUpdateModal from '../components/common/PasswordUpdateModal';
import ProfileUpdateModal from '../components/common/ProfileUpdateModal';
import styles from './Style';
import {useProfileViewModel} from '../../viewmodels/useProfileViewModel';

/** Fila de información clave → valor */
const InfoField = ({label, value, colors}) => (
    <View style={[styles.infoFieldContainerProfile, {
        backgroundColor: colors.card,
        borderColor: colors.border ?? colors.textSecondary + '30',
        shadowColor: colors.text,
    }]}>
        <Text style={[styles.infoFieldLabelProfile, {color: colors.textSecondary}]}>{label}</Text>
        <Text style={[styles.infoFieldValueProfile, {color: colors.text}]}>{value ?? '—'}</Text>
    </View>
);

/** Encabezado de sección con acento de color y badge opcional */
const SectionTitle = ({title, colors, badge, badgeLabel}) => (
    <View style={styles.sectionTitleContainer}>
        <View style={[styles.sectionTitleAccentProfile, {backgroundColor: colors.primary}]} />
        <Text style={[styles.sectionTitleMenuProfile, {color: colors.text}]}>{title}</Text>
        {badge !== undefined && badge > 0 ? (
            <View style={[styles.sectionBadge, {backgroundColor: colors.primary + '20'}]}>
                <Text style={[styles.sectionBadgeText, {color: colors.primary}]}>
                    {badge}{badgeLabel ? ` ${badgeLabel}` : ''}
                </Text>
            </View>
        ) : null}
    </View>
);

const StatItem = ({label, value, color}) => (
    <View style={styles.statItemProfile}>
        <Text style={[styles.statValueProfile, {color}]}>{value ?? 0}</Text>
        <Text style={[styles.statLabelProfile, {color}]}>{label}</Text>
    </View>
);

// ─────────────────────────────────────────────
//  PANTALLA PRINCIPAL
// ─────────────────────────────────────────────

export default function ProfileScreen() {
    const {t}           = useTranslation();
    const {colors, theme} = useTheme();
    const refreshKey    = useLanguageRefresh();

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

    const isStudent = userRole === 'Estudiante';
    const isTeacher = userRole === 'Profesor';
    const isAdmin   = userRole === 'Administrador';
    const isDark    = theme === 'dark';

    const initials = userInfo?.name
        ?.split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() ?? '??';

    const avatarColor = isAdmin
        ? colors.primary
        : isTeacher
            ? (colors.warning ?? '#FF9800')
            : colors.success;

    return (
        <SafeAreaView
            style={[styles.safeAreaWhite, {backgroundColor: colors.backgroundWhite}]}
            key={`${refreshKey}-${updateKey}`}
        >
            <ScrollView
                contentContainerStyle={styles.ScrollViewContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.container, {paddingHorizontal: 16}]}>

                    {/* ══ HEADER / AVATAR ══ */}
                    <View style={[
                        styles.profileHeaderSectionProfile,
                        {marginTop: Platform.OS === 'ios' ? 8 : 30},
                    ]}>
                        <View style={[styles.schoolInfoCardSchoolConfig, {marginTop: Platform.OS === 'ios' ? 10 : 25}]}>
                            <View style={styles.schoolLogoContainerSchoolConfig}>
                                <Text style={styles.schoolLogoSchoolConfig}>logo</Text>
                            </View>
                        </View>
                        <Text style={[styles.userNameProfile, {color: colors.text}]}>
                            {userInfo?.name ?? t('profile.noName', 'Sin nombre')}
                        </Text>

                        <View style={[styles.roleBadgeProfile, {
                            backgroundColor: avatarColor + '15',
                            borderColor: isDark ? '#FFFFFF' : avatarColor + '40',
                        }]}>
                            <View style={[styles.roleBadgeDotProfile, {backgroundColor: avatarColor}]} />
                            <Text style={[styles.roleBadgeTextProfile, {color: isDark ? '#FFFFFF' : avatarColor}]}>
                                {userInfo?.role ?? t('profile.noRole', 'Sin rol')}
                            </Text>
                        </View>
                    </View>

                    {/* ══ INFORMACIÓN PERSONAL ══
                        BD: person.name | person.email | person.phone
                            user.username | user.created_at (joinDate)
                            school.name
                    */}
                    <SectionTitle
                        title={t('profile.personalInfo', 'Información personal')}
                        colors={colors}
                    />
                    <InfoField label={t('profile.email',      'Correo electrónico')} value={userInfo?.email}          colors={colors} />
                    <InfoField label={t('profile.phone',      'Teléfono')}           value={userInfo?.phone}          colors={colors} />
                    <InfoField label={t('profile.employeeId', 'Identificación')}     value={userInfo?.identification} colors={colors} />
                    <InfoField label={t('profile.joinDate',   'Fecha de ingreso')}   value={userInfo?.joinDate}       colors={colors} />
                    <InfoField label={t('profile.school',     'Colegio')}            value={userInfo?.school}         colors={colors} />

                    <InfoField label={t('profile.email')} value={userInfo.email} colors={colors}/>
                    <InfoField label={t('profile.employeeId')} value={userInfo.identification}
                               colors={colors}/>
                    <InfoField label={t('profile.joinDate')} value={userInfo.joinDate} colors={colors}/>
                    <InfoField label={t('profile.school')} value={userInfo.school} colors={colors}/>

                    {/* ── Cursos matriculados — Estudiante ── */}
                    {isStudent && courses?.length > 0 && (
                        <>
                            {/* Cursos matriculados — BD: enrollment + course */}
                            {courses.length > 0 && (
                                <>
                                    <SectionTitle
                                        title={t('profile.enrolledCourses', 'Cursos matriculados')}
                                        colors={colors}
                                        badge={courses.length}
                                    />
                                    {courses.map((course) => (
                                        <CourseCard
                                            key={course.id_enrollment ?? course.id_course ?? course.course_code}
                                            course={course}
                                            colors={colors}
                                        />
                                    ))}
                                </>
                            )}

                            {/* Estadísticas de asistencia — BD: attendance */}
                            {attendanceStats && (
                                <>
                                    <SectionTitle
                                        title={t('profile.attendanceStats', 'Estadísticas de asistencia')}
                                        colors={colors}
                                    />
                                    <AttendanceStatsCard stats={attendanceStats} colors={colors} t={t} />
                                </>
                            )}

                            {/* Justificaciones — BD: justification */}
                            {justifications.length > 0 && (
                                <>
                                    <SectionTitle
                                        title={t('profile.pendingJustifications', 'Justificaciones')}
                                        colors={colors}
                                        badge={justifications.filter((j) => j?.approval === 'Pending').length}
                                    />
                                    {justifications.map((item) => (
                                        <JustificationCard
                                            key={item.id_justification ?? item.id}
                                            item={item}
                                            colors={colors}
                                            t={t}
                                        />
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {/* ══ SECCIÓN PROFESOR ══ */}
                    {isTeacher && (
                        <>
                            {/* Horario — BD: schedule + course + classroom */}
                            {teacherSchedules.length > 0 && (
                                <>
                                    <SectionTitle
                                        title={t('profile.teacherSchedule', 'Mi horario')}
                                        colors={colors}
                                        badge={teacherSchedules.length}
                                        badgeLabel={t('profile.classes', 'clases')}
                                    />
                                    {teacherSchedules.map((sch) => (
                                        <TeacherScheduleCard
                                            key={sch.id_schedule}
                                            schedule={sch}
                                            colors={colors}
                                        />
                                    ))}
                                </>
                            )}

                            {/* Asistencia por curso — BD: attendance agregada por schedule/course */}
                            {teacherCourseStats.length > 0 && (
                                <>
                                    <SectionTitle
                                        title={t('profile.courseAttendance', 'Asistencia por curso')}
                                        colors={colors}
                                    />
                                    {teacherCourseStats.map((stat) => (
                                        <TeacherCourseStatCard
                                            key={stat.id_course ?? stat.course_code}
                                            courseStat={stat}
                                            colors={colors}
                                            t={t}
                                        />
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {/* ══ SECCIÓN ADMINISTRADOR ══ */}
                    {isAdmin && (
                        <>
                            {/* Información del colegio y período activo — BD: school + period */}
                            {schoolInfo && (
                                <>
                                    <SectionTitle
                                        title={t('profile.schoolInfo', 'Información del colegio')}
                                        colors={colors}
                                    />
                                    <SchoolInfoCard schoolInfo={schoolInfo} colors={colors} t={t} />
                                </>
                            )}

                            {/* Dispositivos IoT — BD: iot_device + classroom */}
                            {iotDevices.length > 0 && (
                                <>
                                    <SectionTitle
                                        title={t('profile.iotDevices', 'Dispositivos IoT')}
                                        colors={colors}
                                        badge={iotDevices.filter((d) => d?.status === 'Active').length}
                                        badgeLabel={t('profile.active', 'activos')}
                                    />
                                    {iotDevices.map((device) => (
                                        <DeviceCard
                                            key={device.id_device ?? device.id}
                                            device={device}
                                            colors={colors}
                                        />
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {/* ══ CONFIGURACIÓN RÁPIDA ══ */}
                    <View style={{marginTop: 25}}>
                        <SectionTitle
                            title={t('profile.quickSettings', 'Configuración rápida')}
                            colors={colors}
                        />

                        {/* Toggle de tema */}
                        <TouchableOpacity
                            style={[styles.profileSettingsButtonProfile, {
                                backgroundColor: colors.card,
                                borderColor:     colors.border ?? colors.textSecondary + '20',
                                shadowColor:     colors.text,
                            }]}
                            onPress={toggleTheme}
                            activeOpacity={0.75}
                        >
                            <View style={{flex: 1, marginLeft: 12}}>
                                <Text style={[styles.profileSettingsTitleProfile, {color: colors.text}]}>
                                    {t('settings.theme', 'Tema')}
                                </Text>
                                <Text style={[styles.profileSettingsSubtitleProfile, {color: colors.textSecondary}]}>
                                    {isDark
                                        ? t('settings.darkTheme', 'Tema oscuro activo')
                                        : t('settings.lightTheme', 'Tema claro activo')}
                                </Text>
                            </View>
                            <View style={[styles.settingsChevronProfile, {
                                backgroundColor: colors.primary + '15',
                            }]}>
                                <Text style={{fontSize: 13, color: colors.primary, fontWeight: '700'}}>
                                    {t('settings.changeTheme', 'Cambiar')}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.profileSettingsButtonProfile, {
                                backgroundColor: colors.card,
                                borderColor:     colors.border ?? colors.textSecondary + '20',
                                shadowColor:     colors.text,
                            }]}
                            activeOpacity={0.75}
                        >
                            <ProfileUpdateModal userInfo={userInfo} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.profileSettingsButtonProfile, {
                                backgroundColor: colors.card,
                                borderColor:     colors.border ?? colors.textSecondary + '20',
                                shadowColor:     colors.text,
                            }]}
                            activeOpacity={0.75}
                        >
                            <PasswordUpdateModal />
                        </TouchableOpacity>
                    </View>

                    {/* ══ BOTÓN VOLVER ══ */}
                    <View style={{marginTop: Platform.OS === 'ios' ? 5 : 0}}>
                        <View style={styles.buttonContainer}>
                            <PrimaryButton title={t('consultJustify.back', 'Volver')} onPress={handleBack} />
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
/*
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
*/