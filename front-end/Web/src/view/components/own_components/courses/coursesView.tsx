import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, PageHeader, UIButton, ProgressBar, EmptyState } from "../ui/UI";
import Colors from "../../constants/colors";
import { mockCourses } from "../../constants/mockData";
import { useResponsive } from "../../hooks/useResponsive";

type Course = typeof mockCourses[0];

function CourseModal({ course, onClose }: { course: Course | null; onClose: () => void }) {
    if (!course) return null;
    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 24 }}
                onPress={onClose} activeOpacity={1}
            >
                <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                    <View style={{
                        backgroundColor: Colors.surface, borderRadius: 12, width: 460, overflow: "hidden",
                        shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
                    }}
                          className="animate-fadeInUp"
                    >
                        <View style={{ height: 6, backgroundColor: course.color }} />
                        <View style={{ padding: 24 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                                <View>
                                    <Text style={{ fontSize: 11, fontWeight: "700", color: course.color, letterSpacing: 1 }}>{course.code}</Text>
                                    <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.text, marginTop: 4 }}>{course.name}</Text>
                                </View>
                                <TouchableOpacity onPress={onClose}>
                                    <Feather name="x" size={18} color={Colors.muted} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                                {[
                                    { label: "Docente",     value: course.professor },
                                    { label: "Semestre",    value: course.semester  },
                                    { label: "Horario",     value: course.schedule  },
                                    { label: "Aula",        value: course.room      },
                                    { label: "Estudiantes", value: `${course.students} inscritos` },
                                    { label: "Asistencia",  value: `${course.avgAttendance}%` },
                                ].map(({ label, value }) => (
                                    <View key={label} style={{ width: "47%", backgroundColor: Colors.bg, borderRadius: 8, padding: 12 }}>
                                        <Text style={{ fontSize: 11, color: Colors.muted, marginBottom: 4 }}>{label}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.text }}>{value}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                                <UIButton variant="ghost" onPress={onClose}>Cerrar</UIButton>
                                <UIButton variant="primary">Editar curso</UIButton>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
    const color = course.avgAttendance >= 85 ? "#10B981" : "#F59E0B";
    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1, minWidth: 260 }}>
            <Card padding={0} style={{ overflow: "hidden", height: "100%" }}>
                <View style={{ height: 4, backgroundColor: course.color }} />
                <View style={{ padding: 18, flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: course.color, letterSpacing: 1 }}>{course.code}</Text>
                        <Badge variant="primary">{course.semester}</Badge>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.text, marginBottom: 2, lineHeight: 20 }}>
                        {course.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 14 }}>{course.professor}</Text>

                    <View style={{ gap: 6, marginBottom: 14 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Feather name="users"    size={13} color={Colors.muted} />
                            <Text style={{ fontSize: 12, color: Colors.muted }}>{course.students} estudiantes</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Feather name="clock"    size={13} color={Colors.muted} />
                            <Text style={{ fontSize: 12, color: Colors.muted }}>{course.schedule}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Feather name="map-pin"  size={13} color={Colors.muted} />
                            <Text style={{ fontSize: 12, color: Colors.muted }}>{course.room}</Text>
                        </View>
                    </View>

                    <View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                            <Text style={{ fontSize: 11, color: Colors.muted }}>Asistencia promedio</Text>
                            <Text style={{ fontSize: 12, fontWeight: "700", color }}>{course.avgAttendance}%</Text>
                        </View>
                        <ProgressBar value={course.avgAttendance} color={color} height={5} />
                    </View>
                </View>

                {/* Footer */}
                <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: Colors.border }}>
                    <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 10 }}>
                        <Feather name="bar-chart-2" size={13} color={Colors.muted} />
                        <Text style={{ fontSize: 12, color: Colors.muted }}>Reportes</Text>
                    </TouchableOpacity>
                    <View style={{ width: 1, backgroundColor: Colors.border }} />
                    <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 10 }}>
                        <Feather name="users" size={13} color={Colors.primary} />
                        <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: "600" }}>Estudiantes</Text>
                    </TouchableOpacity>
                </View>
            </Card>
        </TouchableOpacity>
    );
}

export default function CoursesView() {
    const { isSmall } = useResponsive();
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Course | null>(null);

    const filtered = mockCourses.filter(c =>
        !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
    );

    const totalStudents  = mockCourses.reduce((a, c) => a + c.students, 0);
    const avgAttendance  = Math.round(mockCourses.reduce((a, c) => a + c.avgAttendance, 0) / mockCourses.length);
    const alertCount     = mockCourses.filter(c => c.avgAttendance < 80).length;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }} showsVerticalScrollIndicator={false}>
                <PageHeader
                    title="Cursos"
                    subtitle={`${filtered.length} cursos activos este semestre`}
                    actions={<>
                        <UIButton variant="ghost" size="sm">Importar</UIButton>
                        <UIButton variant="primary" size="sm">+ Nuevo curso</UIButton>
                    </>}
                />

                {/* Búsqueda */}
                <View style={{ maxWidth: 360, position: "relative", justifyContent: "center" }}>
                    <View style={{ position: "absolute", left: 10, zIndex: 1 }}>
                        <Feather name="search" size={14} color={Colors.muted} />
                    </View>
                    <TextInput
                        placeholder="Buscar curso o código..."
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

                {/* Mini stats */}
                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                    {[
                        { label: "Total cursos",     value: mockCourses.length, color: Colors.primary },
                        { label: "Estudiantes",      value: totalStudents,      color: "#10B981"      },
                        { label: "Asistencia prom.", value: `${avgAttendance}%`,color: "#8B5CF6"      },
                        { label: "Con alerta",       value: alertCount,         color: "#F59E0B"      },
                    ].map(({ label, value, color }) => (
                        <Card key={label} style={{ flex: 1, minWidth: 100, alignItems: "center" }} padding={14}>
                            <Text style={{ fontSize: 10, fontWeight: "600", color: Colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, textAlign: "center" }}>
                                {label}
                            </Text>
                            <Text style={{ fontSize: 22, fontWeight: "800", color }}>{value}</Text>
                        </Card>
                    ))}
                </View>

                {/* Grid de cursos: 3 col desktop, 1-2 en móvil */}
                {filtered.length === 0
                    ? <Card><EmptyState icon={<Feather name="book-open" size={40} color={Colors.muted} />} title="Sin cursos" description="No se encontraron cursos con ese criterio" /></Card>
                    : (
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                            {filtered.map(course => (
                                <View key={course.id} style={{ flexBasis: isSmall ? "100%" : "30%", flexGrow: 1 }}>
                                    <CourseCard course={course} onPress={() => setSelected(course)} />
                                </View>
                            ))}
                        </View>
                    )
                }
            </ScrollView>

            <CourseModal course={selected} onClose={() => setSelected(null)} />
        </View>
    );
}
