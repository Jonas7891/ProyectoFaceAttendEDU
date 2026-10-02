// ============================================================
//  FaceAttend EDU — CourseDetailModal
//  Modal de detalle de curso/ficha.
//  Los botones de gestión se muestran según permisos.
// ============================================================

import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BaseModal, Button } from "../../../components/common";
import { useTheme } from "../../../components/hooks/useTheme";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../../context/AppDataContext";
import { formatTime } from "../../../../core/constants/dateFormats";

/**
 * Obtiene el día actual en formato corto español
 * @returns {string} Día actual ("Lun", "Mar", "Mié", etc.)
 */
function getCurrentDay() {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return days[new Date().getDay()];
}

/**
 * Convierte un string de tiempo (HH:MM) a un objeto Date
 * @param {string} timeStr - Hora en formato "HH:MM" (ej: "14:30")
 * @returns {Date} Objeto Date con la hora especificada
 */
function parseTimeToDate(timeStr) {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
}

/**
 * Obtiene la hora actual en formato configurado (24h o 12h AM/PM)
 * @returns {string} Hora actual formateada según configuración
 */
function getCurrentTime() {
    return formatTime(new Date());
}

/**
 * Encuentra el horario activo actual basándose en día y hora
 * @param {Array} schedules - Array de horarios del curso
 * @returns {Object|null} Horario activo o null si no hay ninguno
 */
function findActiveSchedule(schedules) {
    if (!schedules || schedules.length === 0) return null;
    
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTime();
    
    // Buscar horario que coincida con el día actual y esté en el rango de horas
    return schedules.find(schedule => {
        if (!schedule.days || !schedule.days.includes(currentDay)) return false;
        
        // Comparar horas (formato configurado)
        return currentTime >= schedule.startTime && currentTime <= schedule.endTime;
    });
}

