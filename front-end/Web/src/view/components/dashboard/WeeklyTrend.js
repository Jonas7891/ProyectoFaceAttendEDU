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
 * Tendencia semanal de asistencia
 * 
 * @param {Array} data - Datos semanales: [{ week, rate }]
 * @param {number} maxWeeks - Número máximo de semanas a mostrar (default: 5)
 */
export function WeeklyTrend({ data = [], maxWeeks = 5 }) {
    const { theme } = useTheme();
    const c = theme.colors;

    // Tomar las últimas N semanas
    const recentData = data.slice(-maxWeeks);

    return (
        <View style={{ gap: 8 }}>
            {recentData.map((item, index) => (
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
                        color: c.text.secondary,
                        width: 50,
                        textAlign: "right",
                    }}>
                        {item.week}
                    </Text>

                    {/* Barra de progreso */}
                    <View style={{ flex: 1 }}>
                        <ProgressBar
                            value={item.rate}
                            color={c.brand.primary}
                            size="sm"
                        />
                    </View>

                    {/* Porcentaje */}
                    <Text style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: c.text.primary,
                        width: 40,
                        textAlign: "right",
                    }}>
                        {item.rate}%
                    </Text>
                </View>
            ))}
        </View>
    );
}

export default WeeklyTrend;
