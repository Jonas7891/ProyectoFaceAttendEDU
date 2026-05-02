import React, {useState, useEffect} from "react";
import {
    Text,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Platform,
    Modal,
    ScrollView,
} from "react-native";
import styles from "./Style";
import BottomBar from "../components/common/NavigationBar";
import CustomTabs from "../components/common/CustomTabs";
import {useNavigation} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useLanguageRefresh} from "../../utils/useLanguageRefresh";
import {useTheme} from "../components/common/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";

// ─────────────────────────────────────────────────────────────────────────────
// DATOS MOCK — reemplaza con tu API
// Campos basados en: attendance + schedule + course + person + classroom +
//                    period + iot_device + justification
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_TEACHERS = [
    {
        id: 1,
        nombre: "Ana Martínez",
        fecha: "2024-03-20", hora: "07:55 AM", estado: "presente",
        materia: "Matemáticas", codigo_curso: "MAT-101",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 201",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 2,
        nombre: "Luis Fernández",
        fecha: "2024-03-20", hora: "08:02 AM", estado: "presente",
        materia: "Ciencias", codigo_curso: "CIE-102",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Lab Ciencias",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 3,
        nombre: "Carmen López",
        fecha: "2024-03-20", hora: "08:30 AM", estado: "tarde",
        materia: "Español", codigo_curso: "ESP-103",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 105",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 4,
        nombre: "Roberto Díaz",
        fecha: "2024-03-20", hora: "—", estado: "ausente",
        materia: "Historia", codigo_curso: "HIS-104",
        dia: "Lunes", hora_inicio: "10:00 AM", hora_fin: "12:00 PM",
        salon: "Aula 302",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 5,
        nombre: "María González",
        fecha: "2024-03-19", hora: "08:10 AM", estado: "presente",
        materia: "Inglés", codigo_curso: "ING-105",
        dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 110",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
    {
        id: 6,
        nombre: "Carlos Ruiz",
        fecha: "2024-03-19", hora: "09:00 AM", estado: "tarde",
        materia: "Educación Física", codigo_curso: "EDF-106",
        dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Cancha Principal",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
    },
];

const MOCK_MY_ATTENDANCE = [
    {
        id: 1,
        fecha: "2024-03-20", hora: "07:58 AM", estado: "presente",
        materia: "Matemáticas", codigo_curso: "MAT-101",
        docente: "Ana Martínez",
        dia: "Lunes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 201",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 2,
        fecha: "2024-03-20", hora: "10:05 AM", estado: "presente",
        materia: "Ciencias", codigo_curso: "CIE-102",
        docente: "Luis Fernández",
        dia: "Lunes", hora_inicio: "10:00 AM", hora_fin: "12:00 PM",
        salon: "Lab Ciencias",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 3,
        fecha: "2024-03-19", hora: "08:40 AM", estado: "tarde",
        materia: "Español", codigo_curso: "ESP-103",
        docente: "Carmen López",
        dia: "Martes", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 105",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 4,
        fecha: "2024-03-19", hora: "—", estado: "ausente",
        materia: "Historia", codigo_curso: "HIS-104",
        docente: "Roberto Díaz",
        dia: "Martes", hora_inicio: "10:00 AM", hora_fin: "12:00 PM",
        salon: "Aula 302",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: {
            texto: "Cita médica urgente",
            estado: "Pending",
            revisado_por: null,
            revisado_en: null,
        },
    },
    {
        id: 5,
        fecha: "2024-03-18", hora: "08:02 AM", estado: "presente",
        materia: "Inglés", codigo_curso: "ING-105",
        docente: "María González",
        dia: "Miércoles", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Aula 110",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: null,
    },
    {
        id: 6,
        fecha: "2024-03-18", hora: "—", estado: "ausente",
        materia: "Educación Física", codigo_curso: "EDF-106",
        docente: "Carlos Ruiz",
        dia: "Miércoles", hora_inicio: "08:00 AM", hora_fin: "10:00 AM",
        salon: "Cancha Principal",
        periodo: "2024-I", periodo_inicio: "2024-01-15", periodo_fin: "2024-06-30",
        justificacion: {
            texto: "Incapacidad médica presentada.",
            estado: "Approved",
            revisado_por: "Admin01",
            revisado_en: "2024-03-19 09:00",
        },
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    presente: {color: "#22C55E", bg: "#DCFCE7", darkBg: "#14532D", label: "attendance.present"},
    tarde: {color: "#F59E0B", bg: "#FEF3C7", darkBg: "#451A03", label: "attendance.late"},
    ausente: {color: "#EF4444", bg: "#FEE2E2", darkBg: "#450A0A", label: "attendance.absent"},
    justificado: {color: "#8B5CF6", bg: "#EDE9FE", darkBg: "#2E1065", label: "attendance.justified"},
};

const APPROVAL_CONFIG = {
    Pending: {color: "#F59E0B", label: "attendance.pending"},
    Approved: {color: "#22C55E", label: "attendance.approved"},
    Rejected: {color: "#EF4444", label: "attendance.rejected"},
};

function StatusBadge({estado, t, isDark}) {
    const cfg = STATUS_CONFIG[estado] ?? STATUS_CONFIG.ausente;
    return (
        <View style={{
            backgroundColor: isDark ? cfg.darkBg : cfg.bg,
            borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
        }}>
            <Text style={{fontSize: 12, fontWeight: "700", color: cfg.color}}>
                {t(cfg.label, {defaultValue: estado})}
            </Text>
        </View>
    );
}

function formatDateKey(date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDateDisplay(date, t) {
    if (!date) return t("attendance.filterByDate", {defaultValue: "Filtrar fecha"});
    return date.toLocaleDateString("es-ES", {day: "2-digit", month: "short", year: "numeric"});
}

// ─────────────────────────────────────────────────────────────────────────────
// FILA DE DETALLE reutilizable en los modales
// ─────────────────────────────────────────────────────────────────────────────

function DetailRow({icon, label, value, colors, valueColor}) {
    if (!value || value === "—") return null;
    return (
        <View style={{
            flexDirection: "row", alignItems: "flex-start",
            paddingVertical: 10,
            borderBottomWidth: 1, borderBottomColor: colors.separator ?? "#F0F0F0",
            gap: 12,
        }}>
            <Text style={{fontSize: 18, width: 26, textAlign: "center"}}>{icon}</Text>
            <View style={{flex: 1}}>
                <Text style={{fontSize: 11, color: colors.textMuted, marginBottom: 2}}>{label}</Text>
                <Text style={{fontSize: 14, fontWeight: "600", color: valueColor ?? colors.text}}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

function SectionLabel({text, colors}) {
    return (
        <Text style={{
            fontSize: 11, fontWeight: "700", color: colors.primary,
            letterSpacing: 0.8, marginTop: 20, marginBottom: 4,
            textTransform: "uppercase",
        }}>
            {text}
        </Text>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DETALLE — ADMIN (docente)
// ─────────────────────────────────────────────────────────────────────────────

function TeacherDetailModal({item, visible, onClose, colors, t, isDark}) {
    if (!item) return null;
    const cfg = STATUS_CONFIG[item.estado] ?? STATUS_CONFIG.ausente;
    const initials = item.nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose}
                              style={{flex: 1, backgroundColor: "rgba(0,0,0,0.5)"}}/>
            <View style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                backgroundColor: colors.background,
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                paddingBottom: Platform.OS === "ios" ? 40 : 24,
                maxHeight: "84%",
            }}>
                {/* Handle */}
                <View style={{
                    width: 40, height: 4, borderRadius: 2,
                    backgroundColor: colors.separator ?? "#E0E0E0",
                    alignSelf: "center", marginTop: 12, marginBottom: 20,
                }}/>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 16}}
                >
                    {/* Cabecera */}
                    <View style={{
                        flexDirection: "row", alignItems: "center",
                        gap: 14, marginBottom: 24,
                    }}>
                        <View style={{
                            width: 58, height: 58, borderRadius: 29,
                            backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                            justifyContent: "center", alignItems: "center",
                            borderWidth: 2, borderColor: cfg.color,
                        }}>
                            <Text style={{fontSize: 20, fontWeight: "700", color: cfg.color}}>
                                {initials}
                            </Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize: 18, fontWeight: "700", color: colors.text}}>
                                {item.nombre}
                            </Text>
                            <Text style={{fontSize: 13, color: colors.textSecondary, marginTop: 2}}>
                                {item.materia} · {item.codigo_curso}
                            </Text>
                        </View>
                        <StatusBadge estado={item.estado} t={t} isDark={isDark}/>
                    </View>

                    {/* Asistencia */}
                    <SectionLabel text={t("attendance.sectionAttendance", {defaultValue: "Registro de asistencia"})}
                                  colors={colors}/>
                    <DetailRow icon="📅" label={t("attendance.date", {defaultValue: "Fecha"})} value={item.fecha}
                               colors={colors}/>
                    <DetailRow icon="⏰" label={t("attendance.time", {defaultValue: "Hora de entrada"})}
                               value={item.hora} colors={colors} valueColor={cfg.color}/>
                    <DetailRow icon="📆" label={t("attendance.day", {defaultValue: "Día de clase"})} value={item.dia}
                               colors={colors}/>
                    <DetailRow icon="🕐" label={t("attendance.schedule", {defaultValue: "Horario"})}
                               value={`${item.hora_inicio} – ${item.hora_fin}`} colors={colors}/>

                    {/* Materia */}
                    <SectionLabel text={t("attendance.sectionCourse", {defaultValue: "Materia"})} colors={colors}/>
                    <DetailRow icon="📚" label={t("attendance.subject", {defaultValue: "Materia"})} value={item.materia}
                               colors={colors}/>
                    <DetailRow icon="🔖" label={t("attendance.courseCode", {defaultValue: "Código de curso"})}
                               value={item.codigo_curso} colors={colors}/>
                    <DetailRow icon="🏫" label={t("attendance.classroom", {defaultValue: "Salón"})} value={item.salon}
                               colors={colors}/>

                    {/* Período */}
                    <SectionLabel text={t("attendance.sectionPeriod", {defaultValue: "Período académico"})}
                                  colors={colors}/>
                    <DetailRow icon="🗓️" label={t("attendance.period", {defaultValue: "Período"})} value={item.periodo}
                               colors={colors}/>
                    <DetailRow icon="▶️" label={t("attendance.periodStart", {defaultValue: "Inicio"})}
                               value={item.periodo_inicio} colors={colors}/>
                    <DetailRow icon="⏹️" label={t("attendance.periodEnd", {defaultValue: "Fin"})}
                               value={item.periodo_fin} colors={colors}/>
                </ScrollView>

                <TouchableOpacity
                    onPress={onClose}
                    style={{
                        marginHorizontal: 24, marginTop: 8,
                        paddingVertical: 14, borderRadius: 14,
                        backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
                        alignItems: "center",
                    }}
                >
                    <Text style={{fontSize: 15, fontWeight: "600", color: colors.textSecondary}}>
                        {t("common.close", {defaultValue: "Cerrar"})}
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DETALLE — ESTUDIANTE (registro propio)
// ─────────────────────────────────────────────────────────────────────────────

function StudentDetailModal({item, visible, onClose, colors, t, isDark}) {
    if (!item) return null;
    const cfg = STATUS_CONFIG[item.estado] ?? STATUS_CONFIG.ausente;
    const justCfg = item.justificacion
        ? (APPROVAL_CONFIG[item.justificacion.estado] ?? APPROVAL_CONFIG.Pending)
        : null;

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose}
                              style={{flex: 1, backgroundColor: "rgba(0,0,0,0.5)"}}/>
            <View style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                backgroundColor: colors.background,
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                paddingBottom: Platform.OS === "ios" ? 40 : 24,
                maxHeight: "88%",
            }}>
                {/* Handle */}
                <View style={{
                    width: 40, height: 4, borderRadius: 2,
                    backgroundColor: colors.separator ?? "#E0E0E0",
                    alignSelf: "center", marginTop: 12, marginBottom: 20,
                }}/>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 16}}
                >
                    {/* Cabecera */}
                    <View style={{
                        backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                        borderRadius: 16, padding: 16,
                        flexDirection: "row", alignItems: "center",
                        gap: 14, marginBottom: 24,
                        borderWidth: 1, borderColor: cfg.color + "55",
                    }}>
                        <Text style={{fontSize: 36}}>📖</Text>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize: 17, fontWeight: "700", color: cfg.color}}>
                                {item.materia}
                            </Text>
                            <Text style={{fontSize: 12, color: cfg.color + "BB", marginTop: 2}}>
                                {item.codigo_curso}
                            </Text>
                        </View>
                        <StatusBadge estado={item.estado} t={t} isDark={isDark}/>
                    </View>

                    {/* Registro */}
                    <SectionLabel text={t("attendance.sectionAttendance", {defaultValue: "Registro de asistencia"})}
                                  colors={colors}/>
                    <DetailRow icon="📅" label={t("attendance.date", {defaultValue: "Fecha"})} value={item.fecha}
                               colors={colors}/>
                    <DetailRow icon="⏰" label={t("attendance.time", {defaultValue: "Hora registrada"})}
                               value={item.hora} colors={colors} valueColor={cfg.color}/>

                    {/* Clase */}
                    <SectionLabel text={t("attendance.sectionClass", {defaultValue: "Información de la clase"})}
                                  colors={colors}/>
                    <DetailRow icon="👨‍🏫" label={t("attendance.teacher", {defaultValue: "Docente"})}
                               value={item.docente} colors={colors}/>
                    <DetailRow icon="🏫" label={t("attendance.classroom", {defaultValue: "Salón"})} value={item.salon}
                               colors={colors}/>
                    <DetailRow icon="📆" label={t("attendance.day", {defaultValue: "Día"})} value={item.dia}
                               colors={colors}/>
                    <DetailRow icon="🕐" label={t("attendance.schedule", {defaultValue: "Horario"})}
                               value={`${item.hora_inicio} – ${item.hora_fin}`} colors={colors}/>

                    {/* Período */}
                    <SectionLabel text={t("attendance.sectionPeriod", {defaultValue: "Período académico"})}
                                  colors={colors}/>
                    <DetailRow icon="🗓️" label={t("attendance.period", {defaultValue: "Período"})} value={item.periodo}
                               colors={colors}/>
                    <DetailRow icon="▶️" label={t("attendance.periodStart", {defaultValue: "Inicio"})}
                               value={item.periodo_inicio} colors={colors}/>
                    <DetailRow icon="⏹️" label={t("attendance.periodEnd", {defaultValue: "Fin"})}
                               value={item.periodo_fin} colors={colors}/>

                    {/* Justificación */}
                    {item.justificacion && (
                        <>
                            <SectionLabel text={t("attendance.sectionJustification", {defaultValue: "Justificación"})}
                                          colors={colors}/>

                            {/* Badge de aprobación */}
                            <View style={{
                                flexDirection: "row", alignItems: "center", gap: 10,
                                paddingVertical: 10,
                                borderBottomWidth: 1, borderBottomColor: colors.separator ?? "#F0F0F0",
                            }}>
                                <Text style={{fontSize: 18, width: 26, textAlign: "center"}}>📋</Text>
                                <View style={{flex: 1}}>
                                    <Text style={{fontSize: 11, color: colors.textMuted, marginBottom: 6}}>
                                        {t("attendance.approvalStatus", {defaultValue: "Estado de aprobación"})}
                                    </Text>
                                    <View style={{
                                        alignSelf: "flex-start",
                                        backgroundColor: justCfg.color + "22",
                                        borderRadius: 20,
                                        paddingHorizontal: 12, paddingVertical: 4,
                                        borderWidth: 1, borderColor: justCfg.color + "55",
                                    }}>
                                        <Text style={{fontSize: 13, fontWeight: "700", color: justCfg.color}}>
                                            {t(justCfg.label, {defaultValue: item.justificacion.estado})}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <DetailRow icon="📝" label={t("attendance.justificationText", {defaultValue: "Descripción"})}
                                       value={item.justificacion.texto} colors={colors}/>
                            <DetailRow icon="👤" label={t("attendance.reviewedBy", {defaultValue: "Revisado por"})}
                                       value={item.justificacion.revisado_por} colors={colors}/>
                            <DetailRow icon="🕓" label={t("attendance.reviewedAt", {defaultValue: "Fecha revisión"})}
                                       value={item.justificacion.revisado_en} colors={colors}/>
                        </>
                    )}

                    {/* Sin justificación + ausente → aviso */}
                    {!item.justificacion && item.estado === "ausente" && (
                        <View style={{
                            marginTop: 20,
                            backgroundColor: isDark ? "#451A03" : "#FEF3C7",
                            borderRadius: 12, padding: 14,
                            borderWidth: 1, borderColor: "#F59E0B55",
                        }}>
                            <Text style={{fontSize: 13, fontWeight: "600", color: "#F59E0B", marginBottom: 4}}>
                                ⚠️ {t("attendance.noJustification", {defaultValue: "Sin justificación registrada"})}
                            </Text>
                            <Text style={{fontSize: 12, color: isDark ? "#FDE68A" : "#92400E"}}>
                                {t("attendance.noJustificationHint", {defaultValue: "Puedes agregar una desde el menú de justificaciones."})}
                            </Text>
                        </View>
                    )}
                </ScrollView>

                <TouchableOpacity
                    onPress={onClose}
                    style={{
                        marginHorizontal: 24, marginTop: 8,
                        paddingVertical: 14, borderRadius: 14,
                        backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
                        alignItems: "center",
                    }}
                >
                    <Text style={{fontSize: 15, fontWeight: "600", color: colors.textSecondary}}>
                        {t("common.close", {defaultValue: "Cerrar"})}
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA ADMIN
// ─────────────────────────────────────────────────────────────────────────────

