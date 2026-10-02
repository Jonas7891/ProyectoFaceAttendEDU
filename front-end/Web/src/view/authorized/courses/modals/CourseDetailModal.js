// ============================================================
//  FaceAttend EDU — CourseDetailModal
//  Modal de detalle de curso/ficha.
//  Los botones de gestión se muestran según permisos.
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Badge, Button, ProgressBar, useAttendanceColor } from "../../../components/common";
import { useTheme } from "../../../components/hooks/useTheme";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";

export default function CourseDetailModal({ course, onClose, canManage }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    const barColor = useAttendanceColor(course?.avgAttendance ?? 0);

    if (!course) return null;

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: c.background.overlay,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                }}
                onPress={onClose}
                activeOpacity={1}
            >
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <View
                        style={{
                            backgroundColor: c.background.surface,
                            borderRadius: 14,
                            width: 500,
                            overflow: "hidden",
                            shadowColor: "#000",
                            shadowOpacity: 0.15,
                            shadowRadius: 10,
                            elevation: 5,
                        }}
                    >
                        <View style={{ height: 5, backgroundColor: course.color }} />
                        <View style={{ padding: 24 }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: 20,
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            fontWeight: "700",
                                            color: course.color,
                                            letterSpacing: 1,
                                        }}
                                    >
                                        {course.code}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            fontWeight: "700",
                                            color: c.text.primary,
                                            marginTop: 4,
                                        }}
                                    >
                                        {course.name}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={onClose}>
                                    <Feather name="x" size={18} color={c.text.secondary} />
                                </TouchableOpacity>
                            </View>

                            <View
                                style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: 12,
                                    marginBottom: 20,
                                }}
                            >
                                {[
                                    { label: t("Docente"), value: course.professor },
                                    { label: t("Semestre"), value: course.semester },
                                    { label: t("Horario"), value: course.schedule },
                                    { label: t("Aula"), value: course.room },
                                    {
                                        label: t("Estudiantes"),
                                        value: `${course.students} ${t("inscritos")}`,
                                    },
                                    { label: t("Asistencia"), value: `${course.avgAttendance}%` },
                                ].map(({ label, value }) => (
                                    <View
                                        key={label}
                                        style={{
                                            width: "47%",
                                            backgroundColor: c.background.app,
                                            borderRadius: 14,
                                            padding: 12,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                color: c.text.secondary,
                                                marginBottom: 4,
                                            }}
                                        >
                                            {label}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 10,
                                                fontWeight: "600",
                                                color: c.text.primary,
                                            }}
                                        >
                                            {value}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <View
                                style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end" }}
                            >
                                <Button variant="ghost" onPress={onClose}>
                                    {t("Cerrar")}
                                </Button>
                                {canManage && <Button variant="primary">{t("Editar curso")}</Button>}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
