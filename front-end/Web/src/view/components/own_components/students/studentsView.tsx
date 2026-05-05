// ============================================================
//  FaceAttend EDU — Students View (React Native)
//  Layout tabla/lista con modal de detalle — sin emojis
// ============================================================
import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, Avatar, PageHeader, UIButton, ProgressBar, EmptyState } from "../ui/UI";
import Colors from "../../constants/colors";
import { mockStudents } from "../../constants/mockData";
import { useResponsive } from "../../hooks/useResponsive";

type Student = typeof mockStudents[0];

// ── Modal detalle estudiante ─────────────────────────────────
function StudentModal({ student, onClose }: { student: Student | null; onClose: () => void }) {
    if (!student) return null;
    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 24 }}
                onPress={onClose} activeOpacity={1}
            >
                <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                    <View style={{
                        backgroundColor: Colors.surface, borderRadius: 12, width: 420,
                        maxHeight: 600, overflow: "hidden",
                        shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
                    }}>
                        {/* Header */}
                        <View style={{
                            padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border,
                            flexDirection: "row", alignItems: "center", gap: 14,
                        }}>
                            <Avatar name={student.name} size={52} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text }}>{student.name}</Text>
                                <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 2 }}>{student.code}</Text>
                                <View style={{ marginTop: 6 }}>
                                    <Badge variant={student.status === "active" ? "success" : "default"}>
                                        {student.status === "active" ? "Activo" : "Inactivo"}
                                    </Badge>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <Feather name="x" size={18} color={Colors.muted} />
                            </TouchableOpacity>
                        </View>

                        {/* Body */}
                        <ScrollView style={{ padding: 20 }}>
                            <View style={{ gap: 12, marginBottom: 16 }}>
                                {[
                                    { label: "Correo",   value: student.email,  icon: "mail"       },
                                    { label: "Programa", value: student.course,  icon: "book-open"  },
                                    { label: "Semestre", value: student.grade,   icon: "trending-up"},
                                ].map(({ label, value, icon }) => (
                                    <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <Feather name={icon as any} size={14} color={Colors.muted} />
                                        <Text style={{ fontSize: 12, color: Colors.muted, width: 72 }}>{label}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.text, flex: 1 }}>{value}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Asistencia */}
                            <View style={{ backgroundColor: Colors.bg, borderRadius: 8, padding: 16, marginBottom: 12 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.text }}>Asistencia</Text>
                                    <Text style={{ fontSize: 18, fontWeight: "800", color: student.attendance >= 80 ? "#10B981" : "#EF4444" }}>
                                        {student.attendance}%
                                    </Text>
                                </View>
                                <ProgressBar value={student.attendance} color={student.attendance >= 80 ? "#10B981" : "#EF4444"} height={8} />
                                <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 8 }}>
                                    {student.attendance >= 80 ? "Cumple el mínimo requerido (80%)" : "⚠ Por debajo del mínimo requerido (80%)"}
                                </Text>
                            </View>

                            {/* Registro facial */}
                            <View style={{
                                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                                padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 4,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                    <Feather name="aperture" size={18} color={Colors.primary} />
                                    <View>
                                        <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.text }}>Reconocimiento facial</Text>
                                        <Text style={{ fontSize: 11, color: Colors.muted }}>
                                            {student.registered ? "Rostro registrado" : "Sin registro facial"}
                                        </Text>
                                    </View>
                                </View>
                                {student.registered
                                    ? <Feather name="check-circle" size={16} color="#10B981" />
                                    : <UIButton variant="primary" size="sm">Registrar</UIButton>
                                }
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                            <UIButton variant="ghost" onPress={onClose}>Cerrar</UIButton>
                            <UIButton variant="primary">Editar estudiante</UIButton>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

