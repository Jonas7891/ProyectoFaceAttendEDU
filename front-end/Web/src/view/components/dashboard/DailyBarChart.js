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
 * Gráfico de barras para asistencia diaria
 * 
 * @param {Array} data - Datos de asistencia: [{ day, present, late, absent }]
 * @param {number} height - Altura del gráfico (default: 100)
 */
export function DailyBarChart({ data = [], height = 100 }) {
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

    return (
        <View>
            <BarChart data={chartData} height={height} barWidth={8} gap={4} />
            
            {/* Leyenda */}
            <View style={{
                flexDirection: "row",
                gap: 12,
                marginTop: 12,
                flexWrap: "wrap",
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
        </View>
    );
}

export default DailyBarChart;
