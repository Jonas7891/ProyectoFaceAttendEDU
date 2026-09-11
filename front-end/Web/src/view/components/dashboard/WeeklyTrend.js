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
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    // Estado para el dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
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
    const handlePeriodSelect = (period) => {
        setSelectedPeriod(period);
        setIsDropdownOpen(false);
        if (onPeriodChange) {
            onPeriodChange(period);
        }
    };

    return (
        <View style={{ gap: 8 }}>
            {/* Información del período académico con dropdown */}
            {periodConfig && (
                <View style={{
                    flexDirection: "column",
                    gap: 8,
                    marginBottom: 4,
                    paddingBottom: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border.default + "40",
                }}>
                    {/* Fila superior: Dropdown de período */}
                    <View style={{ position: "relative", zIndex: 10 }}>
                        <Text style={{
                            fontSize: 10,
                            color: c.text.tertiary,
                            marginBottom: 4,
                        }}>
                            Período académico
                        </Text>
                        
                        {/* Dropdown button */}
                        <TouchableOpacity
                            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                backgroundColor: c.background.elevated,
                                borderWidth: 1,
                                borderColor: isDropdownOpen ? c.brand.primary : c.border.default,
                                borderRadius: 6,
                                cursor: "pointer",
                            }}
                        >
                            <Text style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: c.text.primary,
                            }}>
                                {formatPeriodLabel(selectedPeriod, academicPeriod)}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: c.text.secondary,
                                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                            }}>
                                ▼
                            </Text>
                        </TouchableOpacity>

                        {/* Dropdown menu */}
                        {isDropdownOpen && (
                            <View style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                marginTop: 4,
                                backgroundColor: c.background.elevated,
                                borderWidth: 1,
                                borderColor: c.border.default,
                                borderRadius: 6,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 8,
                                elevation: 5,
                                maxHeight: 240,
                                overflow: "scroll",
                            }}>
                                {yearPeriods.map((period, index) => {
                                    const isDisabled = period.isFuture;
                                    const isSelected = selectedPeriod.id === period.id;
                                    
                                    return (
                                        <TouchableOpacity
                                            key={period.id}
                                            onPress={() => !isDisabled && handlePeriodSelect(period)}
                                            disabled={isDisabled}
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                                backgroundColor: isSelected 
                                                    ? c.brand.primary + "15" 
                                                    : "transparent",
                                                borderTopWidth: index > 0 ? 1 : 0,
                                                borderTopColor: c.border.default + "40",
                                                opacity: isDisabled ? 0.4 : 1,
                                                cursor: isDisabled ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            <View style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{
                                                        fontSize: 11,
                                                        fontWeight: isSelected ? "700" : "600",
                                                        color: isSelected 
                                                            ? c.brand.primary 
                                                            : isDisabled 
                                                            ? c.text.tertiary 
                                                            : c.text.primary,
                                                    }}>
                                                        {period.label}
                                                    </Text>
                                                    <Text style={{
                                                        fontSize: 10,
                                                        color: c.text.tertiary,
                                                        marginTop: 2,
                                                    }}>
                                                        Semanas {period.startWeek}-{period.endWeek}
                                                    </Text>
                                                </View>
                                                {period.isCurrent && (
                                                    <View style={{
                                                        paddingHorizontal: 6,
                                                        paddingVertical: 2,
                                                        backgroundColor: c.brand.primary + "20",
                                                        borderRadius: 4,
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 9,
                                                            fontWeight: "700",
                                                            color: c.brand.primary,
                                                        }}>
                                                            ACTUAL
                                                        </Text>
                                                    </View>
                                                )}
                                                {period.isFuture && (
                                                    <View style={{
                                                        paddingHorizontal: 6,
                                                        paddingVertical: 2,
                                                        backgroundColor: c.text.tertiary + "20",
                                                        borderRadius: 4,
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 9,
                                                            fontWeight: "700",
                                                            color: c.text.tertiary,
                                                        }}>
                                                            FUTURO
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* Fila inferior: Progreso del período */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 10,
                                color: c.text.tertiary,
                            }}>
                                {periodConfig.label} • {periodConfig.minWeeks}-{periodConfig.maxWeeks} semanas
                            </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                            <Text style={{
                                fontSize: 11,
                                fontWeight: "700",
                                color: selectedPeriod.isCurrent ? c.brand.primary : c.text.secondary,
                            }}>
                                {recentData.length} / {selectedPeriod.totalWeeks}
                            </Text>
                        </View>
                    </View>
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