export default function CourseDetailModal({ course, onClose, canManage }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    const { environments } = useAppData();

    // Buscar ambiente(s) asociado(s) al curso
    const courseEnvironments = useMemo(() => {
        if (!course || !course.code || !environments) return [];
        
        return environments.filter(env => 
            env.schedules?.some(sch => 
                sch.courseCode === course.code || 
                sch.courseName === course.name
            )
        );
    }, [course?.code, course?.name, environments]);

    // Obtener todos los horarios del curso desde todos sus ambientes
    const allSchedules = useMemo(() => {
        if (!course || !course.code) return [];
        
        return courseEnvironments.flatMap(env => 
            (env.schedules || []).filter(sch => 
                sch.courseCode === course.code || 
                sch.courseName === course.name
            ).map(sch => ({
                ...sch,
                environmentId: env.id,
                environmentName: env.number,
            }))
        );
    }, [courseEnvironments, course?.code, course?.name]);

    // Determinar horario activo actual
    const activeSchedule = useMemo(() => {
        return findActiveSchedule(allSchedules);
    }, [allSchedules]);

    // Docente dinámico: usar el del horario activo, o mostrar el primero disponible
    const currentInstructor = useMemo(() => {
        if (!course) return '—';
        
        if (activeSchedule?.instructorName) {
            return `${activeSchedule.instructorName} (ahora)`;
        }
        
        // Si no hay horario activo, mostrar el primer instructor disponible
        if (allSchedules.length > 0) {
            const uniqueInstructors = [...new Set(allSchedules.map(s => s.instructorName).filter(Boolean))];
            return uniqueInstructors.join(', ') || course.professor || '—';
        }
        
        return course.professor || '—';
    }, [activeSchedule, allSchedules, course?.professor]);

    // Aula dinámica: usar la del horario activo, o mostrar todas disponibles
    const currentRoom = useMemo(() => {
        if (!course) return '—';
        
        if (activeSchedule?.environmentName) {
            return `${activeSchedule.environmentName} (ahora)`;
        }
        
        // Si no hay horario activo, mostrar todas las aulas donde se dicta
        if (courseEnvironments.length > 0) {
            const rooms = courseEnvironments.map(env => env.number).join(', ');
            return rooms || course.room || '—';
        }
        
        return course.room || '—';
    }, [activeSchedule, courseEnvironments, course?.room]);

    // Horario formateado
    const scheduleDisplay = useMemo(() => {
        if (!course) return '—';
        
        if (activeSchedule) {
            const days = activeSchedule.days.join(', ');
            const startFormatted = formatTime(parseTimeToDate(activeSchedule.startTime));
            const endFormatted = formatTime(parseTimeToDate(activeSchedule.endTime));
            return `${days} ${startFormatted}-${endFormatted}`;
        }
        
        // Si hay múltiples horarios, mostrar resumen
        if (allSchedules.length > 0) {
            // Agrupar por horario único
            const uniqueSchedules = allSchedules.reduce((acc, sch) => {
                const startFormatted = formatTime(parseTimeToDate(sch.startTime));
                const endFormatted = formatTime(parseTimeToDate(sch.endTime));
                const key = `${startFormatted}-${endFormatted}`;
                if (!acc[key]) {
                    acc[key] = {
                        time: key,
                        days: new Set(),
                    };
                }
                sch.days?.forEach(day => acc[key].days.add(day));
                return acc;
            }, {});
            
            return Object.values(uniqueSchedules)
                .map(s => `${Array.from(s.days).join(',')} ${s.time}`)
                .join(' | ');
        }
        
        return course.schedule || '—';
    }, [course, activeSchedule, allSchedules]);

    if (!course) return null;

    return (
        <BaseModal
            visible={!!course}
            onClose={onClose}
            title={course.name}
            subtitle={course.code}
            icon="book-open"
            iconColor={course.color}
            accentColor={course.color}
            maxWidth={520}
            footer={
                <React.Fragment>
                    <Button variant="ghost" onPress={onClose}>
                        {t("Cerrar")}
                    </Button>
                    {canManage && (
                        <Button 
                            variant="primary"
                            leftIcon={<Feather name="edit-3" size={14} color={c.brand.textOnPrimary} />}
                        >
                            {t("Editar curso")}
                        </Button>
                    )}
                </React.Fragment>
            }
        >
            {/* Grid de información */}
            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                {[
                    { label: t("Docente"), value: currentInstructor, icon: "user" },
                    { label: t("Semestre"), value: course.currentPeriod || course.semester, icon: "calendar" },
                    { label: t("Horario"), value: scheduleDisplay, icon: "clock" },
                    { label: t("Aula"), value: currentRoom, icon: "map-pin" },
                    {
                        label: t("Estudiantes"),
                        value: `${course.students} ${t("inscritos")}`,
                        icon: "users",
                    },
                ].map(({ label, value, icon }) => (
                    <View
                        key={label}
                        style={{
                            width: "47%",
                            backgroundColor: c.background.app,
                            borderRadius: 14,
                            padding: 14,
                            borderWidth: 1,
                            borderColor: c.border.primary + "40",
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 6,
                            }}
                        >
                            <Feather name={icon} size={12} color={c.text.secondary} />
                            <Text
                                style={{
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: c.text.secondary,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }}
                            >
                                {label}
                            </Text>
                        </View>
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: "600",
                                color: c.text.primary,
                            }}
                        >
                            {value}
                        </Text>
                    </View>
                ))}

                {/* Asistencia - Tarjeta especial con progress bar */}
                <View
                    style={{
                        width: "47%",
                        backgroundColor: c.background.app,
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: c.border.primary + "40",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 6,
                        }}
                    >
                        <Feather name="check-circle" size={12} color={c.text.secondary} />
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: "600",
                                color: c.text.secondary,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}
                        >
                            {t("Asistencia")}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "700",
                                color: course.avgAttendance >= 80 
                                    ? c.status.success 
                                    : course.avgAttendance >= 60 
                                    ? c.status.warning 
                                    : c.status.error,
                            }}
                        >
                            {course.avgAttendance}%
                        </Text>
                        <Text
                            style={{
                                fontSize: 11,
                                color: c.text.tertiary,
                            }}
                        >
                            promedio
                        </Text>
                    </View>
                    {/* Progress bar */}
                    <View
                        style={{
                            height: 6,
                            backgroundColor: c.border.primary + "40",
                            borderRadius: 10,
                            overflow: "hidden",
                        }}
                    >
                        <View
                            style={{
                                height: "100%",
                                width: `${course.avgAttendance}%`,
                                backgroundColor: course.avgAttendance >= 80 
                                    ? c.status.success 
                                    : course.avgAttendance >= 60 
                                    ? c.status.warning 
                                    : c.status.error,
                                borderRadius: 10,
                            }}
                        />
                    </View>
                </View>
            </View>
        </BaseModal>
    );
}
