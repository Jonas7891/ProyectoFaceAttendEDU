// ============================================================
//  FaceAttend EDU — Históricos Section
//
//  Sección para mostrar la lista de usuarios con asistencia.
//  Incluye filtros por nombre, ficha y fecha.
// ============================================================

import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { 
    Button, 
    TextInput, 
    Select as Dropdown,
    DatePicker,
    Avatar,
    Badge,
    EmptyState,
    Loader
} from "../../../components/common";
import { useTheme } from "../../../components/hooks/useTheme";
import { useResponsive } from "../../../components/hooks/useResponsive";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { useDateFormat } from "../../../components/hooks/useDateFormat";
import { useAppData } from "../../../../context/AppDataContext";

function UserRow({ user, index, isLast, onPress }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { formatDate } = useDateFormat();
    const c = theme.colors;
    
    // Determinar el icono y color según el estado del último registro
    const statusConfig = {
        present: {
            variant: "success",
            label: user.late ? t("Presente (Tarde)") : t("Presente"),
            icon: "check-circle",
            iconColor: c.status.success,
        },
        absent: {
            variant: "danger",
            label: t("Ausente"),
            icon: "x-circle",
            iconColor: c.status.danger,
        }
    };
    
    const config = statusConfig[user.status] || statusConfig.present;
    
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                gap: 12,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: c.border.primary,
            }}
        >
            {/* Avatar con indicador de estado */}
            <View style={{ position: "relative" }}>
                <Avatar name={user.studentName} size={40} />
                {user.date && (
                    <View style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: config.iconColor,
                        borderWidth: 2,
                        borderColor: c.background.surface,
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Feather name={config.icon} size={8} color="#fff" />
                    </View>
                )}
            </View>

            {/* Información principal */}
            <View style={{ flex: 1, gap: 5 }}>
                {/* Primera línea: Nombre y Badge */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: c.text.primary,
                        flex: 1,
                    }} numberOfLines={1}>
                        {user.studentName}
                    </Text>
                    
                    {user.date && (
                        <Badge 
                            variant={config.variant}
                            size="sm"
                        >
                            {config.label}
                        </Badge>
                    )}
                </View>

                {/* Segunda línea: Código, Ficha, Fecha y Hora */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                }}>
                    {/* Código */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                    }}>
                        <Feather name="hash" size={12} color={c.text.secondary} />
                        <Text style={{
                            fontSize: 12,
                            color: c.text.secondary,
                            fontWeight: "500",
                        }}>
                            {user.studentCode}
                        </Text>
                    </View>
                    
                    <Text style={{ fontSize: 12, color: c.text.disabled }}>•</Text>
                    
                    {/* Ficha */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                    }}>
                        <Feather name="book-open" size={12} color={c.text.secondary} />
                        <Text style={{
                            fontSize: 12,
                            color: c.text.secondary,
                        }}>
                            {user.ficha}
                        </Text>
                    </View>
                    
                    {user.date && (
                        <>
                            <Text style={{ fontSize: 12, color: c.text.disabled }}>•</Text>
                            
                            {/* Fecha */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                            }}>
                                <Feather name="calendar" size={12} color={c.text.secondary} />
                                <Text style={{
                                    fontSize: 12,
                                    color: c.text.secondary,
                                }}>
                                    {formatDate(user.date, "DD/MM/YYYY")}
                                </Text>
                            </View>
                        </>
                    )}
                    
                    {user.time && (
                        <>
                            <Text style={{ fontSize: 12, color: c.text.disabled }}>•</Text>
                            
                            {/* Hora */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                            }}>
                                <Feather name="clock" size={12} color={c.text.secondary} />
                                <Text style={{
                                    fontSize: 12,
                                    color: c.text.secondary,
                                }}>
                                    {user.time}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </View>

            <Feather name="chevron-right" size={20} color={c.text.secondary} />
        </TouchableOpacity>
    );
}

