// ============================================================
//  WeeklyTrend — Selector de tendencia semanal de asistencia
// ============================================================
//  Componente específico del Dashboard que muestra tendencia
//  de asistencia semanal con barras de progreso clickeables
//
//  Funcionalidad:
//  - Muestra últimas N semanas con su tasa de asistencia
//  - Permite seleccionar una semana para ver detalles diarios
//  - Calcula y muestra tendencia general
//  - Colores dinámicos según rendimiento
//  - Genérico: funciona para admin, teacher y student
//  - Adaptado a períodos académicos (Anual, Semestral, Cuatrimestral, Trimestral)
// ============================================================

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ProgressBar } from "../common/charts/ProgressBar";
import { AnimatedDropdown } from "../common/animation/AnimatedDropdown";
import { useTheme } from "../hooks/useTheme";
import { 
    ACADEMIC_PERIOD_TYPES, 
    getAcademicPeriodConfig,
    DEFAULT_ACADEMIC_PERIOD,
    getYearAcademicPeriods,
    getCurrentPeriod,
    formatPeriodLabel
} from "../../../core/constants/academicPeriods";

/**
 * Selector de tendencia semanal de asistencia (genérico, adaptable por rol)
 * 
 * @param {Array} data - Datos semanales: [{ week, rate, dailyData: [{ day, present, late, absent }] }]
 * @param {number} maxWeeks - Número máximo de semanas a mostrar (default: 5)
 * @param {boolean} showTrend - Mostrar indicador de tendencia (default: true)
 * @param {boolean} colorByPerformance - Colorear según rendimiento (default: false)
 * @param {Function} onWeekSelect - Callback al seleccionar una semana (recibe weekData)
 * @param {string} selectedWeek - Semana actualmente seleccionada
 * @param {string} academicPeriod - Tipo de período académico (annual, semestral, quarterly, trimestral)
 *                                   TODO: Esto vendrá de Settings en el futuro
 * @param {Function} onPeriodChange - Callback cuando cambia el período seleccionado (recibe period object)
 * @param {string} title - Título del componente (default: "Tendencia semanal")
 * @param {Function} t - Función de traducción (opcional)
 */
export function WeeklyTrend({ 
    data = [], 
    maxWeeks = 5, 
    showTrend = true,
    colorByPerformance = false,
    onWeekSelect,
    selectedWeek,
    academicPeriod = DEFAULT_ACADEMIC_PERIOD, // TODO: Obtener de Settings
    onPeriodChange,
    title,
    t = (key) => key, // Fallback si no se pasa traducción
}) {
    const { theme } = useTheme();
    const c = theme.colors;
    
    // Obtener año actual
    const currentYear = new Date().getFullYear();
    
    // Obtener todos los períodos del año vigente
    const yearPeriods = getYearAcademicPeriods(academicPeriod, currentYear);
    
    // Período seleccionado (default: período actual)
    const [selectedPeriod, setSelectedPeriod] = useState(() => getCurrentPeriod(academicPeriod, currentYear));

    // Obtener configuración del período académico
    const periodConfig = getAcademicPeriodConfig(academicPeriod);

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

    // Determinar si es interactivo
    const isInteractive = !!onWeekSelect;

    // Handler para cambio de período
    const handlePeriodSelect = (periodId) => {
        const period = yearPeriods.find(p => p.id === periodId);
        if (period) {
            setSelectedPeriod(period);
            if (onPeriodChange) {
                onPeriodChange(period);
            }
        }
    };

    // Preparar items del dropdown con descripción de semanas
    const dropdownItems = yearPeriods.map(period => ({
        value: period.id,
        label: formatPeriodLabel(period, academicPeriod),
        description: `Semanas ${period.startWeek}-${period.endWeek}`,
    }));

    // Generar subtítulo dinámico: "Por periodo academico (Primer Semestre)"
    const dynamicSubtitle = periodConfig && selectedPeriod 
        ? `Por periodo academico (${selectedPeriod.label})`
        : "";

    return (
        <View style={{ gap: 8 }}>
            {/* Header con título y dropdown */}
            <View style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 8,
                gap: 12,
            }}>
                {/* Título y subtítulo dinámico (izquierda) */}
                <View style={{ flex: 1 }}>
                    {title && (
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: c.text.primary,
                            marginBottom: 4,
                        }}>
                            {title}
                        </Text>
                    )}
                    {/* Subtítulo dinámico: "Primer Semestre (Semestral) • Selecciona para ver detalles" */}
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                    }}>
                        {dynamicSubtitle}
                    </Text>
                </View>

                {/* Dropdown de período (derecha) */}
                {periodConfig && (
                    <View style={{ width: 200, marginTop: -2 }}>
                        <AnimatedDropdown
                            items={dropdownItems}
                            value={selectedPeriod.id}
                            onSelect={handlePeriodSelect}
                            placeholder="Selecciona período"
                            triggerHeight={36}
                            maxVisible={6}
                        />
                    </View>
                )}
            </View>

            {/* Info dinámica del período seleccionado */}
            {periodConfig && selectedPeriod && (
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border.default + "40",
                }}>
                    <Text style={{
                        fontSize: 10,
                        color: c.text.tertiary,
                    }}>
                        {periodConfig.label} • {selectedPeriod.startWeek}-{selectedPeriod.endWeek} semanas
                    </Text>
                    <Text style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: selectedPeriod.isCurrent ? c.brand.primary : c.text.secondary,
                    }}>
                        {recentData.length} / {selectedPeriod.totalWeeks}
                    </Text>
                </View>
            )}

            {/* Lista de semanas */}
            {recentData.map((item, index) => {
                const isLastWeek = index === recentData.length - 1;
                const isSelected = selectedWeek === item.week;
                const barColor = getColorByRate(item.rate);

                const WeekContainer = isInteractive ? TouchableOpacity : View;

                return (
                    <WeekContainer
                        key={`${item.week}-${index}`}
                        onPress={isInteractive ? () => onWeekSelect(item) : undefined}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            marginHorizontal: -8,
                            borderRadius: 6,
                            backgroundColor: isSelected 
                                ? c.brand.primary + "10" 
                                : "transparent",
                            borderLeftWidth: isSelected ? 3 : 0,
                            borderLeftColor: c.brand.primary,
                            cursor: isInteractive ? "pointer" : "default",
                        }}
                    >
                        {/* Etiqueta de semana */}
                        <Text style={{
                            fontSize: 11,
                            fontWeight: isSelected ? "700" : isLastWeek ? "600" : "400",
                            color: isSelected 
                                ? c.brand.primary 
                                : isLastWeek 
                                ? c.text.primary 
                                : c.text.secondary,
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
                            fontWeight: isSelected ? "700" : isLastWeek ? "700" : "600",
                            color: colorByPerformance ? barColor : c.text.primary,
                            width: 40,
                            textAlign: "right",
                        }}>
                            {item.rate}%
                        </Text>

                        {/* Indicador de selección */}
                        {isSelected && (
                            <View style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: c.brand.primary,
                            }} />
                        )}
                    </WeekContainer>
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
