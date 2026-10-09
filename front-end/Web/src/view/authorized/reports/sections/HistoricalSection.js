// ============================================================
//  FaceAttend EDU — Históricos Section
//
//  Sección para mostrar todo el historial del usuario.
//  Incluye buscador con filtros por nombre, ficha y día/s.
// ============================================================

import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { 
    Button, 
    TextInput, 
    Select as Dropdown,
    DatePicker,
    Avatar,
    Badge,
    EmptyState
} from "../../../components/common";
import { useTheme } from "../../../components/hooks/useTheme";
import { useResponsive } from "../../../components/hooks/useResponsive";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { useDateFormat } from "../../../components/hooks/useDateFormat";

function HistorialRow({ record, index, isLast, onPress }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { formatDate } = useDateFormat();
    const c = theme.colors;
    
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
            {/* Avatar */}
            <Avatar name={record.studentName} size={40} />

            {/* Información principal */}
            <View style={{ flex: 1, gap: 4 }}>
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
                        {record.studentName}
                    </Text>
                    
                    <Badge 
                        variant={record.status === "present" ? "success" : "danger"}
                        size="sm"
                    >
                        {record.status === "present" ? t("Presente") : t("Ausente")}
                    </Badge>
                </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                }}>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                    }}>
                        {record.ficha}
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                    }}>
                        •
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                    }}>
                        {formatDate(record.date, "DD/MM/YYYY")}
                    </Text>
                    {record.time && (
                        <>
                            <Text style={{
                                fontSize: 12,
                                color: c.text.secondary,
                            }}>
                                •
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: c.text.secondary,
                            }}>
                                {record.time}
                            </Text>
                        </>
                    )}
                </View>
            </View>

            <Feather name="chevron-right" size={20} color={c.text.secondary} />
        </TouchableOpacity>
    );
}

export function HistoricosSection({ title }) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const { t } = useTranslation();
    const c = theme.colors;

    // Estado para filtros
    const [searchName, setSearchName] = useState("");
    const [selectedFicha, setSelectedFicha] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [showFilters, setShowFilters] = useState(false);

    // Datos mockeados de historial (en producción vendría del contexto o API)
    const mockHistorialData = useMemo(() => [
        {
            id: "1",
            studentName: "Ana García",
            ficha: "2640001",
            date: "2024-12-06",
            time: "08:15",
            status: "present"
        },
        {
            id: "2",
            studentName: "Carlos Rodríguez",
            ficha: "2640001",
            date: "2024-12-06",
            time: "08:45",
            status: "absent"
        },
        {
            id: "3",
            studentName: "María López",
            ficha: "2640002",
            date: "2024-12-05",
            time: "09:00",
            status: "present"
        },
        {
            id: "4",
            studentName: "Pedro Martínez",
            ficha: "2640002",
            date: "2024-12-05",
            time: "08:30",
            status: "present"
        },
        {
            id: "5",
            studentName: "Ana García",
            ficha: "2640001",
            date: "2024-12-04",
            time: "08:20",
            status: "present"
        }
    ], []);

    // Fichas disponibles para filtrado
    const availableFichas = useMemo(() => [
        { value: "", label: t("Todas las fichas") },
        { value: "2640001", label: "2640001 - ADSO" },
        { value: "2640002", label: "2640002 - Multimedia" },
        { value: "2640003", label: "2640003 - Redes" },
    ], [t]);

    // Filtrar datos del historial
    const filteredHistorial = useMemo(() => {
        let result = mockHistorialData;

        // Filtro por nombre
        if (searchName) {
            const searchLower = searchName.toLowerCase();
            result = result.filter(record => 
                record.studentName.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por ficha
        if (selectedFicha) {
            result = result.filter(record => record.ficha === selectedFicha);
        }

        // Filtro por fecha específica o rango
        if (selectedDate) {
            result = result.filter(record => record.date === selectedDate);
        } else if (dateRange.start && dateRange.end) {
            result = result.filter(record => 
                record.date >= dateRange.start && record.date <= dateRange.end
            );
        }

        // Ordenar por fecha descendente (más recientes primero)
        return result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [mockHistorialData, searchName, selectedFicha, selectedDate, dateRange]);

    const clearFilters = () => {
        setSearchName("");
        setSelectedFicha("");
        setSelectedDate(null);
        setDateRange({ start: null, end: null });
    };

    return (
        <View style={{ padding: 24, gap: 20 }}>
            {/* Panel de filtros */}
            {showFilters && (
                <View style={{
                    padding: 16,
                    backgroundColor: c.background.surface,
                    borderRadius: 12,
                    gap: 16,
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
                            onPress={() => setShowFilters(false)}
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
            }}>
                {filteredHistorial.length === 0 ? (
                    <EmptyState
                        icon="clock"
                        title={t("No hay registros")}
                        description={
                            searchName || selectedFicha || selectedDate || (dateRange.start && dateRange.end)
                                ? t("No se encontraron registros con los filtros aplicados")
                                : t("No hay historial de asistencia disponible")
                        }
                    />
                ) : (
                    <>
                        {/* Header con contador */}
                        <View style={{
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: c.border.primary,
                            backgroundColor: c.background.surfaceVariant,
                        }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: c.text.primary,
                            }}>
                                {filteredHistorial.length} {filteredHistorial.length === 1 ? t("registro") : t("registros")}
                            </Text>
                        </View>

                        {/* Lista de registros */}
                        <ScrollView style={{ maxHeight: 400 }}>
                            {filteredHistorial.map((record, index) => (
                                <HistorialRow
                                    key={record.id}
                                    record={record}
                                    index={index}
                                    isLast={index === filteredHistorial.length - 1}
                                    onPress={() => console.log("Ver detalles:", record.id)}
                                />
                            ))}
                        </ScrollView>
                    </>
                )}
            </View>
        </View>
    );
}