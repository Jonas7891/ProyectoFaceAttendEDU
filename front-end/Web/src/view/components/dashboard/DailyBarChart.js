// ============================================================
//  DailyBarChart — Gráfico de barras de asistencia diaria
// ============================================================
//  Componente específico del Dashboard que muestra asistencia
//  por día (presentes, tardanzas, ausentes)
//
//  Usa el componente genérico BarChart para la visualización
//  con interactividad: click en día → muestra métricas específicas
// ============================================================

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BarChart } from "../common/charts/BarChart";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../i18n/hooks/useTranslation";

/**
 * Gráfico de barras para asistencia diaria (genérico, adaptable por rol)
 * 
 * @param {Array} data - Datos de asistencia: [{ day, present, late, absent }]
 * @param {number} height - Altura del gráfico (default: 100)
 * @param {boolean} showLegend - Mostrar leyenda (default: true)
 * @param {boolean} showSummary - Mostrar resumen estadístico (default: true)
 */
export function DailyBarChart({ 
    data = [], 
    height = 100,
    showLegend = true,
    showSummary = true,
}) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    // Estado para el día seleccionado (null = mostrar global)
    const [selectedDayIndex, setSelectedDayIndex] = useState(null);

    // Transformar datos al formato esperado por BarChart
    const chartData = data.map(item => ({
        label: item.day,
        values: [
            { value: item.present, color: c.status.success },
            { value: item.late,    color: c.status.warning },
            { value: item.absent,  color: c.status.danger  },
        ],
        rawData: item, // Mantener datos originales para la selección
    }));

    const legend = [
        { color: c.status.success, label: t("Presentes") },
        { color: c.status.warning, label: t("Tardanzas") },
        { color: c.status.danger,  label: t("Ausentes")  },
    ];

    // Calcular resumen semanal global
    const globalSummary = data.reduce((acc, day) => ({
        present: acc.present + day.present,
        late: acc.late + day.late,
        absent: acc.absent + day.absent,
    }), { present: 0, late: 0, absent: 0 });

    const globalTotal = globalSummary.present + globalSummary.late + globalSummary.absent;

    // Determinar qué datos mostrar (día específico o global)
    const displayData = selectedDayIndex !== null && data[selectedDayIndex]
        ? {
            present: data[selectedDayIndex].present,
            late: data[selectedDayIndex].late,
            absent: data[selectedDayIndex].absent,
            total: data[selectedDayIndex].present + data[selectedDayIndex].late + data[selectedDayIndex].absent,
            isSpecific: true,
            dayName: data[selectedDayIndex].day,
        }
        : {
            present: globalSummary.present,
            late: globalSummary.late,
            absent: globalSummary.absent,
            total: globalTotal,
            isSpecific: false,
        };

    const attendanceRate = displayData.total > 0 
        ? (((displayData.present + displayData.late) / displayData.total) * 100).toFixed(1) 
        : 0;

    const punctualityRate = displayData.total > 0 
        ? ((displayData.present / displayData.total) * 100).toFixed(0) 
        : 0;

    // Manejar click en una barra
    const handleBarPress = (item, index) => {
        setSelectedDayIndex(selectedDayIndex === index ? null : index);
    };

    // Reset al hacer click en el área de métricas
    const handleMetricsPress = () => {
        if (selectedDayIndex !== null) {
            setSelectedDayIndex(null);
        }
    };

    return (
        <View>
            {/* Gráfico de barras interactivo */}
            <BarChart 
                data={chartData} 
                height={height} 
                barWidth={8} 
                gap={4}
                onBarPress={handleBarPress}
                selectedLabel={selectedDayIndex !== null ? data[selectedDayIndex]?.day : null}
            />
            
            {/* Leyenda con valores */}
            {showLegend && (
                <View style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: c.border.default,
                }}>
                    {/* Container centrado para las métricas con altura fija */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        height: 12, // Altura fija para evitar deformación
                    }}>
                        {/* Indicador de día específico con mejor diseño */}
                        {displayData.isSpecific && (
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: c.brand.primary + "15",
                                borderLeftWidth: 3,
                                borderLeftColor: c.brand.primary,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 4,
                                gap: 4,
                            }}>
                                <View style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: c.brand.primary,
                                }} />
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: "700",
                                    color: c.brand.primary,
                                    lineHeight: 16,
                                }}>
                                    {displayData.dayName}
                                </Text>
                            </View>
                        )}

                        {/* Métricas: Presentes, Tardanzas, Ausentes */}
                        {legend.map(({ color, label }) => {
                            const value = label === t("Presentes") 
                                ? displayData.present 
                                : label === t("Tardanzas") 
                                ? displayData.late 
                                : displayData.absent;
                            
                            return (
                                <View
                                    key={label}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <View style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: color,
                                    }} />
                                    <Text style={{
                                        fontSize: 11,
                                        color: c.text.secondary,
                                        lineHeight: 16,
                                    }}>
                                        {label}
                                    </Text>
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "700",
                                        color: color,
                                        lineHeight: 16,
                                    }}>
                                        ({value})
                                    </Text>
                                </View>
                            );
                        })}

                        {/* Botón X mejorado para cerrar */}
                        {displayData.isSpecific && (
                            <TouchableOpacity
                                onPress={handleMetricsPress}
                                style={{
                                    width: 17,
                                    height: 17,
                                    borderRadius: 10,
                                    backgroundColor: c.status.danger + "20",
                                    borderWidth: 1,
                                    borderColor: c.status.danger + "40",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transform: [{ translateY: 0 }]
                                }}
                                activeOpacity={0.6}
                            >
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: "700",
                                    color: c.status.danger,
                                    lineHeight: 13,
                                    transform: [{ translateY: -1 }]
                                }}>
                                    ×
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Resumen estadístico: Tasa y Puntualidad */}
            {showSummary && displayData.total > 0 && (
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: c.border.default,
                }}>
                    <View style={{ alignItems: "center" }}>
                        <Text style={{
                            fontSize: 10,
                            color: c.text.secondary,
                            marginBottom: 2,
                        }}>
                            {t("Tasa")}
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: parseFloat(attendanceRate) >= 85 
                                ? c.status.success 
                                : parseFloat(attendanceRate) >= 75 
                                ? c.status.warning 
                                : c.status.danger,
                        }}>
                            {attendanceRate}%
                        </Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <Text style={{
                            fontSize: 10,
                            color: c.text.secondary,
                            marginBottom: 2,
                        }}>
                            {t("Puntualidad")}
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: parseFloat(punctualityRate) >= 85 
                                ? c.status.success 
                                : parseFloat(punctualityRate) >= 75 
                                ? c.status.warning 
                                : c.status.danger,
                        }}>
                            {punctualityRate}%
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

export default DailyBarChart;
