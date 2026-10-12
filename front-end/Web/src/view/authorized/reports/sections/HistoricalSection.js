// ============================================================
//  FaceAttend EDU — Históricos Section
//
//  Sección para mostrar la lista de usuarios con asistencia.
//  Incluye filtros por nombre, ficha y fecha.
// ============================================================

import React, { useState, useMemo, useEffect, forwardRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { createPortal } from "react-dom";
import { 
    Button, 
    TextInput, 
    AnimatedDropdown,
    DateRangeCalendar,
    Avatar,
    Badge,
    EmptyState,
    Loader,
    Checkbox
} from "../../../components/common";
import { useTheme } from "../../../components/hooks/useTheme";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { useDateFormat } from "../../../components/hooks/useDateFormat";
import { useAppData } from "../../../../context/AppDataContext";
import { titleCase } from "../../../../core/utils/formatting";
import UserHistoryModal from "../../../components/reports/UserHistoryModal";
import { ExportConfigModal } from "../../../components/reports/ExportConfigModal";
import { useHistoricosViewModel } from "../../../../viewmodels/useHistoricosViewModel";
import { usePushNotification } from "../../../components/common/feedback/PushNotification";
import { exportToExcel, exportToPDF, buildHTMLTable, formatPercentageWithColor, formatStatusBadge } from "../../../../core/utils/exportHelpers";
import { getInstitutionConfig } from "../../../../core/config/institutionConfig";
import { getAttendanceThresholds } from "../../../../models/data/userDerivedData";

function UserRow({ user, index, isLast, onPress, isExportMode, isSelected, onToggleSelect }) {
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
            onPress={() => {
                if (isExportMode) {
                    onToggleSelect(user.id);
                } else {
                    onPress();
                }
            }}
            style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                gap: 12,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: c.border.primary,
                backgroundColor: isSelected ? c.primary + "10" : "transparent",
            }}
        >
            {/* Checkbox en modo exportación */}
            {isExportMode && (
                <View style={{ marginRight: 4 }}>
                    <Checkbox
                        checked={isSelected}
                        onToggle={() => onToggleSelect(user.id)}
                        size="sm"
                        variant="primary"
                    />
                </View>
            )}

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

            {!isExportMode && <Feather name="chevron-right" size={20} color={c.text.secondary} />}
        </TouchableOpacity>
    );
}

