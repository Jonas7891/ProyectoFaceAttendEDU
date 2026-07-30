// ============================================================
//  FaceAttend EDU — Students Components (View Layer)
//  Toda lógica (filtrado, selección, registro, importación)
//  en useStudentsViewModel.
// ============================================================

import React, { useState, useRef, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, ActivityIndicator, Animated, Easing } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, Avatar, PageHeader, UIButton, ProgressBar, EmptyState } from "../ui/UI";
import { useTheme }               from "../hooks/useTheme";
import { useResponsive }          from "../hooks/useResponsive";
import { useStudentsViewModel }   from "../../../viewmodels/useStudentsViewModel";
import { useTranslation }         from "../../../i18n/hooks/useTranslation";
import RegisterStudentModal       from "./RegisterStudentModal";
import ImportStudentsModal        from "./ImportStudentsModal";
import type { Student }           from "../../../models/types";

// ── CourseFilterSelector ─────────────────────────────────────
// Dropdown estilo RoleSelector: flota sobre todo el contenido
// usando un Modal transparente secundario.

function CourseFilterSelector({
    courses,
    value,
    onChange,
}: {
    courses:  string[];
    value:    string;
    onChange: (v: string) => void;
}) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c         = theme.colors;

    const [open,        setOpen]        = useState(false);
    const [triggerRect, setTriggerRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const triggerRef   = useRef<View>(null);
    const dropdownAnim = useRef(new Animated.Value(0)).current;

    const TRIGGER_H = 38;
    const ITEM_H    = 40;
    const ALL_ITEMS = ["", ...courses];   // "" = Todos
    const MAX_VISIBLE = 6;
    const PANEL_H   = Math.min(ALL_ITEMS.length, MAX_VISIBLE) * ITEM_H;

    const animateOpen = useCallback(() => {
        triggerRef.current?.measureInWindow((x, y, width, height) => {
            setTriggerRect({ x, y, width, height });
            setOpen(true);
            Animated.timing(dropdownAnim, {
                toValue: 1, duration: 170,
                easing: Easing.out(Easing.quad), useNativeDriver: false,
            }).start();
        });
    }, [dropdownAnim]);

    const animateClose = useCallback(() => {
        Animated.timing(dropdownAnim, {
            toValue: 0, duration: 130,
            easing: Easing.in(Easing.quad), useNativeDriver: false,
        }).start(() => setOpen(false));
    }, [dropdownAnim]);

    const handleToggle = useCallback(() => {
        open ? animateClose() : animateOpen();
    }, [open, animateOpen, animateClose]);

    const handleSelect = useCallback((v: string) => {
        onChange(v);
        animateClose();
    }, [onChange, animateClose]);

    const panelHeight = dropdownAnim.interpolate({
        inputRange: [0, 1], outputRange: [0, PANEL_H],
    });
    const panelOpacity = dropdownAnim.interpolate({
        inputRange: [0, 0.4, 1], outputRange: [0, 1, 1],
    });

    const label = value ? value : t("Todos");

    return (
        <View style={{ position: "relative" }}>
            

            {/* Trigger */}
            <View ref={triggerRef} collapsable={false}>
                <TouchableOpacity
                    onPress={handleToggle}
                    activeOpacity={0.8}
                    style={{
                        height: TRIGGER_H,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingHorizontal: 12,
                        borderRadius: 6,
                        borderWidth: open ? 2 : 1,
                        borderColor: open ? c.brand.primary : c.border.primary,
                        backgroundColor: open ? c.brand.primaryLight : c.background.surface,
                        borderBottomLeftRadius:  open ? 0 : 6,
                        borderBottomRightRadius: open ? 0 : 6,
                        minWidth: 160,
                    }}
                >
                    <Feather
                        name="book-open"
                        size={13}
                        color={open ? c.brand.primary : c.text.secondary}
                    />
                    <Text style={{
                        flex: 1, fontSize: 13, fontWeight: "600",
                        color: open ? c.brand.primary : (value ? c.text.primary : c.text.secondary),
                    }} numberOfLines={1}>
                        {label}
                    </Text>
                    <Animated.View style={{
                        transform: [{
                            rotate: dropdownAnim.interpolate({
                                inputRange: [0, 1], outputRange: ["0deg", "180deg"],
                            }),
                        }],
                    }}>
                        <Feather
                            name="chevron-down"
                            size={13}
                            color={open ? c.brand.primary : c.text.secondary}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Dropdown flotante en Modal transparente */}
            {open && triggerRect && (
                <Modal
                    transparent
                    animationType="none"
                    visible={open}
                    onRequestClose={animateClose}
                    statusBarTranslucent
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={animateClose}
                    >
                        <Animated.View
                            pointerEvents="box-none"
                            style={{
                                position: "absolute",
                                top:   triggerRect.y + triggerRect.height,
                                left:  triggerRect.x,
                                width: triggerRect.width,
                                height:  panelHeight,
                                opacity: panelOpacity,
                                overflow: "hidden",
                                borderWidth: 2,
                                borderTopWidth: 0,
                                borderColor: c.brand.primary,
                                borderBottomLeftRadius: 6,
                                borderBottomRightRadius: 6,
                                backgroundColor: c.background.surface,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.18,
                                shadowRadius: 10,
                                elevation: 20,
                                zIndex: 9999,
                            }}
                        >
                            <TouchableOpacity activeOpacity={1}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    style={{ maxHeight: PANEL_H }}
                                >
                                    {ALL_ITEMS.map((course, i) => {
                                        const active = value === course;
                                        const isLast = i === ALL_ITEMS.length - 1;
                                        return (
                                            <TouchableOpacity
                                                key={course || "__all__"}
                                                onPress={() => handleSelect(course)}
                                                activeOpacity={0.7}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    paddingHorizontal: 12,
                                                    height: ITEM_H,
                                                    backgroundColor: active
                                                        ? c.brand.primaryLight : "transparent",
                                                    borderBottomWidth: isLast ? 0 : 1,
                                                    borderBottomColor: c.border.primary,
                                                }}
                                            >
                                                <Feather
                                                    name={course ? "book-open" : "layers"}
                                                    size={12}
                                                    color={active ? c.brand.primary : c.text.secondary}
                                                />
                                                <Text style={{
                                                    flex: 1, fontSize: 13,
                                                    fontWeight: active ? "600" : "400",
                                                    color: active ? c.brand.primary : c.text.primary,
                                                }} numberOfLines={1}>
                                                    {course || t("Todos")}
                                                </Text>
                                                {active && (
                                                    <Feather name="check" size={13} color={c.brand.primary} />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
}

// ── StudentDetailModal ───────────────────────────────────────

function StudentDetailModal({ student, onClose }: { student: Student | null; onClose: () => void }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    if (!student) return null;

    const attendanceColor = student.attendance >= 80 ? c.states.success : c.states.danger;

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={{
                    flex: 1, backgroundColor: c.background.overlay,
                    justifyContent: "center", alignItems: "center", padding: 24,
                }}
                onPress={onClose} activeOpacity={1}
            >
                <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                    <View style={{
                        backgroundColor: c.background.surface,
                        borderRadius: 12, width: 420, maxHeight: 600, overflow: "hidden",
                        shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
                    }}>
                        {/* Header */}
                        <View style={{
                            padding: 20, borderBottomWidth: 1, borderBottomColor: c.border.primary,
                            flexDirection: "row", alignItems: "center", gap: 14,
                        }}>
                            <Avatar name={student.name} size={52} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: "700", color: c.text.primary }}>
                                    {student.name}
                                </Text>
                                <Text style={{ fontSize: 12, color: c.text.secondary, marginTop: 2 }}>
                                    {student.code}
                                </Text>
                                <View style={{ marginTop: 6 }}>
                                    <Badge variant={student.status === "active" ? "success" : "default"}>
                                        {student.status === "active" ? t("Activo") : t("Inactivo")}
                                    </Badge>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <Feather name="x" size={18} color={c.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Body */}
                        <ScrollView style={{ padding: 20 }}>
                            <View style={{ gap: 12, marginBottom: 16 }}>
                                {[
                                    { label: t("Correo"),   value: student.email,  icon: "mail"        },
                                    { label: t("Programa"), value: student.course, icon: "book-open"   },
                                    { label: t("Semestre"), value: student.grade,  icon: "trending-up" },
                                ].map(({ label, value, icon }) => (
                                    <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <Feather name={icon as any} size={14} color={c.text.secondary} />
                                        <Text style={{ fontSize: 12, color: c.text.secondary, width: 72 }}>{label}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: "500", color: c.text.primary, flex: 1 }}>
                                            {value}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{
                                backgroundColor: c.background.app, borderRadius: 8,
                                padding: 16, marginBottom: 12,
                            }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>
                                        {t("Asistencia")}
                                    </Text>
                                    <Text style={{ fontSize: 18, fontWeight: "800", color: attendanceColor }}>
                                        {student.attendance}%
                                    </Text>
                                </View>
                                <ProgressBar value={student.attendance} color={attendanceColor} height={8} />
                                <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 8 }}>
                                    {student.attendance >= 80
                                        ? t("Cumple el mínimo requerido (80%)")
                                        : t("⚠ Por debajo del mínimo requerido (80%)")}
                                </Text>
                            </View>

                            <View style={{
                                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                                padding: 12, borderWidth: 1, borderColor: c.border.primary,
                                borderRadius: 8, marginBottom: 4,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                    <Feather name="aperture" size={18} color={c.brand.primary} />
                                    <View>
                                        <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary }}>
                                            {t("Reconocimiento facial")}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                            {student.registered ? t("Rostro registrado") : t("Sin registro facial")}
                                        </Text>
                                    </View>
                                </View>
                                {student.registered
                                    ? <Feather name="check-circle" size={16} color={c.states.success} />
                                    : <UIButton variant="primary" size="sm">{t("Registrar")}</UIButton>
                                }
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={{
                            padding: 16, borderTopWidth: 1, borderTopColor: c.border.primary,
                            flexDirection: "row", gap: 8, justifyContent: "flex-end",
                        }}>
                            <UIButton variant="ghost" onPress={onClose}>{t("Cerrar")}</UIButton>
                            <UIButton variant="primary">{t("Editar estudiante")}</UIButton>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

// ── StudentRow ───────────────────────────────────────────────

function StudentRow({ student, onPress, isLast }: {
    student: Student; onPress: () => void; isLast: boolean;
}) {
    const { t }       = useTranslation();
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const attColor    = student.attendance >= 80 ? c.states.success : c.states.danger;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: "row", alignItems: "center",
                paddingVertical: 12, paddingHorizontal: 14,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: c.border.primary,
                gap: isSmall ? 12 : 0,
            }}
        >
            <View style={{ flex: isSmall ? 1 : 2, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Avatar name={student.name} size={32} />
                <View>
                    <Text style={{ fontWeight: "600", fontSize: 13, color: c.text.primary }}>
                        {student.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.secondary }}>{student.code}</Text>
                </View>
            </View>

            {!isSmall && (
                <>
                    <Text style={{ flex: 1, fontSize: 12, color: c.text.secondary, paddingHorizontal: 14 }} numberOfLines={1}>
                        {student.email}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 12, color: c.text.primary, paddingHorizontal: 14 }} numberOfLines={1}>
                        {student.course}
                    </Text>
                    <View style={{ flex: 1, paddingHorizontal: 14 }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: attColor, marginBottom: 4 }}>
                            {student.attendance}%
                        </Text>
                        <ProgressBar value={student.attendance} color={attColor} height={4} />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 14 }}>
                        <Badge variant={student.registered ? "success" : "warning"}>
                            {student.registered ? t("Registrado") : t("Pendiente")}
                        </Badge>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 14 }}>
                        <Badge variant={student.status === "active" ? "success" : "default"}>
                            {student.status === "active" ? t("Activo") : t("Inactivo")}
                        </Badge>
                    </View>
                </>
            )}

            {isSmall && (
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: attColor }}>
                        {student.attendance}%
                    </Text>
                    <Badge variant={student.registered ? "success" : "warning"}>
                        {student.registered ? t("Facial OK") : t("Pendiente")}
                    </Badge>
                </View>
            )}
        </TouchableOpacity>
    );
}

