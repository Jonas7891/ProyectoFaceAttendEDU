// ============================================================
//  DateRangeCalendar — Selector de rango de fechas inline (dropdown)
// ============================================================

import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS_SHORT = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

/**
 * Obtiene los días del mes en formato de grid (5 semanas x 7 días cuando es posible)
 */
function getMonthDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo

    const days = [];
    
    // Días del mes anterior (relleno)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
            date: prevMonthLastDay - i,
            isCurrentMonth: false,
            fullDate: new Date(year, month - 1, prevMonthLastDay - i),
        });
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            date: i,
            isCurrentMonth: true,
            fullDate: new Date(year, month, i),
        });
    }
    
    // Días del mes siguiente (relleno hasta completar 35 días = 5 semanas)
    const remainingDays = 35 - days.length; // 5 semanas x 7 días = 35
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            date: i,
            isCurrentMonth: false,
            fullDate: new Date(year, month + 1, i),
        });
    }
    
    return days;
}

/**
 * Formatea fecha como YYYY-MM-DD
 */
function formatDateString(date) {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parsea string YYYY-MM-DD a Date
 */
function parseDate(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Calendario de rango de fechas inline (dropdown)
 */
export function DateRangeCalendar({
    startDate,
    endDate,
    onDateChange,
    label,
    placeholder = "Seleccionar rango",
    error = false,
    style,
}) {
    const { theme } = useTheme();
    const c = theme.colors;
    
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [tempStart, setTempStart] = useState(null);
    const [tempEnd, setTempEnd] = useState(null);
    const [isSelectingRange, setIsSelectingRange] = useState(false);

    // Parsear fechas de entrada
    const parsedStart = useMemo(() => parseDate(startDate), [startDate]);
    const parsedEnd = useMemo(() => parseDate(endDate), [endDate]);

    const monthDays = useMemo(() => 
        getMonthDays(currentYear, currentMonth),
        [currentYear, currentMonth]
    );

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const handleDayPress = (day) => {
        const dateStr = formatDateString(day.fullDate);
        const clickedTime = day.fullDate.getTime();
        
        if (!tempStart && !tempEnd) {
            // Sin selección previa: establecer como inicio
            setTempStart(dateStr);
            setTempEnd(null);
            setIsSelectingRange(true);
        } else if (tempStart && !tempEnd) {
            // Solo hay fecha de inicio: establecer como fin
            const startTime = parseDate(tempStart).getTime();
            
            if (clickedTime >= startTime) {
                // Fecha válida como fin
                setTempEnd(dateStr);
                onDateChange({ start: tempStart, end: dateStr });
                setIsSelectingRange(false);
            } else {
                // Si es anterior, se convierte en el nuevo inicio
                setTempStart(dateStr);
                setTempEnd(null);
            }
        } else if (tempStart && tempEnd) {
            // Ya hay un rango completo: ajustar dinámicamente
            const startTime = parseDate(tempStart).getTime();
            const endTime = parseDate(tempEnd).getTime();
            
            // Si hace click en el mismo día que está seleccionado (inicio o fin), seleccionar solo ese día
            if (clickedTime === startTime || clickedTime === endTime) {
                setTempStart(dateStr);
                setTempEnd(dateStr);
                onDateChange({ start: dateStr, end: dateStr });
                return;
            }
            
            // Calcular distancias
            const distanceToStart = Math.abs(clickedTime - startTime);
            const distanceToEnd = Math.abs(clickedTime - endTime);
            
            if (distanceToStart < distanceToEnd) {
                // Más cerca del inicio: ajustar fecha de inicio
                if (clickedTime <= endTime) {
                    setTempStart(dateStr);
                    onDateChange({ start: dateStr, end: tempEnd });
                } else {
                    // Si la nueva fecha es posterior al fin, intercambiar
                    setTempStart(tempEnd);
                    setTempEnd(dateStr);
                    onDateChange({ start: tempEnd, end: dateStr });
                }
            } else {
                // Más cerca del fin: ajustar fecha de fin
                if (clickedTime >= startTime) {
                    setTempEnd(dateStr);
                    onDateChange({ start: tempStart, end: dateStr });
                } else {
                    // Si la nueva fecha es anterior al inicio, intercambiar
                    setTempEnd(tempStart);
                    setTempStart(dateStr);
                    onDateChange({ start: dateStr, end: tempStart });
                }
            }
        }
    };

    const handleClear = () => {
        setTempStart(null);
        setTempEnd(null);
        setIsSelectingRange(false);
        onDateChange({ start: null, end: null });
    };

    const handleApply = () => {
        // Aplicar y cerrar
        if (tempStart && tempEnd) {
            onDateChange({ start: tempStart, end: tempEnd });
        }
        setIsOpen(false);
    };

    const handleToggleDropdown = () => {
        if (!isOpen) {
            // Al abrir, cargar las fechas actuales
            setTempStart(startDate);
            setTempEnd(endDate);
            setIsSelectingRange(!!startDate && !endDate);
        }
        setIsOpen(!isOpen);
    };

    // Función para determinar si un día está en el rango temporal (incluyendo hover)
    const isDayInRange = (day) => {
        if (!tempStart) return false;
        
        const dayTime = day.fullDate.getTime();
        const startTime = parseDate(tempStart).getTime();
        
        if (!tempEnd) {
            // Si no hay fecha final, no mostrar rango
            return false;
        }
        
        const endTime = parseDate(tempEnd).getTime();
        return dayTime >= startTime && dayTime <= endTime;
    };

    const isDayStart = (day) => {
        if (!tempStart) return false;
        return formatDateString(day.fullDate) === tempStart;
    };

    const isDayEnd = (day) => {
        if (!tempEnd) return false;
        return formatDateString(day.fullDate) === tempEnd;
    };

    const isToday = (day) => {
        const today = new Date();
        return day.fullDate.getDate() === today.getDate() &&
               day.fullDate.getMonth() === today.getMonth() &&
               day.fullDate.getFullYear() === today.getFullYear();
    };

    // Texto a mostrar en el trigger
    const getDisplayText = () => {
        if (parsedStart && parsedEnd) {
            const start = parsedStart.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const end = parsedEnd.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
            // Si inicio y fin son iguales, mostrar solo una fecha
            if (start === end) {
                return start;
            }
            
            return `${start} - ${end}`;
        }
        if (parsedStart) {
            return parsedStart.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        return placeholder;
    };

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={[
                    styles.label,
                    { color: error ? c.status.error : c.text.secondary }
                ]}>
                    {label}
                </Text>
            )}

            {/* Trigger Button */}
            <TouchableOpacity
                onPress={handleToggleDropdown}
                style={[
                    styles.trigger,
                    {
                        borderColor: error ? c.status.error : isOpen ? c.text.primary : c.border.primary + '80',
                        borderWidth: 2,
                        backgroundColor: c.background.surface,
                    }
                ]}
            >
                <Feather name="calendar" size={18} color={c.text.secondary} />
                <Text style={[
                    styles.triggerText,
                    { color: (parsedStart || parsedEnd) ? c.text.primary : c.text.disabled }
                ]}>
                    {getDisplayText()}
                </Text>
                <Feather 
                    name={isOpen ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color={c.text.secondary} 
                />
            </TouchableOpacity>

            {/* Dropdown Calendar */}
            {isOpen && (
                <View
                    style={[
                        styles.dropdown,
                        {
                            backgroundColor: c.background.surface,
                            borderColor: c.border.primary,
                            ...DESIGN_TOKENS.shadows.lg,
                        }
                    ]}
                >
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: c.border.primary }]}>
                        <View style={styles.monthSelector}>
                            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                                <Feather name="chevron-left" size={18} color={c.text.primary} />
                            </TouchableOpacity>
                            
                            <Text style={[styles.monthText, { color: c.text.primary }]}>
                                {MONTHS[currentMonth]} {currentYear}
                            </Text>
                            
                            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                                <Feather name="chevron-right" size={18} color={c.text.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Weekdays */}
                    <View style={styles.weekdays}>
                        {WEEKDAYS_SHORT.map((day, index) => (
                            <View key={index} style={styles.weekdayCell}>
                                <Text style={[styles.weekdayText, { color: c.text.secondary }]}>
                                    {day}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.daysGrid}>
                        {monthDays.map((day, index) => {
                            const inRange = isDayInRange(day);
                            const isStart = isDayStart(day);
                            const isEnd = isDayEnd(day);
                            const isTodayDay = isToday(day);
                            
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => day.isCurrentMonth && handleDayPress(day)}
                                    disabled={!day.isCurrentMonth}
                                    style={[
                                        styles.dayCell,
                                        inRange && { backgroundColor: c.brand.primaryLight },
                                        (isStart || isEnd) && {
                                            backgroundColor: c.brand.primary,
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        !day.isCurrentMonth && { color: c.text.disabled, opacity: 0.3 },
                                        day.isCurrentMonth && { color: c.text.primary },
                                        (isStart || isEnd) && { color: '#fff', fontWeight: '600' },
                                        isTodayDay && !isStart && !isEnd && {
                                            color: c.brand.primary,
                                            fontWeight: '600',
                                        }
                                    ]}>
                                        {day.date}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: c.border.primary }]}>
                        <TouchableOpacity onPress={handleClear}>
                            <Text style={[styles.footerButton, { color: c.text.secondary }]}>
                                Limpiar
                            </Text>
                        </TouchableOpacity>
                        
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={handleToday}>
                                <Text style={[styles.footerButton, { color: c.brand.primary }]}>
                                    Hoy
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                onPress={handleApply}
                                disabled={!tempStart || !tempEnd}
                                style={{
                                    opacity: (!tempStart || !tempEnd) ? 0.5 : 1
                                }}
                            >
                                <Text style={[styles.footerButton, { color: c.brand.primary, fontWeight: '700' }]}>
                                    Aplicar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 0,
        position: 'relative',
        zIndex: 50,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
    },
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: DESIGN_TOKENS.borderRadius.lg,
        height: 42,
    },
    triggerText: {
        flex: 1,
        fontSize: 14,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden",
        zIndex: 1000,
        maxHeight: 360, // Altura cómoda
    },
    header: {
        padding: 12,
        borderBottomWidth: 1,
    },
    monthSelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    navButton: {
        padding: 6,
    },
    monthText: {
        fontSize: 14,
        fontWeight: "600",
    },
    weekdays: {
        flexDirection: "row",
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    weekdayCell: {
        flex: 1,
        alignItems: "center",
    },
    weekdayText: {
        fontSize: 11,
        fontWeight: "600",
    },
    daysGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    dayCell: {
        width: "14.28%", // 100% / 7 días
        height: 32, // Altura equilibrada
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
    },
    dayText: {
        fontSize: 13,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
    },
    footerButton: {
        fontSize: 13,
        fontWeight: "600",
    },
});

export default DateRangeCalendar;
