// ============================================================
//  DailyBarChart — Gráfico de barras de asistencia diaria
// ============================================================
//  Componente específico del Dashboard que muestra asistencia
//  por día (presentes, tardanzas, ausentes)
//
//  Usa el componente genérico BarChart para la visualización
// ============================================================

import React from "react";
import { View, Text } from "react-native";
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

    // Transformar datos al formato esperado por BarChart
    const chartData = data.map(item => ({
        label: item.day,
        values: [
            { value: item.present, color: c.status.success },
            { value: item.late,    color: c.status.warning },
            { value: item.absent,  color: c.status.danger  },
        ],
    }));

    const legend = [
        { color: c.status.success, label: t("Presentes") },
        { color: c.status.warning, label: t("Tardanzas") },
        { color: c.status.danger,  label: t("Ausentes")  },
    ];

    // Calcular resumen
    const summary = data.reduce((acc, day) => ({
        present: acc.present + day.present,
        late: acc.late + day.late,
        absent: acc.absent + day.absent,
    }), { present: 0, late: 0, absent: 0 });

    const total = summary.present + summary.late + summary.absent;
    const attendanceRate = total > 0 
        ? (((summary.present + summary.late) / total) * 100).toFixed(1) 
        : 0;

    return (
        <View>
            <BarChart data={chartData} height={height} barWidth={8} gap={4} />
            
            {/* Leyenda */}
            {showLegend && (
                <View style={{
                    flexDirection: "row",
                    gap: 12,
                    marginTop: 12,
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}>
                    {legend.map(({ color, label }) => (
                        <View
                            key={label}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                            }}
                        >
                            <View style={{
                                width: 8,
                                height: 8,
                                borderRadius: 14,
                                backgroundColor: color,
                            }} />
                            <Text style={{
                                fontSize: 11,
                                color: c.text.secondary,
                            }}>
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Resumen estadístico */}
            {showSummary && total > 0 && (
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
                            fontSize: 14,
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
                            {t("Total")}
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: c.text.primary,
                        }}>
                            {total}
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
                            fontSize: 14,
                            fontWeight: "700",
                            color: c.status.success,
                        }}>
                            {total > 0 ? ((summary.present / total) * 100).toFixed(0) : 0}%
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

export default DailyBarChart;
