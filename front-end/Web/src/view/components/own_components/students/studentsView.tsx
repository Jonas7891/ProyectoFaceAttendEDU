// ============================================================
//  FaceAttend EDU — Students View (React Native)
// ============================================================
import React, { useState, useMemo } from "react";
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    Modal, SafeAreaView,
} from "react-native";
import { Card, Badge, Avatar, PageHeader, UIButton, ProgressBar, EmptyState } from "../ui/UI";
import Colors from "../../constants/colors";
import { mockStudents } from "../../constants/mockData";

type Student = typeof mockStudents[0];

function StudentModal({ student, onClose }: { student: Student | null; onClose: () => void }) {
    if (!student) return null;
    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 24 }}
                onPress={onClose}
                activeOpacity={1}
            >
                <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                    <View style={{
                        backgroundColor: Colors.surface, borderRadius: 12, width: 380,
                        maxHeight: 600, overflow: "hidden",
                    }}>
                        {/* Header */}
                        <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: "row", alignItems: "center", gap: 14 }}>
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
                                <Text style={{ fontSize: 20, color: Colors.muted }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Body */}
                        <ScrollView style={{ padding: 20 }}>
                            <View style={{ gap: 12, marginBottom: 16 }}>
                                {[
                                    { label: "Correo",    value: student.email  },
                                    { label: "Programa",  value: student.course },
                                    { label: "Semestre",  value: student.grade  },
                                ].map(({ label, value }) => (
                                    <View key={label} style={{ flexDirection: "row", gap: 10 }}>
                                        <Text style={{ fontSize: 12, color: Colors.muted, width: 80 }}>{label}</Text>
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
                                    {student.attendance >= 80 ? "✅ Cumple el mínimo (80%)" : "⚠️ Por debajo del mínimo (80%)"}
                                </Text>
                            </View>

                            {/* Facial */}
                            <View style={{
                                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                                padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginBottom: 12,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                    <Text style={{ fontSize: 20 }}>🎭</Text>
                                    <View>
                                        <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.text }}>Reconocimiento facial</Text>
                                        <Text style={{ fontSize: 11, color: Colors.muted }}>
                                            {student.registered ? "Rostro registrado" : "Sin registro facial"}
                                        </Text>
                                    </View>
                                </View>
                                {student.registered
                                    ? <Text style={{ color: "#10B981", fontSize: 18 }}>✅</Text>
                                    : <UIButton variant="primary" size="sm">Registrar</UIButton>
                                }
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                            <UIButton variant="ghost" onPress={onClose}>Cerrar</UIButton>
                            <UIButton variant="primary">Editar</UIButton>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

export default function StudentsView() {
    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [selected, setSelected] = useState<Student | null>(null);

    const filtered = useMemo(() => {
        return mockStudents.filter(s => {
            const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.includes(search);
            const matchCourse = !courseFilter || s.course === courseFilter;
            return matchSearch && matchCourse;
        });
    }, [search, courseFilter]);

    const courses = [...new Set(mockStudents.map(s => s.course))];

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} showsVerticalScrollIndicator={false}>
                <PageHeader
                    title="Estudiantes"
                    subtitle={`${filtered.length} estudiante${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
                    actions={<UIButton variant="primary" size="sm">+ Nuevo</UIButton>}
                />

                {/* Filtros */}
                <Card padding={12}>
                    <TextInput
                        placeholder="Buscar por nombre o código..."
                        value={search}
                        onChangeText={setSearch}
                        style={{
                            height: 38, borderWidth: 1, borderColor: Colors.border,
                            borderRadius: 6, paddingHorizontal: 12, fontSize: 13,
                            backgroundColor: Colors.surface,
                        }}
                        placeholderTextColor={Colors.muted}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            {["", ...courses].map(c => (
                                <TouchableOpacity
                                    key={c}
                                    onPress={() => setCourseFilter(c)}
                                    style={{
                                        paddingHorizontal: 12, paddingVertical: 6,
                                        borderRadius: 99,
                                        backgroundColor: courseFilter === c ? Colors.primary : Colors.border,
                                    }}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: courseFilter === c ? "#fff" : Colors.muted }}>
                                        {c || "Todos"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </Card>

                {/* Lista */}
                <Card padding={0}>
                    {filtered.length === 0
                        ? <EmptyState title="Sin resultados" description="Ajusta los filtros o agrega nuevos estudiantes" />
                        : filtered.map((student, i) => (
                            <TouchableOpacity
                                key={student.id}
                                onPress={() => setSelected(student)}
                                style={{
                                    flexDirection: "row", alignItems: "center", gap: 12,
                                    padding: 14,
                                    borderBottomWidth: i < filtered.length - 1 ? 1 : 0,
                                    borderBottomColor: Colors.border,
                                }}
                            >
                                <Avatar name={student.name} size={40} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.text }}>{student.name}</Text>
                                    <Text style={{ fontSize: 11, color: Colors.muted }}>{student.code} · {student.course}</Text>
                                </View>
                                <View style={{ alignItems: "flex-end", gap: 4 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "700", color: student.attendance >= 80 ? "#10B981" : "#EF4444" }}>
                                        {student.attendance}%
                                    </Text>
                                    <Badge variant={student.registered ? "success" : "warning"}>
                                        {student.registered ? "Facial OK" : "Pendiente"}
                                    </Badge>
                                </View>
                            </TouchableOpacity>
                        ))
                    }
                </Card>
            </ScrollView>

            <StudentModal student={selected} onClose={() => setSelected(null)} />
        </View>
    );
}