// ── StudentsView ─────────────────────────────────────────────

export default function StudentsView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useStudentsViewModel();
    const { t }       = useTranslation();

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <PageHeader
                    title={t("Estudiantes")}
                    subtitle={`${vm.filtered.length} ${vm.filtered.length !== 1 ? t("estudiantes") : t("estudiante")} ${vm.filtered.length !== 1 ? t("encontrados") : t("encontrado")}`}
                    actions={<>
                        <UIButton
                            variant="ghost"
                            size="sm"
                            onPress={vm.openImportModal}
                        >
                            <Feather name="upload" size={13} color={c.text.secondary} />
                            {"  "}{t("Importar")}
                        </UIButton>
                        <UIButton
                            variant="primary"
                            size="sm"
                            onPress={vm.openRegisterModal}
                        >
                            + {t("Nuevo estudiante")}
                        </UIButton>
                    </>}
                />

                {/* Filtros */}
                <Card padding={14}>
                    <View style={{ flexDirection: isSmall ? "column" : "row", gap: 10, flexWrap: "wrap" }}>
                        <View style={{ flex: 1, minWidth: 200, position: "relative", justifyContent: "center" }}>
                            <View style={{ position: "absolute", left: 10, zIndex: 1 }}>
                                <Feather name="search" size={14} color={c.text.secondary} />
                            </View>
                            <TextInput
                                placeholder={t("Buscar por nombre o código...")}
                                value={vm.search}
                                onChangeText={vm.setSearch}
                                style={{
                                    height: 38, borderWidth: 1, borderColor: c.border.primary,
                                    borderRadius: 6, paddingLeft: 32, paddingRight: 12,
                                    fontSize: 13, backgroundColor: c.background.surface, color: c.text.primary,
                                }}
                                placeholderTextColor={c.text.disabled}
                            />
                        </View>

                        <CourseFilterSelector
                                courses={vm.courses}
                                value={vm.courseFilter}
                                onChange={vm.setCourseFilter}
                            />
                    </View>
                </Card>

                {/* Lista */}
                <Card padding={0}>
                    {!isSmall && (
                        <View style={{
                            flexDirection: "row", padding: "10px 14px" as any,
                            borderBottomWidth: 1, borderBottomColor: c.border.primary,
                        }}>
                            {[t("Estudiante"), t("Correo"), t("Programa"), t("Asistencia"), t("Facial"), t("Estado")].map(col => (
                                <Text key={col} style={{
                                    flex: col === t("Estudiante") ? 2 : 1,
                                    fontSize: 11, fontWeight: "600", color: c.text.secondary,
                                    textTransform: "uppercase", letterSpacing: 0.5,
                                    paddingHorizontal: 14,
                                }}>
                                    {col}
                                </Text>
                            ))}
                        </View>
                    )}

                    {vm.filtered.length === 0 ? (
                        <EmptyState
                            icon={<Feather name="users" size={40} color={c.text.secondary} />}
                            title={t("Sin resultados")}
                            description={t("Ajusta los filtros o agrega nuevos estudiantes")}
                        />
                    ) : vm.filtered.map((student, i) => (
                        <StudentRow
                            key={student.id}
                            student={student}
                            onPress={() => vm.selectStudent(student)}
                            isLast={i === vm.filtered.length - 1}
                        />
                    ))}
                </Card>
            </ScrollView>

            {/* Modales */}
            <StudentDetailModal student={vm.selected} onClose={vm.clearSelection} />

            <RegisterStudentModal
                visible={vm.showRegisterModal}
                onClose={vm.closeRegisterModal}
                onSubmit={vm.registerStudent}
            />

            <ImportStudentsModal
                visible={vm.showImportModal}
                onClose={vm.closeImportModal}
                onImport={vm.importStudents}
            />
        </View>
    );
}
