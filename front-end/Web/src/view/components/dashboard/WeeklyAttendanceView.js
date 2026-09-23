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
import { getInstitutionConfig } from "../../../core/config/institutionConfig";
import { getCurrentPeriod, getCurrentAcademicWeek } from "../../../core/constants/academicPeriods";

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
    const [isCurrentWeek, setIsCurrentWeek] = useState(true); // Flag para saber si es la semana actual

    // Calcular la semana actual basada en el año (no en el período)
    const currentWeekNumber = React.useMemo(() => {
        const today = new Date();
        const yearStart = new Date(today.getFullYear(), 0, 1);
        
        // Calcular semana desde el inicio del año
        const weekNumber = getCurrentAcademicWeek(yearStart, today);
        
        return weekNumber;
    }, []);

    // Auto-seleccionar la semana actual al montar
    React.useEffect(() => {
        if (currentWeekNumber) {
            const currentWeekLabel = `Sem ${currentWeekNumber}`;
            // Buscar primero en datos reales
            let currentWeekData = weeklyData.find(w => w.week === currentWeekLabel);
            
            // Si no existe en datos reales, crear placeholder
            if (!currentWeekData) {
                currentWeekData = {
                    week: currentWeekLabel,
                    rate: 0,
                    dailyData: [
                        { day: "Lun", present: 0, late: 0, absent: 0 },
                        { day: "Mar", present: 0, late: 0, absent: 0 },
                        { day: "Mié", present: 0, late: 0, absent: 0 },
                        { day: "Jue", present: 0, late: 0, absent: 0 },
                        { day: "Vie", present: 0, late: 0, absent: 0 },
                    ],
                    isEmpty: true,
                };
            }
            
            setSelectedWeek(currentWeekData);
            setIsCurrentWeek(true);
        }
    }, [currentWeekNumber, weeklyData]);

    // Si hay semana seleccionada, usar sus dailyData
    // Si no, usar currentWeekData (datos mock de la semana actual)
    const displayedDailyData = selectedWeek?.dailyData || currentWeekData;

    const handleWeekSelect = (weekData) => {
        setSelectedWeek(weekData);
        // Verificar si la semana seleccionada es la actual
        const isCurrentWeekSelected = weekData && weekData.week === `Sem ${currentWeekNumber}`;
        setIsCurrentWeek(isCurrentWeekSelected);
    };

    const handleResetToCurrentWeek = () => {
        if (currentWeekNumber) {
            const currentWeekLabel = `Sem ${currentWeekNumber}`;
            // Buscar primero en datos reales
            let currentWeekData = weeklyData.find(w => w.week === currentWeekLabel);
            
            // Si no existe en datos reales, crear placeholder
            if (!currentWeekData) {
                currentWeekData = {
                    week: currentWeekLabel,
                    rate: 0,
                    dailyData: [
                        { day: "Lun", present: 0, late: 0, absent: 0 },
                        { day: "Mar", present: 0, late: 0, absent: 0 },
                        { day: "Mié", present: 0, late: 0, absent: 0 },
                        { day: "Jue", present: 0, late: 0, absent: 0 },
                        { day: "Vie", present: 0, late: 0, absent: 0 },
                    ],
                    isEmpty: true,
                };
            }
            
            setSelectedWeek(currentWeekData);
            setIsCurrentWeek(true);
        }
    };

    return {
        // Estado
        selectedWeek,
        displayedDailyData,
        currentWeekNumber, // Exportar para usarlo en el label
        isCurrentWeek, // Exportar flag para saber si es la semana actual
        
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
