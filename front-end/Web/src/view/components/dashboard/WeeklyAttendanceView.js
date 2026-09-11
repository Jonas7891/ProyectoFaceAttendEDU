// ============================================================
//  WeeklyAttendanceView — Orquestador de asistencia semanal
// ============================================================
//  Componente orquestador que integra:
//  - WeeklyTrend (selector de semanas)
//  - DailyBarChart (gráfico diario)
//  
//  Responsabilidad: Solo maneja el ESTADO y la COMUNICACIÓN
//  entre componentes. El diseño/presentación está en los
//  componentes individuales.
//
//  Genérico: funciona para admin, teacher y student
// ============================================================

import React, { useState } from "react";
import { View } from "react-native";
import { WeeklyTrend } from "./WeeklyTrend";
import { DailyBarChart } from "./DailyBarChart";

/**
 * Orquestador de vista de asistencia semanal y diaria
 * 
 * Solo maneja el estado de selección y sincronización.
 * Los componentes hijos (WeeklyTrend, DailyBarChart) manejan su propio diseño.
 * 
 * @param {Array} weeklyData - Datos semanales: [{ week, rate, dailyData: [{ day, present, late, absent }] }]
 * @param {Array} currentWeekData - Datos de la semana actual para el gráfico diario
 * @param {Function} renderWeeklyTrend - Render prop para WeeklyTrend (recibe props y handlers)
 * @param {Function} renderDailyBarChart - Render prop para DailyBarChart (recibe props y data)
 * @param {Object} weeklyTrendProps - Props adicionales para WeeklyTrend
 * @param {Object} dailyBarChartProps - Props adicionales para DailyBarChart
 */
export function WeeklyAttendanceView({
    weeklyData = [],
    currentWeekData = [],
    renderWeeklyTrend,
    renderDailyBarChart,
    weeklyTrendProps = {},
    dailyBarChartProps = {},
}) {
    // Estado: semana seleccionada (null = semana actual)
    const [selectedWeek, setSelectedWeek] = useState(null);

    // Determinar qué datos diarios mostrar
    const displayedDailyData = selectedWeek?.dailyData || currentWeekData;
    
    // Handler para selección de semana
    const handleWeekSelect = (weekData) => {
        setSelectedWeek(weekData);
    };

    // Handler para reset (volver a semana actual)
    const handleResetToCurrentWeek = () => {
        setSelectedWeek(null);
    };

    // Si hay render props personalizados, usarlos
    if (renderWeeklyTrend && renderDailyBarChart) {
        return (
            <View style={{ flexDirection: "row", gap: 16 }}>
                {renderWeeklyTrend({
                    data: weeklyData,
                    onWeekSelect: handleWeekSelect,
                    selectedWeek: selectedWeek?.week,
                    ...weeklyTrendProps,
                })}
                {renderDailyBarChart({
                    data: displayedDailyData,
                    selectedWeek: selectedWeek,
                    onResetToCurrentWeek: handleResetToCurrentWeek,
                    ...dailyBarChartProps,
                })}
            </View>
        );
    }

    // Render por defecto: componentes básicos sin wrapper
    return {
        weeklyTrendProps: {
            data: weeklyData,
            onWeekSelect: handleWeekSelect,
            selectedWeek: selectedWeek?.week,
            ...weeklyTrendProps,
        },
        dailyBarChartProps: {
            data: displayedDailyData,
            ...dailyBarChartProps,
        },
        selectedWeek,
        onResetToCurrentWeek: handleResetToCurrentWeek,
    };
}

/**
 * Hook personalizado para orquestar asistencia semanal
 * 
 * Uso más limpio como hook en lugar de componente
 * 
 * @param {Array} weeklyData - Datos semanales
 * @param {Array} currentWeekData - Datos de la semana actual
 * @param {string} academicPeriod - Tipo de período académico (TODO: obtener de Settings)
 */
export function useWeeklyAttendanceController(
    weeklyData = [], 
    currentWeekData = [],
    academicPeriod // TODO: En el futuro esto vendrá de Settings
) {
    const [selectedWeek, setSelectedWeek] = useState(null);

    const displayedDailyData = selectedWeek?.dailyData || currentWeekData;

    const handleWeekSelect = (weekData) => {
        setSelectedWeek(weekData);
    };

    const handleResetToCurrentWeek = () => {
        setSelectedWeek(null);
    };

    return {
        // Estado
        selectedWeek,
        displayedDailyData,
        
        // Handlers
        handleWeekSelect,
        handleResetToCurrentWeek,
        
        // Props para componentes
        weeklyTrendProps: {
            data: weeklyData,
            onWeekSelect: handleWeekSelect,
            selectedWeek: selectedWeek?.week,
            academicPeriod, // Pasar el período académico al componente
        },
        dailyBarChartProps: {
            data: displayedDailyData,
        },
    };
}

export default WeeklyAttendanceView;