export const HistoricosSection = forwardRef(({ showFilters, onToggleFilters, onStatsChange }, ref) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const appData = useAppData();
    const pushNotification = usePushNotification();
    const { formatDate } = useDateFormat();
    const c = theme.colors;

    const [searchName, setSearchName] = useState("");
    const [selectedFicha, setSelectedFicha] = useState("");
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    
    // Estados para modo de exportación
    const [isExportMode, setIsExportMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [showExportModal, setShowExportModal] = useState(false);

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
     * Handler para cambio de rango de fechas (aplicado directamente)
     */
    const handleDateRangeChange = (range) => {
        setDateRange(range);
    };

    const usersData = useMemo(() => {
        const students = appData.students || [];
        const courses = appData.courses || [];
        const environments = appData.environments || [];
        
        // Deduplicar estudiantes por ID para evitar registros duplicados
        const uniqueStudents = Array.from(
            new Map(students.map(s => [s.id, s])).values()
        );
        
        // Si NO hay filtro de fechas aplicado, mostrar solo el último registro por estudiante
        if (!dateRange.start || !dateRange.end) {
            return uniqueStudents.map(student => {
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
                    const environment = environments.find(env => env.id === studentCourse.room);
                    if (environment?.number) {
                        environmentName = environment.number;
                    }
                    
                    // Obtener horario programado del curso
                    if (environment?.schedules && environment.schedules.length > 0) {
                        const courseSchedule = environment.schedules.find(
                            sch => sch.courseCode === student.course
                        );
                        if (courseSchedule) {
                            scheduledStartTime = courseSchedule.startTime;
                            scheduledEndTime = courseSchedule.endTime;
                        } else if (environment.schedules[0]) {
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
                
                // Obtener el nombre de la ficha desde el curso
                const fichaName = studentCourse?.name || student.courseName || student.course || t("Sin ficha");
                
                return {
                    id: student.id,
                    studentId: student.id,
                    studentName: student.name,
                    studentCode: student.code,
                    ficha: student.course,
                    fichaName: fichaName,
                    environment: environmentName,
                    date: lastRecord?.date || null,
                    scheduledStartTime,
                    scheduledEndTime,
                    actualCheckInTime,
                    actualCheckOutTime,
                    status: lastRecord?.present ? "present" : "absent",
                    late: lastRecord?.late || false,
                    totalRecords: student.attendanceHistory?.length || 0,
                    attendance: student.attendance,
                };
            });
        }
        
        // Si HAY filtro de fechas, expandir TODOS los registros de asistencia
        const allRecords = [];
        
        uniqueStudents.forEach(student => {
            const studentCourse = courses.find(c => c.code === student.course || c.id === student.course);
            let environmentName = t("Sin ambiente");
            let scheduledStartTime = null;
            let scheduledEndTime = null;
            
            // Obtener información del ambiente
            if (studentCourse?.room) {
                const environment = environments.find(env => env.id === studentCourse.room);
                if (environment?.number) {
                    environmentName = environment.number;
                }
                
                // Obtener horario programado del curso
                if (environment?.schedules && environment.schedules.length > 0) {
                    const courseSchedule = environment.schedules.find(
                        sch => sch.courseCode === student.course
                    );
                    if (courseSchedule) {
                        scheduledStartTime = courseSchedule.startTime;
                        scheduledEndTime = courseSchedule.endTime;
                    } else if (environment.schedules[0]) {
                        scheduledStartTime = environment.schedules[0].startTime;
                        scheduledEndTime = environment.schedules[0].endTime;
                    }
                }
            }
            
            // Obtener el nombre de la ficha desde el curso
            const fichaName = studentCourse?.name || student.courseName || student.course || t("Sin ficha");
            
            // Si el estudiante tiene historial de asistencia, crear un registro por cada entrada
            if (student.attendanceHistory && student.attendanceHistory.length > 0) {
                student.attendanceHistory.forEach(record => {
                    allRecords.push({
                        id: `${student.id}-${record.date}`, // ID único por estudiante + fecha
                        studentId: student.id,
                        studentName: student.name,
                        studentCode: student.code,
                        ficha: student.course,
                        fichaName: fichaName,
                        environment: environmentName,
                        date: record.date,
                        scheduledStartTime,
                        scheduledEndTime,
                        actualCheckInTime: record.checkInTime || null,
                        actualCheckOutTime: record.checkOutTime || null,
                        status: record.present ? "present" : "absent",
                        late: record.late || false,
                        totalRecords: student.attendanceHistory.length,
                        attendance: student.attendance,
                    });
                });
            }
        });
        
        return allRecords;
    }, [appData.students, appData.courses, appData.environments, t, dateRange.start, dateRange.end]);

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
            result = result.filter(user => {
                if (!user.date) return false;
                
                // Normalizar fechas para comparación (solo fecha, sin hora)
                const userDate = new Date(user.date);
                userDate.setHours(0, 0, 0, 0);
                
                const startDate = new Date(dateRange.start);
                startDate.setHours(0, 0, 0, 0);
                
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                
                return userDate >= startDate && userDate <= endDate;
            });
        }

        // Ordenar por fecha descendente (más reciente primero) y luego por nombre
        return result.sort((a, b) => {
            // Primero por fecha
            if (a.date && b.date) {
                const dateCompare = new Date(b.date) - new Date(a.date);
                if (dateCompare !== 0) return dateCompare;
            } else if (a.date && !b.date) {
                return -1;
            } else if (!a.date && b.date) {
                return 1;
            }
            
            // Luego por nombre
            return a.studentName.localeCompare(b.studentName);
        });
    }, [usersData, searchName, selectedFicha, dateRange]);

    // Hook para manejar exportaciones
    const { exportExcel, exportPDF } = useHistoricosViewModel(filteredUsers);

    // Handlers de exportación con feedback
    const handleExportExcel = () => {
        const result = exportExcel();
        if (result.success) {
            pushNotification.success(
                t("Exportación exitosa"),
                t("El archivo Excel se ha descargado correctamente")
            );
        } else {
            pushNotification.error(
                t("Error al exportar"),
                t("No se pudo generar el archivo Excel")
            );
        }
    };

    const handleExportPDF = () => {
        const result = exportPDF();
        if (result.success) {
            pushNotification.success(
                t("Exportación exitosa"),
                t("El archivo PDF se está generando")
            );
        } else {
            pushNotification.error(
                t("Error al exportar"),
                t("No se pudo generar el archivo PDF")
            );
        }
    };

    // Exponer métodos de exportación al componente padre
    useImperativeHandle(ref, () => ({
        exportExcel: handleExportExcel,
        exportPDF: handleExportPDF,
    }));

    // Handlers para modo de exportación
    const handleToggleExportMode = () => {
        setIsExportMode(!isExportMode);
        setSelectedUsers(new Set()); // Limpiar selección al cambiar modo
    };

    const handleToggleSelectUser = (userId) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleOpenExportModal = () => {
        if (selectedUsers.size === 0) {
            pushNotification.warning(
                t("Sin selección"),
                t("Debes seleccionar al menos un usuario para exportar")
            );
            return;
        }
        setShowExportModal(true);
    };

    const handleCloseExportModal = () => {
        setShowExportModal(false);
    };

    const handleExportSelected = (format, exportType) => {
        // IMPORTANTE: Usar todos los usuarios, no solo los filtrados
        // Los usuarios seleccionados pueden estar en cualquier parte de la lista original
        const usersToExport = usersData.filter(u => selectedUsers.has(u.id));
        
        if (usersToExport.length === 0) {
            pushNotification.warning(
                t("Sin selección"),
                t("No hay usuarios seleccionados para exportar")
            );
            return;
        }
        
        // TODO: Implementar lógica según exportType ("simple" o "detailed")
        console.log(`[HistoricalSection] Exportando ${usersToExport.length} usuarios en formato ${format} con tipo ${exportType}`);
        
        if (format === "excel") {
            // Construir filas de Excel con usuarios seleccionados
            const rows = usersToExport.map(user => ({
                [t("Código")]: user.studentCode,
                [t("Nombre")]: user.studentName,
                [t("Ficha")]: user.fichaName || user.ficha,
                [t("Ambiente")]: user.environment,
                [t("Fecha")]: user.date ? formatDate(user.date, "DD/MM/YYYY") : t("Sin registro"),
                [t("Estado")]: user.late ? t("Retardo") : (user.status === "present" ? t("Presente") : t("Ausente")),
                [t("Horario Programado")]: user.scheduledStartTime && user.scheduledEndTime 
                    ? `${user.scheduledStartTime} - ${user.scheduledEndTime}` 
                    : t("N/A"),
                [t("Registro Real")]: user.actualCheckInTime && user.actualCheckOutTime 
                    ? `${user.actualCheckInTime} - ${user.actualCheckOutTime}` 
                    : t("N/A"),
                [t("Total de Registros")]: user.totalRecords,
                [t("Asistencia (%)")]: user.attendance || 0,
            }));

            const sheets = [{
                name: t("Históricos de Asistencia"),
                data: rows,
                columns: [
                    { wch: 12 },  // Código
                    { wch: 32 },  // Nombre
                    { wch: 16 },  // Ficha
                    { wch: 14 },  // Ambiente
                    { wch: 14 },  // Fecha
                    { wch: 12 },  // Estado
                    { wch: 20 },  // Horario Programado
                    { wch: 20 },  // Registro Real
                    { wch: 14 },  // Total Registros
                    { wch: 14 },  // Asistencia (%)
                ],
            }];

            const filename = `Historicos_Seleccionados_${formatDate(new Date(), "YYYY-MM-DD")}.xlsx`;
            const result = exportToExcel(sheets, filename);

            if (result.success) {
                pushNotification.success(
                    t("Exportación exitosa"),
                    `${usersToExport.length} ${usersToExport.length === 1 ? t("registro exportado") : t("registros exportados")} a Excel`
                );
            } else {
                pushNotification.error(
                    t("Error al exportar"),
                    t("No se pudo generar el archivo Excel")
                );
            }
        } else if (format === "pdf") {
            // Obtener umbrales de asistencia desde la función centralizada
            const thresholds = getAttendanceThresholds();
            const minAttendance = thresholds.minAttendance;
            const warning = thresholds.warning;
            const excellent = thresholds.excellent;
            
            // Obtener colores del tema para consistencia
            const successColor = c.status.success;
            const warningColor = c.status.warning;
            const dangerColor = c.status.danger;
            
            // Calcular usuarios únicos
            const uniqueUsers = new Set(usersToExport.map(u => u.studentId || u.id)).size;
            
            // Obtener rol del usuario (para usuario único)
            let userRole = null;
            if (uniqueUsers === 1 && usersToExport.length > 0) {
                // Por ahora, todos los usuarios en históricos son estudiantes
                userRole = t("Estudiante");
            }
            
            // Determinar estado para usuario único
            let userStatus = null;
            if (uniqueUsers === 1 && usersToExport.length > 0) {
                const attendance = usersToExport[0].attendance || 0;
                
                // Lógica de estado:
                // 1. EXCELENTE: Si el porcentaje es exactamente igual al configurado en settings
                // 2. BUENO: >= excellent (threshold.excellent)
                // 3. REGULAR: >= warning pero < excellent
                // 4. EN RIESGO: < warning
                
                if (attendance === minAttendance) {
                    userStatus = {
                        label: t("Excelente"),
                        color: successColor,
                        icon: "⭐",
                    };
                } else if (attendance >= excellent) {
                    userStatus = {
                        label: t("Bueno"),
                        color: successColor,
                        icon: "✓",
                    };
                } else if (attendance >= warning) {
                    userStatus = {
                        label: t("Regular"),
                        color: warningColor,
                        icon: "⚠",
                    };
                } else {
                    userStatus = {
                        label: t("En riesgo"),
                        color: dangerColor,
                        icon: "⚠",
                    };
                }
            }
            
            // Determinar columnas según el tipo de exportación
            let columns;
            
            if (exportType === "simple") {
                // Exportación SENCILLA: Solo nombre, ficha y asistencia con progressbar
                columns = [
                    { key: "studentName", label: t("Nombre"), width: "40%" },
                    { key: "fichaName", label: t("Ficha"), width: "30%", align: "center" },
                    {
                        key: "attendance",
                        label: t("Asistencia"),
                        width: "30%",
                        align: "center",
                        render: (value) => {
                            const percentage = value || 0;
                            // Determinar color según umbrales del tema
                            let barColor = successColor; // Verde por defecto (>= excellent)
                            if (percentage < warning) {
                                barColor = dangerColor; // Rojo
                            } else if (percentage < excellent) {
                                barColor = warningColor; // Amarillo
                            }
                            
                            return `
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="flex: 1; height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden;">
                                        <div style="height: 100%; background: ${barColor}; width: ${percentage}%; transition: width 0.3s;"></div>
                                    </div>
                                    <strong style="color: ${barColor}; font-size: 14px; min-width: 45px; text-align: right;">${percentage}%</strong>
                                </div>
                            `;
                        },
                    },
                ];
            } else {
                // Exportación DETALLADA: Todos los campos
                columns = [
                    { key: "studentName", label: t("Nombre"), width: "25%" },
                    { key: "fichaName", label: t("Curso"), width: "20%" },
                    { key: "environment", label: t("Ambiente"), width: "15%" },
                    { 
                        key: "date", 
                        label: t("Fecha"), 
                        width: "15%",
                        render: (value) => value ? formatDate(value, "DD/MM/YYYY") : t("Sin registro")
                    },
                    {
                        key: "status",
                        label: t("Estado"),
                        width: "10%",
                        align: "center",
                        render: (value, row) => {
                            const status = row.late ? "late" : (value === "present" ? "present" : "absent");
                            return formatStatusBadge(status, {
                                present: { text: t("Presente"), color: c.status.success },
                                late: { text: t("Retardo"), color: c.status.warning },
                                absent: { text: t("Ausente"), color: c.status.danger },
                            });
                        },
                    },
                    {
                        key: "attendance",
                        label: t("Asistencia"),
                        width: "15%",
                        align: "center",
                        render: (value) => {
                            const percentage = value || 0;
                            // Determinar color según umbrales del tema
                            let barColor = successColor; // Verde por defecto (>= excellent)
                            if (percentage < warning) {
                                barColor = dangerColor; // Rojo
                            } else if (percentage < excellent) {
                                barColor = warningColor; // Amarillo
                            }
                            
                            return `
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="flex: 1; height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden;">
                                        <div style="height: 100%; background: ${barColor}; width: ${percentage}%; transition: width 0.3s;"></div>
                                    </div>
                                    <strong style="color: ${barColor}; font-size: 14px; min-width: 45px; text-align: right;">${percentage}%</strong>
                                </div>
                            `;
                        },
                    },
                ];
            }
            
            // Construir tabla HTML con las columnas según el tipo
            const historicosTable = buildHTMLTable(usersToExport, columns);

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${t("Históricos de Asistencia Seleccionados")}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            padding: 40px;
            background: #ffffff;
            color: #1a1a1a;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${c.brand.primary};
        }
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            color: ${c.brand.primary};
            margin-bottom: 8px;
        }
        .header p {
            font-size: 14px;
            color: #666;
            margin-top: 4px;
        }
        .summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .summary-item {
            text-align: center;
        }
        .summary-item .value {
            font-size: 36px;
            font-weight: 700;
            color: ${c.brand.primary};
            margin-bottom: 4px;
        }
        .summary-item .label {
            font-size: 14px;
            color: #666;
            font-weight: 500;
        }
        .summary-item.status .value {
            color: ${userStatus?.color || c.brand.primary};
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        thead {
            background: ${c.brand.primary};
            color: white;
        }
        th {
            padding: 14px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
        }
        tbody tr:hover {
            background-color: #f8f9fa;
        }
        tbody tr:last-child td {
            border-bottom: none;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body {
                padding: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .summary-item .value {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${t("Históricos de Asistencia Seleccionados")}</h1>
        <p>${t("Registros seleccionados para exportación")} - ${exportType === "simple" ? t("Exportación sencilla") : t("Exportación detallada")}</p>
        <p>${t("Fecha de generación")}: ${formatDate(new Date(), "DD/MM/YYYY HH:mm")}</p>
    </div>

    <div class="summary">
        ${userStatus ? `
        <div class="summary-item status">
            <div class="value">${userStatus.label}</div>
            <div class="label">${userStatus.icon} ${t("Estado")}</div>
        </div>
        ` : `
        <div class="summary-item">
            <div class="value">${usersToExport.length}</div>
            <div class="label">${usersToExport.length === 1 ? t("Registro seleccionado") : t("Registros seleccionados")}</div>
        </div>
        `}
        <div class="summary-item">
            <div class="value">${uniqueUsers === 1 ? userRole : uniqueUsers}</div>
            <div class="label">${uniqueUsers === 1 ? t("Tipo de usuario") : t("Usuarios únicos")}</div>
        </div>
        <div class="summary-item">
            <div class="value">${usersToExport.reduce((sum, u) => sum + (u.totalRecords || 0), 0)}</div>
            <div class="label">${t("Total de asistencias")}</div>
        </div>
    </div>

    ${historicosTable}

    <div class="footer">
        <p>FaceAttend EDU © ${new Date().getFullYear()}</p>
        <p>${t("Sistema de Control de Asistencia")}</p>
    </div>
</body>
</html>
            `;

            const result = exportToPDF(html, `Historicos_Seleccionados_${formatDate(new Date(), "YYYY-MM-DD")}`);

            if (result.success) {
                pushNotification.success(
                    t("Exportación exitosa"),
                    `${usersToExport.length} ${usersToExport.length === 1 ? t("registro exportado") : t("registros exportados")} a PDF`
                );
            } else {
                pushNotification.error(
                    t("Error al exportar"),
                    t("No se pudo generar el archivo PDF")
                );
            }
        }
        
        // Cerrar modal y resetear modo
        setShowExportModal(false);
        setIsExportMode(false);
        setSelectedUsers(new Set());
    };

    useEffect(() => {
        if (onStatsChange) {
            // Deduplicar estudiantes para cálculos precisos
            const allStudents = appData.students || [];
            const uniqueStudents = Array.from(
                new Map(allStudents.map(s => [s.id, s])).values()
            );
            
            // Calcular total de registros ÚNICOS (sin duplicar)
            // Si NO hay filtro de fechas, sumar totalRecords de cada usuario único
            // Si HAY filtro de fechas, contar los registros expandidos
            let totalRecords;
            let totalUsers;
            
            if (!dateRange.start || !dateRange.end) {
                // Sin filtro: sumar totalRecords de cada usuario único
                totalRecords = usersData.reduce((sum, user) => sum + user.totalRecords, 0);
                totalUsers = usersData.length;
            } else {
                // Con filtro: contar registros únicos por estudiante
                const uniqueStudentIds = new Set(usersData.map(u => u.studentId));
                totalUsers = uniqueStudentIds.size;
                
                // Total de registros = todos los registros de todos los estudiantes únicos
                totalRecords = uniqueStudents.reduce((sum, student) => {
                    return sum + (student.attendanceHistory?.length || 0);
                }, 0);
            }
            
            onStatsChange({
                totalRecords,
                totalUsers,
            });
        }
    }, [usersData, onStatsChange, dateRange.start, dateRange.end, appData.students]);

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
        <View style={{ gap: 20, position: "relative" }}>
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
                            minHeight: 52,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottomWidth: 1,
                            borderBottomColor: c.border.primary,
                            backgroundColor: c.background.surfaceVariant,
                            gap: 12,
                        }}>
                            {/* Lado izquierdo: Contador o Checkbox de seleccionar todos */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                            }}>
                                {isExportMode && (
                                    <Checkbox
                                        checked={selectedUsers.size === filteredUsers.length}
                                        indeterminate={selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length}
                                        onToggle={handleSelectAll}
                                        size="sm"
                                        variant="primary"
                                    />
                                )}
                                
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: c.text.primary,
                                }}>
                                    {isExportMode && selectedUsers.size > 0
                                        ? `${selectedUsers.size} ${selectedUsers.size === 1 ? t("seleccionado") : t("seleccionados")}`
                                        : `${filteredUsers.length} ${filteredUsers.length === 1 ? t("registro") : t("registros")}`
                                    }
                                </Text>
                            </View>
                            
                            {/* Lado derecho: Botón Exportar o Filtros activos */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                            }}>
                                {!isExportMode && (searchName || selectedFicha || (dateRange.start && dateRange.end)) && (
                                    <>
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
                                    </>
                                )}
                                
                                {/* Botón Exportar / Cancelar */}
                                <TouchableOpacity
                                    onPress={handleToggleExportMode}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        backgroundColor: isExportMode ? c.status.danger + "15" : c.background.surface,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: isExportMode ? c.status.danger : c.border.primary,
                                    }}
                                >
                                    <Feather 
                                        name={isExportMode ? "x" : "download"} 
                                        size={16} 
                                        color={isExportMode ? c.status.danger : c.text.primary} 
                                    />
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: "500",
                                        color: isExportMode ? c.status.danger : c.text.primary,
                                    }}>
                                        {isExportMode ? t("Cancelar") : t("Exportar")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView style={{ maxHeight: 363 }} showsVerticalScrollIndicator={false}>
                            {filteredUsers.map((user, index) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    index={index}
                                    isLast={index === filteredUsers.length - 1}
                                    onPress={() => handleUserClick(user)}
                                    isExportMode={isExportMode}
                                    isSelected={selectedUsers.has(user.id)}
                                    onToggleSelect={handleToggleSelectUser}
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
            
            {/* Modal de configuración de exportación */}
            <ExportConfigModal
                visible={showExportModal}
                onClose={handleCloseExportModal}
                onExport={handleExportSelected}
                selectedCount={selectedUsers.size}
            />
            
            {/* Botón flotante usando Portal - Se renderiza en el body, fuera de cualquier scroll */}
            {isExportMode && selectedUsers.size > 0 && typeof document !== 'undefined' && createPortal(
                <View style={{
                    position: "fixed",
                    bottom: 32,
                    right: 32,
                    zIndex: 9999,
                }}>
                    <Button
                        variant="primary"
                        onPress={handleOpenExportModal}
                        leftIcon={<Feather 
                                    name="download" 
                                    size={24} 
                                    color="#fff" 
                                    style={{
                                            transform: [
                                                { translateX: 4 },
                                                { translateY: -3 },
                                        ],
                                }}/>}
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                        }}
                    />
                </View>,
                document.body
            )}
        </View>
    );
});

// Agregar displayName para ESLint
HistoricosSection.displayName = "HistoricosSection";
