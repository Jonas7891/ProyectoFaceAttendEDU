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

// ─────────────────────────────────────────────
//  TARJETAS — ESTUDIANTE
// ─────────────────────────────────────────────

/** Ítem individual de estadística con fondo contextual */
const StatItem = ({label, value, color, backgroundColor}) => (
    <View style={[styles.statItemProfile, {backgroundColor}]}>
        <Text style={[styles.statValueProfile, {color}]}>{value ?? 0}</Text>
        <Text style={[styles.statLabelProfile, {color: color + 'CC'}]}>{label}</Text>
    </View>
);

/**
 * Card de estadísticas de asistencia.
 * Campos BD: attendance.status (Present / Absent / Late / Justified)
 * attendanceStats esperado: { attendancePercentage, totalClasses, present, absent, late, justified }
 */
const AttendanceStatsCard = ({stats, colors, t}) => {
    const attendanceRate = stats?.attendancePercentage ?? stats?.attendanceRate ?? '0%';
    return (
        <View style={[styles.statsCardProfile, {
            backgroundColor: colors.card,
            borderColor: colors.border ?? colors.textSecondary + '25',
            shadowColor: colors.text,
        }]}>
            <View style={styles.statsCircleContainer}>
                <View style={[styles.statsCircleRing, {borderColor: colors.primary}]}>
                    <Text style={[styles.statsPctText, {color: colors.primary}]}>{attendanceRate}</Text>
                    <Text style={[styles.statsLabel, {color: colors.textSecondary}]}>
                        {t('profile.attendanceRate', 'Asistencia')}
                    </Text>
                </View>
            </View>
            <View style={styles.statsBreakdown}>
                <StatItem
                    label={t('profile.totalClasses', 'Clases')}
                    value={stats?.totalClasses ?? stats?.classes ?? 0}
                    color={colors.text}
                    backgroundColor={colors.textSecondary + '12'}
                />
                <StatItem
                    label={t('profile.presentCount', 'Presente')}
                    value={stats?.present ?? stats?.presentCount ?? 0}
                    color={colors.success}
                    backgroundColor={colors.success + '12'}
                />
                <StatItem
                    label={t('profile.absentCount', 'Ausente')}
                    value={stats?.absent ?? stats?.absentCount ?? 0}
                    color={colors.error}
                    backgroundColor={colors.error + '12'}
                />
                {(stats?.late ?? 0) > 0 && (
                    <StatItem
                        label={t('profile.lateCount', 'Tarde')}
                        value={stats?.late ?? 0}
                        color={colors.warning ?? '#FF9800'}
                        backgroundColor={(colors.warning ?? '#FF9800') + '12'}
                    />
                )}
            </View>
        </View>
    );
};

/**
 * Card de justificación del estudiante.
 * Campos BD: justification.justification | justification.approval | justification.created_at
 */
const JustificationCard = ({item, colors, t}) => {
    const approval = item?.approval;
    const isPending  = approval === 'Pending';
    const isApproved = approval === 'Approved';
    const statusColor = isPending ? colors.primary : isApproved ? colors.success : colors.error;

    return (
        <View style={[styles.justCardProfile, {
            backgroundColor: colors.card,
            borderColor: colors.border ?? colors.textSecondary + '20',
            shadowColor: colors.text,
        }]}>
            <View style={[styles.justIndicatorProfile, {backgroundColor: statusColor}]} />
            <View style={{flex: 1}}>
                <Text style={[styles.justDateProfile, {color: colors.textSecondary}]}>
                    {item?.date ?? item?.submittedAt ?? item?.created_at ?? '---'}
                </Text>
                <Text style={[styles.justTextProfile, {color: colors.text}]} numberOfLines={2}>
                    {item?.justification ?? item?.reason ?? item?.description
                        ?? t('profile.justification', 'Justificación')}
                </Text>
            </View>
            <View style={[styles.justBadgeProfile, {
                backgroundColor: statusColor + '15',
                borderColor: statusColor + '30',
            }]}>
                <Text style={[styles.justBadgeTextProfile, {color: statusColor}]}>
                    {approval ?? t('profile.pending', 'Pendiente')}
                </Text>
            </View>
        </View>
    );
};

// ─────────────────────────────────────────────
//  TARJETAS — PROFESOR
// ─────────────────────────────────────────────

/**
 * Card de horario de clase para el profesor.
 * Campos BD: schedule.day | schedule.start_time | schedule.end_time
 *            course.course_name | classroom.classroom_name | period.name
 */
const TeacherScheduleCard = ({schedule, colors}) => (
    <View style={[styles.courseCardProfile, {
        backgroundColor: colors.card,
        borderLeftColor: colors.primary,
        shadowColor: colors.text,
    }]}>
        <View style={styles.courseCardInnerProfile}>
            <View style={[styles.courseCardDotProfile, {backgroundColor: colors.primary}]} />
            <View style={{flex: 1}}>
                <Text style={[styles.courseNameProfile, {color: colors.text}]}>
                    {schedule.course_name}
                </Text>
                <Text style={[styles.courseCodeProfile, {color: colors.textSecondary}]}>
                    {schedule.classroom_name}  ·  {schedule.start_time} – {schedule.end_time}
                </Text>
            </View>
            <View style={[styles.courseStatusBadgeProfile, {
                backgroundColor: colors.primary + '18',
            }]}>
                <Text style={[styles.courseStatusProfile, {color: colors.primary}]}>
                    {schedule.day}
                </Text>
            </View>
        </View>
    </View>
);