function TeacherCard({item, colors, t, isDark, onInfo}) {
    const initials = item.nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const cfg = STATUS_CONFIG[item.estado] ?? STATUS_CONFIG.ausente;

    return (
        <View style={{
            backgroundColor: colors.card,
            borderRadius: 14, marginHorizontal: 20, marginBottom: 10, padding: 14,
            flexDirection: "row", alignItems: "center", gap: 12,
            borderWidth: 1, borderColor: colors.separator ?? "#F0F0F0",
            borderLeftWidth: 4, borderLeftColor: cfg.color,
        }}>
            <View style={{
                width: 46, height: 46, borderRadius: 23,
                backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                justifyContent: "center", alignItems: "center",
            }}>
                <Text style={{fontSize: 15, fontWeight: "700", color: cfg.color}}>{initials}</Text>
            </View>

            <View style={{flex: 1}}>
                <Text style={{fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 2}}>
                    {item.nombre}
                </Text>
                <Text style={{fontSize: 12, color: colors.textSecondary}}>
                    {item.materia} · <Text style={{color: colors.textMuted}}>{item.codigo_curso}</Text>
                </Text>
                <Text style={{fontSize: 11, color: colors.textMuted, marginTop: 2}}>
                    {item.fecha} · {item.estado !== "ausente" ? item.hora : "—"}
                </Text>
            </View>

            {/* LUPA CLICKEABLE PARA ABRIR MODAL */}
            <TouchableOpacity
                onPress={() => onInfo(item)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Image
                    source={require("../../assets/images/lupa.png")}
                    style={{width: 18, height: 18, tintColor: cfg.color}}
                />
            </TouchableOpacity>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA ESTUDIANTE
// ─────────────────────────────────────────────────────────────────────────────

function MyAttendanceCard({item, colors, t, isDark, onInfo}) {
    const cfg = STATUS_CONFIG[item.estado] ?? STATUS_CONFIG.ausente;
    const hasJustification = !!item.justificacion;

    return (
        <View style={{
            backgroundColor: colors.card,
            borderRadius: 14, marginHorizontal: 20, marginBottom: 10, padding: 14,
            borderWidth: 1, borderColor: colors.separator ?? "#F0F0F0",
        }}>
            <View
                style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10}}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <Text style={{fontSize: 13, fontWeight: "700", color: colors.primary}}>{item.fecha}</Text>
                    {item.estado !== "ausente" && (
                        <Text style={{fontSize: 12, color: colors.textSecondary}}>· {item.hora}</Text>
                    )}
                </View>

                {/* LUPA CLICKEABLE PARA ABRIR MODAL */}
                <TouchableOpacity
                    onPress={() => onInfo(item)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Image
                        source={require("../../assets/images/lupa2.png")}
                        style={{ width: 18, height: 18, tintColor: cfg.color }}
                    />
                </TouchableOpacity>
            </View>

            <View style={{
                flexDirection: "row", gap: 8,
                paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.separator ?? "#F0F0F0",
            }}>
                <View style={{flex: 1}}>
                    <Text style={{fontSize: 11, color: colors.textMuted, marginBottom: 2}}>
                        {t("attendance.subject", {defaultValue: "Materia"})}
                    </Text>
                    <Text style={{fontSize: 14, fontWeight: "600", color: colors.text}}>{item.materia}</Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={{fontSize: 11, color: colors.textMuted, marginBottom: 2}}>
                        {t("attendance.teacher", {defaultValue: "Docente"})}
                    </Text>
                    <Text style={{fontSize: 14, color: colors.text}}>{item.docente}</Text>
                </View>
                {hasJustification && (
                    <View style={{
                        alignSelf: "flex-end",
                        backgroundColor: isDark ? "#2E1065" : "#EDE9FE",
                        borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                        <Text style={{fontSize: 11, fontWeight: "700", color: "#8B5CF6"}}>
                            📋 {t("attendance.justified", {defaultValue: "Justificado"})}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function DisplayingAttendance() {
    const {t, i18n} = useTranslation();
    const {colors, loadThemeForRole, theme} = useTheme();
    const refreshKey = useLanguageRefresh();
    const isDark = theme === "dark";

    const [userRole, setUserRole] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [updateKey, setUpdateKey] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [detailItem, setDetailItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem("userRole");
            setUserRole(role);
            await loadThemeForRole(role);
        };
        init();
        const onLangChange = () => setUpdateKey(p => p + 1);
        i18n.on("languageChanged", onLangChange);
        return () => i18n.off("languageChanged", onLangChange);
    }, []);

    const isAdmin = userRole === "admin";

    const openDetail = (item) => {
        setDetailItem(item);
        setShowDetailModal(true);
    };
    const closeDetail = () => {
        setShowDetailModal(false);
        setDetailItem(null);
    };

    const filteredTeachers = MOCK_TEACHERS.filter(item =>
        (!searchText || item.nombre.toLowerCase().includes(searchText.toLowerCase())) &&
        (!selectedDate || item.fecha === formatDateKey(selectedDate))
    );

    const filteredMyAttendance = MOCK_MY_ATTENDANCE.filter(item =>
        (!selectedDate || item.fecha === formatDateKey(selectedDate))
    );

    const activeData = isAdmin ? filteredTeachers : filteredMyAttendance;

    const handleOpenPicker = () => {
        setTempDate(selectedDate ?? new Date());
        Platform.OS === "ios" ? setShowIOSModal(true) : setShowPicker(true);
    };
    const handleAndroidChange = (event, date) => {
        setShowPicker(false);
        if (event.type === "set" && date) setSelectedDate(date);
    };

    return (
        <SafeAreaView
            style={[styles.safeArea, {backgroundColor: colors.background}]}
            key={`${refreshKey}-${updateKey}`}
        >
            <View style={{
                flex: 1,
                backgroundColor: colors.background,
                marginTop: Platform.OS === "ios" ? 15 : 10
            }}>

                <CustomTabs userRole={userRole}/>

                {/* Búsqueda + fecha */}
                <View style={{flexDirection: "row", gap: 8, marginBottom: 10, marginHorizontal: 20, marginTop: 20}}>
                    {isAdmin && (
                        <View style={{
                            flex: 2,
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: colors.inputBackground,
                            borderWidth: 1.5,
                            borderColor: searchText ? colors.primary : (colors.separator ?? "#E0E0E0"),
                            borderRadius: 10,
                            paddingHorizontal: 12,
                        }}>
                            <TextInput
                                style={{flex: 1, paddingVertical: 10, color: colors.text, fontSize: 14}}
                                placeholder={t("attendance.searchByName", {defaultValue: "Buscar docente..."})}
                                placeholderTextColor={colors.textMuted}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {searchText ? (
                                <TouchableOpacity onPress={() => setSearchText("")}>
                                    <Text style={{color: colors.danger, fontSize: 16, fontWeight: "700"}}>✕</Text>
                                </TouchableOpacity>
                            ) : (
                                <Image source={require("../../assets/images/lupa2.png")}
                                       style={{width: 16, height: 16, tintColor: colors.textMuted}}/>
                            )}
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleOpenPicker}
                        style={{
                            flex: isAdmin ? 1.2 : 1,
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: colors.inputBackground,
                            borderWidth: 1.5,
                            borderColor: selectedDate ? colors.primary : (colors.separator ?? "#E0E0E0"),
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            gap: 6,
                        }}
                    >
                        <Text style={{fontSize: 15}}>📅</Text>
                        <Text style={{flex: 1, color: selectedDate ? colors.text : colors.textMuted, fontSize: 13}}
                              numberOfLines={1}>
                            {formatDateDisplay(selectedDate, t)}
                        </Text>
                        {selectedDate && (
                            <TouchableOpacity onPress={() => setSelectedDate(null)}
                                              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                                <Text style={{color: colors.danger, fontSize: 16, fontWeight: "700"}}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {/* DateTimePicker Android */}
                {showPicker && Platform.OS === "android" && (
                    <DateTimePicker value={tempDate} mode="date" display="default" onChange={handleAndroidChange}
                                    maximumDate={new Date()}/>
                )}

                {/* DateTimePicker iOS */}
                <Modal transparent visible={showIOSModal} animationType="slide"
                       onRequestClose={() => setShowIOSModal(false)}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setShowIOSModal(false)}
                                      style={{flex: 1, backgroundColor: "rgba(0,0,0,0.45)"}}/>
                    <View style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
                        padding: 16, paddingBottom: 34,
                    }}>
                        <View style={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: colors.separator ?? "#E0E0E0",
                            alignSelf: "center",
                            marginBottom: 14
                        }}/>
                        <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 8}}>
                            <TouchableOpacity onPress={() => setShowIOSModal(false)}>
                                <Text style={{
                                    color: colors.danger,
                                    fontSize: 16,
                                    fontWeight: "600"
                                }}>{t("common.cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setSelectedDate(tempDate);
                                setShowIOSModal(false);
                            }}>
                                <Text style={{
                                    color: colors.primary,
                                    fontSize: 16,
                                    fontWeight: "600"
                                }}>{t("common.accept")}</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={tempDate} mode="date" display="spinner"
                            onChange={(_, date) => date && setTempDate(date)}
                            maximumDate={new Date()}
                            style={{backgroundColor: colors.card}} textColor={colors.text}
                        />
                    </View>
                </Modal>

                {/* Lista */}
                <FlatList
                    data={activeData}
                    keyExtractor={item => item.id.toString()}
                    style={{flex: 1}}
                    contentContainerStyle={{paddingTop: 4, paddingBottom: 20}}
                    renderItem={({item}) =>
                        isAdmin
                            ? <TeacherCard item={item} colors={colors} t={t} isDark={isDark} onInfo={openDetail}/>
                            : <MyAttendanceCard item={item} colors={colors} t={t} isDark={isDark} onInfo={openDetail}/>
                    }
                    ListEmptyComponent={
                        <View style={{alignItems: "center", paddingVertical: 50}}>
                            <Text style={{fontSize: 40, marginBottom: 12}}>🔍</Text>
                            <Text style={{color: colors.textMuted, fontSize: 14, textAlign: "center"}}>
                                {t("attendance.noResults", {defaultValue: "Sin resultados para los filtros aplicados"})}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={<View style={{paddingBottom: Platform.OS === "ios" ? 50 : 70}}/>}
                />
            </View>

            <BottomBar/>

            {/* Modales de detalle */}
            {isAdmin ? (
                <TeacherDetailModal
                    item={detailItem} visible={showDetailModal} onClose={closeDetail}
                    colors={colors} t={t} isDark={isDark}
                />
            ) : (
                <StudentDetailModal
                    item={detailItem} visible={showDetailModal} onClose={closeDetail}
                    colors={colors} t={t} isDark={isDark}
                />
            )}
        </SafeAreaView>
    );
}