// ============================================================
//  DateRangePicker — Selector de rango de fechas para períodos académicos
// ============================================================
//  Permite seleccionar fecha de inicio y fin del período académico
//  con validación automática según el tipo de período (trimestral,
//  cuatrimestral, semestral, anual).
//
//  Features:
//  - Validación de duración máxima según tipo de período
//  - Formato de fecha consistente (YYYY-MM-DD)
//  - Indicadores visuales de validación
//  - Cálculo automático de duración en días/semanas/meses
// ============================================================

import React, { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../../../i18n/hooks/useTranslation";
import { ACADEMIC_PERIOD_TYPES } from "../../../../core/constants/academicPeriods";

/**
 * Componente para seleccionar rango de fechas del período académico
 * 
 * @param {Object} props
 * @param {string} props.startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} props.endDate - Fecha de fin en formato YYYY-MM-DD
 * @param {function} props.onStartDateChange - Callback cuando cambia fecha inicio
 * @param {function} props.onEndDateChange - Callback cuando cambia fecha fin
 * @param {string} props.periodType - Tipo de período (trimestral, semestral, etc.)
 */
export function DateRangePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    periodType = ACADEMIC_PERIOD_TYPES.TRIMESTRAL,
}) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    // Estados para validación en tiempo real
    const [startDateError, setStartDateError] = useState("");
    const [endDateError, setEndDateError] = useState("");

    // Configuración de duración máxima según tipo de período
    const maxDurationMonths = useMemo(() => {
        switch (periodType) {
            case ACADEMIC_PERIOD_TYPES.ANNUAL:
                return 12; // 1 año
            case ACADEMIC_PERIOD_TYPES.SEMESTRAL:
                return 6; // 6 meses
            case ACADEMIC_PERIOD_TYPES.QUARTERLY:
                return 4; // 4 meses
            case ACADEMIC_PERIOD_TYPES.TRIMESTRAL:
                return 3; // 3 meses
            default:
                return 3;
        }
    }, [periodType]);

    // Validar formato de fecha YYYY-MM-DD
    const isValidDateFormat = (dateStr) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateStr)) return false;

        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date);
    };

    // Calcular diferencia en días entre dos fechas
    const getDaysDifference = (start, end) => {
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        return Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
    };

    // Calcular diferencia en meses aproximados
    const getMonthsDifference = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        return (
            (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            (endDate.getMonth() - startDate.getMonth())
        );
    };

    // Validar rango de fechas completo
    const validation = useMemo(() => {
        if (!startDate || !endDate) {
            return {
                isValid: false,
                days: 0,
                weeks: 0,
                months: 0,
                message: t("Selecciona ambas fechas"),
                type: "info",
            };
        }

        if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
            return {
                isValid: false,
                days: 0,
                weeks: 0,
                months: 0,
                message: t("Formato de fecha inválido (usa AAAA-MM-DD)"),
                type: "error",
            };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return {
                isValid: false,
                days: 0,
                weeks: 0,
                months: 0,
                message: t("La fecha de fin debe ser posterior a la fecha de inicio"),
                type: "error",
            };
        }

        const days = getDaysDifference(startDate, endDate);
        const weeks = Math.round(days / 7);
        const months = getMonthsDifference(startDate, endDate);

        // Validar duración máxima según tipo de período
        if (months > maxDurationMonths) {
            return {
                isValid: false,
                days,
                weeks,
                months,
                message: t(`Un período ${periodType} no puede durar más de ${maxDurationMonths} meses`),
                type: "error",
            };
        }

        // Duración mínima: al menos 4 semanas
        if (days < 28) {
            return {
                isValid: false,
                days,
                weeks,
                months,
                message: t("El período debe durar al menos 4 semanas (28 días)"),
                type: "error",
            };
        }

        return {
            isValid: true,
            days,
            weeks,
            months,
            message: t("Rango de fechas válido"),
            type: "success",
        };
    }, [startDate, endDate, periodType, maxDurationMonths, t]);

    // Manejadores de cambio con validación
    const handleStartDateChange = (text) => {
        onStartDateChange(text);
        if (text && !isValidDateFormat(text)) {
            setStartDateError(t("Formato inválido (AAAA-MM-DD)"));
        } else {
            setStartDateError("");
        }
    };

    const handleEndDateChange = (text) => {
        onEndDateChange(text);
        if (text && !isValidDateFormat(text)) {
            setEndDateError(t("Formato inválido (AAAA-MM-DD)"));
        } else {
            setEndDateError("");
        }
    };

    // Sugerir fechas según tipo de período
    const suggestDates = () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + maxDurationMonths);
        end.setDate(0); // Último día del mes anterior

        onStartDateChange(start.toISOString().split('T')[0]);
        onEndDateChange(end.toISOString().split('T')[0]);
    };

    const inputStyle = {
        height: 44,
        borderWidth: 1.5,
        borderColor: c.border.primary,
        borderRadius: 14,
        paddingHorizontal: 14,
        fontSize: 11,
        color: c.text.primary,
        backgroundColor: c.background.surface,
    };

    const labelStyle = {
        fontSize: 10,
        fontWeight: "500",
        color: c.text.primary,
        marginBottom: 6,
    };

    const errorInputStyle = {
        ...inputStyle,
        borderColor: c.status.danger,
    };

    const successInputStyle = {
        ...inputStyle,
        borderColor: c.status.success,
    };

    return (
        <View style={{ gap: 12 }}>
            {/* Campos de entrada de fecha */}
            <View style={{ flexDirection: "row", gap: 12 }}>
                {/* Fecha de inicio */}
                <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>{t("Fecha de inicio")}</Text>
                    <View style={{ position: "relative" }}>
                        <TextInput
                            value={startDate}
                            onChangeText={handleStartDateChange}
                            style={
                                startDateError
                                    ? errorInputStyle
                                    : validation.isValid
                                    ? successInputStyle
                                    : inputStyle
                            }
                            placeholder="AAAA-MM-DD"
                            placeholderTextColor={c.text.disabled}
                        />
                        {validation.isValid && (
                            <View
                                style={{
                                    position: "absolute",
                                    right: 12,
                                    top: 12,
                                }}
                            >
                                <Feather
                                    name="check-circle"
                                    size={18}
                                    color={c.status.success}
                                />
                            </View>
                        )}
                    </View>
                    {startDateError && (
                        <Text
                            style={{
                                fontSize: 11,
                                color: c.status.danger,
                                marginTop: 4,
                            }}
                        >
                            {startDateError}
                        </Text>
                    )}
                </View>

                {/* Fecha de fin */}
                <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>{t("Fecha de fin")}</Text>
                    <View style={{ position: "relative" }}>
                        <TextInput
                            value={endDate}
                            onChangeText={handleEndDateChange}
                            style={
                                endDateError
                                    ? errorInputStyle
                                    : validation.isValid
                                    ? successInputStyle
                                    : inputStyle
                            }
                            placeholder="AAAA-MM-DD"
                            placeholderTextColor={c.text.disabled}
                        />
                        {validation.isValid && (
                            <View
                                style={{
                                    position: "absolute",
                                    right: 12,
                                    top: 12,
                                }}
                            >
                                <Feather
                                    name="check-circle"
                                    size={18}
                                    color={c.status.success}
                                />
                            </View>
                        )}
                    </View>
                    {endDateError && (
                        <Text
                            style={{
                                fontSize: 11,
                                color: c.status.danger,
                                marginTop: 4,
                            }}
                        >
                            {endDateError}
                        </Text>
                    )}
                </View>
            </View>

            {/* Botón de sugerencia automática */}
            <Pressable
                onPress={suggestDates}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: c.brand.primaryLight,
                    borderRadius: 10,
                    alignSelf: "flex-start",
                }}
            >
                <Feather name="zap" size={14} color={c.brand.primary} />
                <Text
                    style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: c.brand.primary,
                    }}
                >
                    {t("Sugerir fechas automáticamente")}
                </Text>
            </Pressable>

            {/* Indicador de validación y estadísticas */}
            <View
                style={{
                    backgroundColor:
                        validation.type === "success"
                            ? c.status.successLight
                            : validation.type === "error"
                            ? c.status.dangerLight
                            : c.status.infoLight,
                    borderRadius: 14,
                    padding: 12,
                    flexDirection: "row",
                    gap: 8,
                }}
            >
                <Feather
                    name={
                        validation.type === "success"
                            ? "check-circle"
                            : validation.type === "error"
                            ? "alert-circle"
                            : "info"
                    }
                    size={16}
                    color={
                        validation.type === "success"
                            ? c.status.success
                            : validation.type === "error"
                            ? c.status.danger
                            : c.status.info
                    }
                    style={{ marginTop: 1 }}
                />
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color:
                                validation.type === "success"
                                    ? "#065F46"
                                    : validation.type === "error"
                                    ? "#991B1B"
                                    : "#1E3A8A",
                            marginBottom: validation.isValid ? 6 : 0,
                        }}
                    >
                        {validation.message}
                    </Text>
                    {validation.isValid && (
                        <View style={{ flexDirection: "row", gap: 16 }}>
                            <Text
                                style={{
                                    fontSize: 11,
                                    color: "#065F46",
                                }}
                            >
                                📅 {validation.days} {t("días")}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 11,
                                    color: "#065F46",
                                }}
                            >
                                📊 {validation.weeks} {t("semanas")}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 11,
                                    color: "#065F46",
                                }}
                            >
                                📆 ~{validation.months} {t("meses")}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

export default DateRangePicker;