export function HistoricosSection({ showFilters, onToggleFilters, onStatsChange }) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const { t } = useTranslation();
    const appData = useAppData();
    const c = theme.colors;

    // Estado para filtros
    const [searchName, setSearchName] = useState("");
    const [selectedFicha, setSelectedFicha] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    // Construir lista de usuarios con su información de asistencia
    const usersData = useMemo(() => {
        // Solo estudiantes (excluyendo administradores y profesores)
        const students = appData.students || [];
        
        return students.map(student => {
            // Calcular el último registro de asistencia
            let lastRecord = null;
            if (student.attendanceHistory && student.attendanceHistory.length > 0) {
                // Ordenar por fecha descendente y tomar el primero
                const sortedHistory = [...student.attendanceHistory].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                lastRecord = sortedHistory[0];
            }
            
            // Generar hora simulada para el último registro
            const baseHour = 8;
            const minuteVariation = (parseInt(student.id) * 7) % 60;
            const time = `${baseHour.toString().padStart(2, '0')}:${minuteVariation.toString().padStart(2, '0')}`;
            
            return {
                id: student.id,
                studentName: student.name,
                studentCode: student.code,
                ficha: student.course,
                fichaName: student.courseName,
                date: lastRecord?.date || null,
                time: lastRecord ? time : null,
                status: lastRecord?.present ? "present" : "absent",
                late: lastRecord?.late || false,
                totalRecords: student.attendanceHistory?.length || 0,
                attendance: student.attendance,
            };
        });
    }, [appData.students]);

    // Fichas disponibles para filtrado (extraídas dinámicamente de los cursos)
    const availableFichas = useMemo(() => {
        const fichasSet = new Set();
        
        // Recopilar todas las fichas únicas de los estudiantes
        (appData.students || []).forEach(student => {
            if (student.course) {
                fichasSet.add(student.course);
            }
        });
        
        // Convertir a array de opciones
        const fichaOptions = Array.from(fichasSet)
            .sort()
            .map(ficha => {
                // Buscar el nombre del curso si está disponible
                const course = (appData.courses || []).find(c => c.code === ficha || c.id === ficha);
                return {
                    value: ficha,
                    label: course ? `${ficha} - ${course.name}` : ficha
                };
            });
        
        return [
            { value: "", label: t("Todas las fichas") },
            ...fichaOptions
        ];
    }, [appData.students, appData.courses, t]);

    // Filtrar datos de usuarios
    const filteredUsers = useMemo(() => {
        let result = usersData;

        // Filtro por nombre
        if (searchName) {
            const searchLower = searchName.toLowerCase();
            result = result.filter(user => 
                user.studentName.toLowerCase().includes(searchLower) ||
                user.studentCode.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por ficha
        if (selectedFicha) {
            result = result.filter(user => user.ficha === selectedFicha);
        }

        // Filtro por fecha específica o rango (filtrar usuarios que tienen registro en ese rango)
        if (selectedDate) {
            result = result.filter(user => user.date === selectedDate);
        } else if (dateRange.start && dateRange.end) {
            result = result.filter(user => 
                user.date && user.date >= dateRange.start && user.date <= dateRange.end
            );
        }

        // Ordenar por nombre
        return result.sort((a, b) => a.studentName.localeCompare(b.studentName));
    }, [usersData, searchName, selectedFicha, selectedDate, dateRange]);

    // Actualizar estadísticas en el padre
    useEffect(() => {
        if (onStatsChange) {
            const totalRecords = usersData.reduce((sum, user) => sum + user.totalRecords, 0);
            onStatsChange({
                totalRecords,
                totalUsers: usersData.length,
            });
        }
    }, [usersData, onStatsChange]);

    const clearFilters = () => {
        setSearchName("");
        setSelectedFicha("");
        setSelectedDate(null);
        setDateRange({ start: null, end: null });
    };

    // Mostrar loader mientras se cargan los datos
    if (appData.isLoading) {
        return <Loader fullScreen message={t("Cargando históricos...")} />;
    }

    return (
        <View style={{ gap: 20 }}>
            {/* Panel de filtros */}
            {showFilters && (
                <View style={{
                    padding: 16,
                    backgroundColor: c.background.surface,
                    borderRadius: 12,
                    gap: 16,
                    borderWidth: 1,
                    borderColor: c.border.primary,
                }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: c.text.primary,
                    }}>
                        {t("Filtros de búsqueda")}
                    </Text>

                    {/* Filtro por nombre */}
                    <View>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: c.text.primary,
                            marginBottom: 8,
                        }}>
                            {t("Nombre del estudiante")}
                        </Text>
                        <TextInput
                            value={searchName}
                            onChangeText={setSearchName}
                            placeholder={t("Buscar por nombre...")}
                            leftIcon={<Feather name="user" size={16} color={c.text.secondary} />}
                        />
                    </View>

                    {/* Filtro por ficha */}
                    <View>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: c.text.primary,
                            marginBottom: 8,
                        }}>
                            {t("Ficha")}
                        </Text>
                        <Dropdown
                            value={selectedFicha}
                            onValueChange={setSelectedFicha}
                            options={availableFichas}
                            placeholder={t("Seleccionar ficha")}
                        />
                    </View>

                    {/* Filtro por fecha */}
                    <View>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: c.text.primary,
                            marginBottom: 8,
                        }}>
                            {t("Fecha")}
                        </Text>
                        <View style={{
                            flexDirection: isSmall ? "column" : "row",
                            gap: 12,
                        }}>
                            <View style={{ flex: 1 }}>
                                <DatePicker
                                    value={selectedDate}
                                    onValueChange={setSelectedDate}
                                    placeholder={t("Fecha específica")}
                                />
                            </View>
                            <Text style={{
                                alignSelf: "center",
                                color: c.text.secondary,
                                fontWeight: "500",
                            }}>
                                {t("o")}
                            </Text>
                            <View style={{ 
                                flex: 1,
                                flexDirection: "row",
                                gap: 8,
                            }}>
                                <DatePicker
                                    value={dateRange.start}
                                    onValueChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                                    placeholder={t("Desde")}
                                    style={{ flex: 1 }}
                                />
                                <DatePicker
                                    value={dateRange.end}
                                    onValueChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                                    placeholder={t("Hasta")}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Botones de acción */}
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        gap: 12,
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderTopColor: c.border.primary,
                    }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onPress={clearFilters}
                        >
                            {t("Limpiar")}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onPress={() => onToggleFilters && onToggleFilters(false)}
                        >
                            {t("Aplicar")}
                        </Button>
                    </View>
                </View>
            )}

            {/* Resultados */}
            <View style={{
                backgroundColor: c.background.surface,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: c.border.primary,
            }}>
                {filteredUsers.length === 0 ? (
                    <View style={{ padding: 24 }}>
                        <EmptyState
                            icon="users"
                            title={t("No hay usuarios")}
                            description={
                                searchName || selectedFicha || selectedDate || (dateRange.start && dateRange.end)
                                    ? t("No se encontraron usuarios con los filtros aplicados")
                                    : t("No hay usuarios registrados en el sistema")
                            }
                        />
                    </View>
                ) : (
                    <>
                        {/* Header con contador y filtros activos */}
                        <View style={{
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: c.border.primary,
                            backgroundColor: c.background.surfaceVariant,
                        }}>
                            <View style={{
                                flexDirection: isSmall ? "column" : "row",
                                justifyContent: "space-between",
                                alignItems: isSmall ? "flex-start" : "center",
                                gap: 8,
                            }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: c.text.primary,
                                }}>
                                    {filteredUsers.length} {filteredUsers.length === 1 ? t("registro") : t("registros")}
                                </Text>
                                
                                {/* Indicador de filtros activos */}
                                {(searchName || selectedFicha || selectedDate || (dateRange.start && dateRange.end)) && (
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                    }}>
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 5,
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                            backgroundColor: c.primary + "20",
                                        }}>
                                            <Feather name="filter" size={12} color={c.primary} />
                                            <Text style={{
                                                fontSize: 12,
                                                color: c.primary,
                                                fontWeight: "500",
                                            }}>
                                                {t("Filtros activos")}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={clearFilters}>
                                            <Text style={{
                                                fontSize: 12,
                                                color: c.status.danger,
                                                fontWeight: "500",
                                            }}>
                                                {t("Limpiar")}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Lista de usuarios */}
                        <ScrollView style={{ maxHeight: 500 }}>
                            {filteredUsers.map((user, index) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    index={index}
                                    isLast={index === filteredUsers.length - 1}
                                    onPress={() => console.log("Ver detalles de usuario:", user.id)}
                                />
                            ))}
                        </ScrollView>

                        {/* Footer con mensaje final */}
                        {filteredUsers.length > 5 && (
                            <View style={{
                                padding: 16,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: c.background.surfaceVariant,
                                borderTopWidth: 1,
                                borderTopColor: c.border.primary,
                            }}>
                                <Feather name="check-circle" size={20} color={c.status.success} style={{ marginBottom: 6 }} />
                                <Text style={{
                                    fontSize: 13,
                                    color: c.text.secondary,
                                    textAlign: "center",
                                }}>
                                    {t("Has llegado al final de la lista")}
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </View>
        </View>
    );
}
