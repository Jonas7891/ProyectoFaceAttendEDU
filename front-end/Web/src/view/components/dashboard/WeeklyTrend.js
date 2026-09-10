// ============================================================
//  WeeklyTrend — Tendencia semanal de asistencia
// ============================================================
//  Componente específico del Dashboard que muestra tendencia
//  de asistencia semanal con barras de progreso
//
//  Usa el componente genérico ProgressBar para la visualización
// ============================================================

import React from "react";
import { View, Text } from "react-native";
import { ProgressBar } from "../common/charts/ProgressBar";
import { useTheme } from "../hooks/useTheme";

/**
 * Tendencia semanal de asistencia (genérico, adaptable por rol)
 * 
 * @param {Array} data - Datos semanales: [{ week, rate }]
 * @param {number} maxWeeks - Número máximo de semanas a mostrar (default: 5)
 * @param {boolean} showTrend - Mostrar indicador de tendencia (default: true)
 * @param {boolean} colorByPerformance - Colorear según rendimiento (default: false)
 */
export function WeeklyTrend({ 
    data = [], 
    maxWeeks = 5, 
    showTrend = true,
    colorByPerformance = false,
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    // Tomar las últimas N semanas
    const recentData = data.slice(-maxWeeks);

    // Calcular tendencia (comparación última vs primera semana)
    const trendDirection = recentData.length >= 2 
        ? recentData[recentData.length - 1].rate - recentData[0].rate
        : 0;

    // Función para obtener color según rendimiento
    const getColorByRate = (rate) => {
        if (!colorByPerformance) return c.brand.primary;
        if (rate >= 90) return c.status.success;
        if (rate >= 75) return c.status.warning;
        return c.status.danger;
    };

    return (
        <View style={{ gap: 8 }}>
            {recentData.map((item, index) => {
                const isLastWeek = index === recentData.length - 1;
                const barColor = getColorByRate(item.rate);

                return (
                    <View
                        key={`${item.week}-${index}`}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        {/* Etiqueta de semana */}
                        <Text style={{
                            fontSize: 11,
                            fontWeight: isLastWeek ? "600" : "400",
                            color: isLastWeek ? c.text.primary : c.text.secondary,
                            width: 50,
                            textAlign: "right",
                        }}>
                            {item.week}
                        </Text>

                        {/* Barra de progreso */}
                        <View style={{ flex: 1 }}>
                            <ProgressBar
                                value={item.rate}
                                color={barColor}
                                size="sm"
                            />
                        </View>

                        {/* Porcentaje */}
                        <Text style={{
                            fontSize: 11,
                            fontWeight: isLastWeek ? "700" : "600",
                            color: colorByPerformance ? barColor : c.text.primary,
                            width: 40,
                            textAlign: "right",
                        }}>
                            {item.rate}%
                        </Text>
                    </View>
                );
            })}

            {/* Indicador de tendencia */}
            {showTrend && recentData.length >= 2 && (
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: c.border.default,
                }}>
                    <Text style={{
                        fontSize: 11,
                        color: c.text.secondary,
                        marginRight: 6,
                    }}>
                        Tendencia:
                    </Text>
                    <Text style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: trendDirection > 0 
                            ? c.status.success 
                            : trendDirection < 0 
                            ? c.status.danger 
                            : c.text.secondary,
                    }}>
                        {trendDirection > 0 ? "↑" : trendDirection < 0 ? "↓" : "→"} {Math.abs(trendDirection).toFixed(1)}%
                    </Text>
                </View>
            )}
        </View>
    );
}

export default WeeklyTrend;
