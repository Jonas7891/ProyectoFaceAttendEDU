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
    AnimatedDropdown,
    DateRangeCalendar,
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
import { titleCase } from "../../../../core/utils/formatting";
import UserHistoryModal from "../../../components/reports/UserHistoryModal";

function UserRow({ user, index, isLast, onPress }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { formatDate } = useDateFormat();
    const c = theme.colors;
    
    const statusConfig = {
        present: {
            variant: "success",
            label: t("Presente"),
            icon: "check-circle",
            iconColor: c.status.success,
        },
        late: {
            variant: "warning",
            label: t("Retardo"),
            icon: "alert-circle",
            iconColor: c.status.warning,
        },
        absent: {
            variant: "danger",
            label: t("Ausente"),
            icon: "x-circle",
            iconColor: c.status.danger,
        }
    };
    
    const config = user.late ? statusConfig.late : (user.status === "present" ? statusConfig.present : statusConfig.absent);
    
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

            <View style={{ flex: 1, gap: 5 }}>
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
                        <Badge variant={config.variant} size="sm">
                            {config.label}
                        </Badge>
                    )}
                </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Feather name="hash" size={12} color={c.text.secondary} style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 12, color: c.text.secondary, fontWeight: "500", lineHeight: 14 }}>
                            {user.studentCode}
                        </Text>
                    </View>
                    
                    <Text style={{ fontSize: 12, color: c.text.disabled, lineHeight: 14 }}>•</Text>
                    
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Feather name="map-pin" size={12} color={c.text.secondary} style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 12, color: c.text.secondary, lineHeight: 14 }}>
                            {user.environment}
                        </Text>
                    </View>
                    
                    {user.date && (
                        <>
                            <Text style={{ fontSize: 12, color: c.text.disabled, lineHeight: 14 }}>•</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Feather name="calendar" size={12} color={c.text.secondary} style={{ marginTop: 1 }} />
                                <Text style={{ fontSize: 12, color: c.text.secondary, lineHeight: 14 }}>
                                    {formatDate(user.date, "DD/MM/YYYY")}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
                
                {/* Horarios - solo mostrar si hay datos de tiempo */}
                {(user.scheduledStartTime || user.actualCheckInTime) && (
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 2,
                    }}>
                        {/* Horario programado */}
                        {user.scheduledStartTime && user.scheduledEndTime && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Feather name="clock" size={11} color={c.text.tertiary} style={{ marginTop: 1 }} />
                                <Text style={{ fontSize: 11, color: c.text.tertiary, lineHeight: 13 }}>
                                    Horario: {user.scheduledStartTime} - {user.scheduledEndTime}
                                </Text>
                            </View>
                        )}
                        
                        {/* Registro real */}
                        {user.actualCheckInTime && user.actualCheckOutTime && (
                            <>
                                {user.scheduledStartTime && (
                                    <Text style={{ fontSize: 11, color: c.text.disabled, lineHeight: 13 }}>|</Text>
                                )}
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Feather name="activity" size={11} color={user.late ? c.status.warning : c.status.success} style={{ marginTop: 1 }} />
                                    <Text style={{ 
                                        fontSize: 11, 
                                        color: user.late ? c.status.warning : c.text.secondary,
                                        lineHeight: 13,
                                        fontWeight: user.late ? "600" : "400"
                                    }}>
                                        Real: {user.actualCheckInTime} - {user.actualCheckOutTime}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                )}
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

    const [searchName, setSearchName] = useState("");
    const [selectedFicha, setSelectedFicha] = useState("");
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    /**
     * Filtra el texto para permitir solo letras y espacios manteniendo acentos
     */
    const filterLettersAndSpaces = (text) => {
        if (!text) return '';
        // Permite letras con acentos, espacios, ñ, ü, etc.
        return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑç\s]/g, '');
    };

    /**
     * Formatea el nombre: filtra caracteres no válidos y capitaliza usando titleCase
     */
    const formatName = (text) => {
        if (!text) return '';
        const filtered = filterLettersAndSpaces(text);
        return titleCase(filtered);
    };

    /**
     * Handler para el input de nombre con auto-capitalización
     */
    const handleNameChange = (text) => {
        const formatted = formatName(text);
        setSearchName(formatted);
    };

    /**
     * Handler para cambio de rango de fechas
     */
    const handleDateRangeChange = (range) => {
        setDateRange(range);
    };

    const usersData = useMemo(() => {
        const students = appData.students || [];
        const courses = appData.courses || [];
        const environments = appData.environments || [];
        
        return students.map(student => {
            let lastRecord = null;
            let environmentName = t("Sin ambiente");
            
            if (student.attendanceHistory && student.attendanceHistory.length > 0) {
                const sortedHistory = [...student.attendanceHistory].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                lastRecord = sortedHistory[0];
            }
            
            // Obtener el ambiente y horario desde el curso del estudiante
            const studentCourse = courses.find(c => c.code === student.course || c.id === student.course);
            let scheduledStartTime = null;
            let scheduledEndTime = null;
            let actualCheckInTime = null;
            let actualCheckOutTime = null;
            
            if (studentCourse?.room) {
                // room contiene el ID del ambiente (ej: "env1"), buscar en environments
                const environment = environments.find(env => env.id === studentCourse.room);
                if (environment?.number) {
                    environmentName = environment.number;
                }
                
                // Obtener horario programado del curso
                if (environment?.schedules && environment.schedules.length > 0) {
                    // Buscar el schedule que corresponde al curso del estudiante
                    const courseSchedule = environment.schedules.find(
                        sch => sch.courseCode === student.course
                    );
                    if (courseSchedule) {
                        scheduledStartTime = courseSchedule.startTime;
                        scheduledEndTime = courseSchedule.endTime;
                    } else if (environment.schedules[0]) {
                        // Fallback: usar primer horario si no se encuentra el específico
                        scheduledStartTime = environment.schedules[0].startTime;
                        scheduledEndTime = environment.schedules[0].endTime;
                    }
                }
            }
            
            // Obtener horas reales del último registro de asistencia
            if (lastRecord) {
                actualCheckInTime = lastRecord.checkInTime || null;
                actualCheckOutTime = lastRecord.checkOutTime || null;
            }
            
            return {
                id: student.id,
                studentName: student.name,
                studentCode: student.code,
                ficha: student.course,
                fichaName: student.courseName,
                environment: environmentName,
                date: lastRecord?.date || null,
                // Horario programado del curso
                scheduledStartTime,
                scheduledEndTime,
                // Hora real del último registro
                actualCheckInTime,
                actualCheckOutTime,
                status: lastRecord?.present ? "present" : "absent",
                late: lastRecord?.late || false,
                totalRecords: student.attendanceHistory?.length || 0,
                attendance: student.attendance,
            };
        });
    }, [appData.students, appData.courses, appData.environments, t]);

    const availableFichas = useMemo(() => {
        const fichasSet = new Set();
        
        (appData.students || []).forEach(student => {
            if (student.course) {
                fichasSet.add(student.course);
            }
        });
        
        const fichaOptions = Array.from(fichasSet)
            .sort()
            .map(ficha => {
                const course = (appData.courses || []).find(c => c.code === ficha || c.id === ficha);
                return {
                    value: ficha,
                    label: course?.name || ficha,
                    description: `Ficha ${ficha}`,
                    icon: "book-open",
                };
            });
        
        return [
            { value: "", label: t("Todas las fichas"), description: t("Sin filtro"), icon: "filter" },
            ...fichaOptions
        ];
    }, [appData.students, appData.courses, t]);

    const filteredUsers = useMemo(() => {
        let result = usersData;

        if (searchName) {
            const searchLower = searchName.toLowerCase();
            result = result.filter(user => 
                user.studentName.toLowerCase().includes(searchLower) ||
                user.studentCode.toLowerCase().includes(searchLower)
            );
        }

        if (selectedFicha) {
            result = result.filter(user => user.ficha === selectedFicha);
        }

        if (dateRange.start && dateRange.end) {
            result = result.filter(user => 
                user.date && user.date >= dateRange.start && user.date <= dateRange.end
            );
        }

        return result.sort((a, b) => a.studentName.localeCompare(b.studentName));
    }, [usersData, searchName, selectedFicha, dateRange]);

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
        setDateRange({ start: null, end: null });
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowHistoryModal(true);
    };

    const handleCloseHistoryModal = () => {
        setShowHistoryModal(false);
        setSelectedUser(null);
    };

    if (appData.isLoading) {
        return <Loader fullScreen message={t("Cargando históricos...")} />;
    }

    return (
        <View style={{ gap: 20 }}>
            {/* Panel de filtros */}
            {showFilters && (
                <View style={{
                    padding: 14, // Reducido de 20 a 16
                    backgroundColor: c.background.surface,
                    borderRadius: 12,
                    gap: 12, // Reducido de 16 a 12
                    borderWidth: 1,
                    borderColor: c.border.primary,
                    zIndex: 10,
                }}>
                    {/* Header: Título + Botones */}
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "baseline", // Alinear por línea base del texto
                        marginTop: -8,
                        marginBottom: -12,
                    }}>
                        <Text style={{
                            fontSize: 15,
                            fontWeight: "600",
                            color: c.text.primary,
                            lineHeight: 20, // Altura de línea explícita
                        }}>
                            {t("Filtros de búsqueda")}
                        </Text>

                        <View style={{
                            flexDirection: "row",
                            gap: 12,
                            position: 'relative',
                            top: 4, // Mover visualmente hacia abajo sin cambiar altura
                        }}>
                            <Button variant="ghost" size="sm" onPress={clearFilters}>
                                {t("Limpiar")}
                            </Button>
                            <Button variant="primary" size="sm" onPress={() => onToggleFilters && onToggleFilters(false)}>
                                {t("Aplicar")}
                            </Button>
                        </View>
                    </View>

                    {/* Fila única con 3 inputs compactos */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "flex-end",
                        gap: 12,
                        position: 'relative',
                    }}>
                        {/* Nombre - MÁS ANCHO */}
                        <View style={{ flex: 2 }}>
                            <TextInput
                                label={t("Nombre")}
                                value={searchName}
                                onChangeText={handleNameChange}
                                placeholder={t("Buscar...")}
                                leftIcon={<Feather name="user" size={16} color={c.text.secondary} />}
                                containerStyle={{ height: 42, minHeight: 42 }}
                                style={{ marginBottom: 0 }}
                            />
                        </View>

                        {/* Ficha - MÁS ANCHO */}
                        <View style={{ flex: 1.5, zIndex: 90 }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: c.text.secondary,
                                marginBottom: 6,
                            }}>
                                {t("Ficha")}
                            </Text>
                            <AnimatedDropdown
                                items={availableFichas}
                                value={selectedFicha}
                                onSelect={setSelectedFicha}
                                placeholder={t("Todas las fichas")}
                                searchable={true}
                                searchPlaceholder={t("Buscar ficha...")}
                                maxVisible={5}
                                triggerIcon="book-open"
                                triggerHeight={42}
                            />
                        </View>

                        {/* Calendario de rango - MÁS ALTO z-index */}
                        <View style={{ flex: 2, zIndex: 100 }}>
                            <DateRangeCalendar
                                label={t("Fecha")}
                                startDate={dateRange.start}
                                endDate={dateRange.end}
                                onDateChange={handleDateRangeChange}
                                placeholder={t("Seleccionar rango")}
                                style={{ marginBottom: 0 }}
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* Lista de usuarios */}
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
                                searchName || selectedFicha || (dateRange.start && dateRange.end)
                                    ? t("No se encontraron usuarios con los filtros aplicados")
                                    : t("No hay usuarios registrados en el sistema")
                            }
                        />
                    </View>
                ) : (
                    <>
                        <View style={{
                            height: 52, // ALTURA FIJA para evitar deformación
                            paddingHorizontal: 16,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottomWidth: 1,
                            borderBottomColor: c.border.primary,
                            backgroundColor: c.background.surfaceVariant,
                        }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: c.text.primary,
                            }}>
                                {filteredUsers.length} {filteredUsers.length === 1 ? t("registro") : t("registros")}
                            </Text>
                            
                            {(searchName || selectedFicha || (dateRange.start && dateRange.end)) && (
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
                                        paddingVertical: 3,
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

                        <ScrollView style={{ maxHeight: 363,  }}showsVerticalScrollIndicator={false}>
                            {filteredUsers.map((user, index) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    index={index}
                                    isLast={index === filteredUsers.length - 1}
                                    onPress={() => handleUserClick(user)}
                                    
                                />
                            ))}
                        </ScrollView>

                        {filteredUsers.length > 5 && (
                            <View style={{
                                padding: 12, // Reducido de 16 a 12
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: c.background.surfaceVariant,
                                borderTopWidth: 1,
                                borderTopColor: c.border.primary,
                            }}>
                                <Feather name="check-circle" size={20} color={c.status.success} style={{ marginBottom: 4 }} />
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

            {/* Modal de historial de usuario */}
            {showHistoryModal && selectedUser && (
                <UserHistoryModal
                    user={selectedUser}
                    onClose={handleCloseHistoryModal}
                />
            )}
        </View>
    );
}
