// ============================================================
//  FaceAttend EDU — CourseDetailModal
//  Modal de detalle de curso/ficha.
//  Los botones de gestión se muestran según permisos.
// ============================================================

import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BaseModal, Button } from "../../../components/common";
import { useTheme } from "../../../components/hooks/useTheme";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";

export default function CourseDetailModal({ course, onClose, canManage }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

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
                    { label: t("Docente"), value: course.professor, icon: "user" },
                    { label: t("Semestre"), value: course.semester, icon: "calendar" },
                    { label: t("Horario"), value: course.schedule, icon: "clock" },
                    { label: t("Aula"), value: course.room, icon: "map-pin" },
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
                            <Feather name={icon} size={12} color={c.text.tertiary} />
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
                        <Feather name="check-circle" size={12} color={c.text.tertiary} />
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