// ── MAIN ────────────────────────────────────────────────────
export default function StudentsView() {
    const { isSmall } = useResponsive();
    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [selected, setSelected] = useState<Student | null>(null);

    const courses = [...new Set(mockStudents.map(s => s.course))];

    const filtered = useMemo(() =>
            mockStudents.filter(s => {
                const m = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.includes(search);
                const c = !courseFilter || s.course === courseFilter;
                return m && c;
            }),
        [search, courseFilter]);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }} showsVerticalScrollIndicator={false}>
                <PageHeader
                    title="Estudiantes"
                    subtitle={`${filtered.length} estudiante${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
                    actions={<>
                        <UIButton variant="ghost" size="sm">Exportar</UIButton>
                        <UIButton variant="primary" size="sm">+ Nuevo estudiante</UIButton>
                    </>}
                />

                {/* Filtros */}
                <Card padding={14}>
                    <View style={{ flexDirection: isSmall ? "column" : "row", gap: 10, flexWrap: "wrap" }}>
                        {/* Search input */}
                        <View style={{ flex: 1, minWidth: 200, position: "relative", justifyContent: "center" }}>
                            <View style={{ position: "absolute", left: 10, zIndex: 1 }}>
                                <Feather name="search" size={14} color={Colors.muted} />
                            </View>
                            <TextInput
                                placeholder="Buscar por nombre o código..."
                                value={search}
                                onChangeText={setSearch}
                                style={{
                                    height: 38, borderWidth: 1, borderColor: Colors.border,
                                    borderRadius: 6, paddingLeft: 32, paddingRight: 12,
                                    fontSize: 13, backgroundColor: Colors.surface, color: Colors.text,
                                }}
                                placeholderTextColor={Colors.muted}
                            />
                        </View>

                        {/* Filtro de curso */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                {["", ...courses].map(c => (
                                    <TouchableOpacity
                                        key={c || "all"}
                                        onPress={() => setCourseFilter(c)}
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 6,
                                            borderRadius: 99,
                                            backgroundColor: courseFilter === c ? Colors.primary : Colors.border,
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 12, fontWeight: "600",
                                            color: courseFilter === c ? "#fff" : Colors.muted,
                                        }}>
                                            {c || "Todos"}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </Card>

                {/* Lista */}
                <Card padding={0}>
                    {/* Cabecera de tabla (solo desktop) */}
                    {!isSmall && (
                        <View style={{
                            flexDirection: "row", padding: "10px 14px" as any,
                            borderBottomWidth: 1, borderBottomColor: Colors.border,
                        }}>
                            {["Estudiante", "Correo", "Programa", "Asistencia", "Facial", "Estado"].map(col => (
                                <Text key={col} style={{
                                    flex: col === "Estudiante" ? 2 : 1,
                                    fontSize: 11, fontWeight: "600", color: Colors.muted,
                                    textTransform: "uppercase", letterSpacing: 0.5,
                                    paddingHorizontal: 14,
                                }}>
                                    {col}
                                </Text>
                            ))}
                        </View>
                    )}

                    {filtered.length === 0
                        ? <EmptyState
                            icon={<Feather name="users" size={40} color={Colors.muted} />}
                            title="Sin resultados"
                            description="Ajusta los filtros o agrega nuevos estudiantes"
                        />
                        : filtered.map((student, i) => (
                            <TouchableOpacity
                                key={student.id}
                                onPress={() => setSelected(student)}
                                style={{
                                    flexDirection: "row", alignItems: "center",
                                    paddingVertical: 12, paddingHorizontal: 14,
                                    borderBottomWidth: i < filtered.length - 1 ? 1 : 0,
                                    borderBottomColor: Colors.border,
                                    gap: isSmall ? 12 : 0,
                                }}
                            >
                                {/* Estudiante */}
                                <View style={{ flex: isSmall ? 1 : 2, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: isSmall ? 0 : 0 }}>
                                    <Avatar name={student.name} size={32} />
                                    <View>
                                        <Text style={{ fontWeight: "600", fontSize: 13, color: Colors.text }}>{student.name}</Text>
                                        <Text style={{ fontSize: 11, color: Colors.muted }}>{student.code}</Text>
                                    </View>
                                </View>

                                {/* Solo en desktop */}
                                {!isSmall && <>
                                    <Text style={{ flex: 1, fontSize: 12, color: Colors.muted, paddingHorizontal: 14 }} numberOfLines={1}>{student.email}</Text>
                                    <Text style={{ flex: 1, fontSize: 12, color: Colors.text, paddingHorizontal: 14 }} numberOfLines={1}>{student.course}</Text>
                                    <View style={{ flex: 1, paddingHorizontal: 14 }}>
                                        <Text style={{ fontSize: 12, fontWeight: "700", color: student.attendance >= 80 ? "#10B981" : "#EF4444", marginBottom: 4 }}>
                                            {student.attendance}%
                                        </Text>
                                        <ProgressBar value={student.attendance} color={student.attendance >= 80 ? "#10B981" : "#EF4444"} height={4} />
                                    </View>
                                    <View style={{ flex: 1, paddingHorizontal: 14 }}>
                                        <Badge variant={student.registered ? "success" : "warning"}>
                                            {student.registered ? "Registrado" : "Pendiente"}
                                        </Badge>
                                    </View>
                                    <View style={{ flex: 1, paddingHorizontal: 14 }}>
                                        <Badge variant={student.status === "active" ? "success" : "default"}>
                                            {student.status === "active" ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </View>
                                </>}

                                {/* Solo en móvil */}
                                {isSmall && (
                                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "700", color: student.attendance >= 80 ? "#10B981" : "#EF4444" }}>
                                            {student.attendance}%
                                        </Text>
                                        <Badge variant={student.registered ? "success" : "warning"}>
                                            {student.registered ? "Facial OK" : "Pendiente"}
                                        </Badge>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    }
                </Card>
            </ScrollView>

            <StudentModal student={selected} onClose={() => setSelected(null)} />
        </View>
    );
}