/**
 * Resumen de asistencia de un curso dictado por el profesor.
 * Campos BD: calculados desde attendance por schedule/course
 * courseStat esperado: { course_name, course_code, totalStudents, presentAvg, absentAvg }
 */
const TeacherCourseStatCard = ({courseStat, colors, t}) => (
    <View style={[styles.statsCardProfile, {
        backgroundColor: colors.card,
        borderColor: colors.border ?? colors.textSecondary + '25',
        shadowColor: colors.text,
        flexDirection: 'column',
        gap: 10,
    }]}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <View style={[styles.courseCardDotProfile, {backgroundColor: colors.primary}]} />
            <Text style={[styles.courseNameProfile, {color: colors.text, flex: 1}]}>
                {courseStat.course_name}
            </Text>
            <Text style={[styles.courseCodeProfile, {color: colors.textSecondary}]}>
                {courseStat.course_code}
            </Text>
        </View>
        <View style={styles.statsBreakdown}>
            <StatItem
                label={t('profile.totalStudents', 'Alumnos')}
                value={courseStat?.totalStudents ?? 0}
                color={colors.text}
                backgroundColor={colors.textSecondary + '12'}
            />
            <StatItem
                label={t('profile.presentAvg', 'Presentes')}
                value={courseStat?.presentAvg ?? 0}
                color={colors.success}
                backgroundColor={colors.success + '12'}
            />
            <StatItem
                label={t('profile.absentAvg', 'Ausentes')}
                value={courseStat?.absentAvg ?? 0}
                color={colors.error}
                backgroundColor={colors.error + '12'}
            />
        </View>
    </View>
);

// ─────────────────────────────────────────────
//  TARJETAS — ADMINISTRADOR
// ─────────────────────────────────────────────

/**
 * Tarjeta de dispositivo IoT.
 * Campos BD: iot_device.device_name | iot_device.status | iot_device.ip_address
 *            iot_device.last_connection | classroom.classroom_name
 */
const DeviceCard = ({device, colors}) => {
    const isActive = device?.status === 'Active';
    return (
        <View style={[styles.deviceCardProfile, {
            backgroundColor: colors.card,
            borderColor: colors.border ?? colors.textSecondary + '20',
            shadowColor: colors.text,
        }]}>
            <View style={[styles.deviceIconContainerProfile, {
                backgroundColor: isActive ? colors.success + '15' : colors.textSecondary + '12',
            }]}>
                <Text style={{fontSize: 20}}>{isActive ? '📡' : '🔌'}</Text>
            </View>
            <View style={{flex: 1}}>
                <Text style={[styles.deviceNameProfile, {color: colors.text}]}>
                    {device?.device_name ?? 'Dispositivo'}
                </Text>
                <Text style={[styles.deviceDetailProfile, {color: colors.textSecondary}]}>
                    {device?.classroom_name ?? device?.location ?? 'Sin aula asignada'}
                </Text>
                {device?.ip_address ? (
                    <Text style={[styles.deviceDetailProfile, {color: colors.textSecondary, fontSize: 11}]}>
                        IP: {device.ip_address}
                    </Text>
                ) : null}
            </View>
            <View style={[styles.deviceStatusChipProfile, {
                backgroundColor: isActive ? colors.success + '15' : colors.textSecondary + '12',
            }]}>
                <View style={[styles.deviceStatusDotProfile, {
                    backgroundColor: isActive ? colors.success : colors.textSecondary,
                }]} />
                <Text style={[styles.deviceStatusProfile, {
                    color: isActive ? colors.success : colors.textSecondary,
                }]}>
                    {device?.status ?? 'N/A'}
                </Text>
            </View>
        </View>
    );
};

/**
 * Resumen del colegio para el administrador.
 * Campos BD: school.name | school.nit | school.address | school.phone | school.email
 *            period.name | period.start_date | period.end_date (periodo activo)
 * schoolInfo esperado: { name, nit, address, phone, email, activePeriod }
 * activePeriod esperado: { name, start_date, end_date }
 */
const SchoolInfoCard = ({schoolInfo, colors, t}) => (
    <View style={[styles.statsCardProfile, {
        backgroundColor: colors.card,
        borderColor: colors.border ?? colors.textSecondary + '25',
        shadowColor: colors.text,
        flexDirection: 'column',
        gap: 0,
        padding: 16,
    }]}>
        <Text style={[styles.courseNameProfile, {color: colors.text, marginBottom: 10}]}>
            🏫  {schoolInfo?.name ?? '—'}
        </Text>
        <InfoField label={t('profile.nit', 'NIT')}           value={schoolInfo?.nit}     colors={colors} />
        <InfoField label={t('profile.address', 'Dirección')} value={schoolInfo?.address}  colors={colors} />
        <InfoField label={t('profile.phone', 'Teléfono')}    value={schoolInfo?.phone}    colors={colors} />
        {schoolInfo?.activePeriod && (
            <InfoField
                label={t('profile.activePeriod', 'Período activo')}
                value={`${schoolInfo.activePeriod.name}  (${schoolInfo.activePeriod.start_date} – ${schoolInfo.activePeriod.end_date})`}
                colors={colors}
            />
        )}
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
        // Estudiante
        courses        = [],
        attendanceStats = null,
        justifications  = [],
        // Profesor
        teacherSchedules   = [],
        teacherCourseStats = [],
        // Administrador
        iotDevices  = [],
        schoolInfo  = null,
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

                    {/* ══ SECCIÓN ESTUDIANTE ══ */}
                    {isStudent && (
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