// ============================================================
//  FaceAttend EDU — StatsCard (Componente Genérico Reutilizable)
//
//  Tarjeta de estadística con icono, valor y descripción.
//  Reutilizable para cualquier métrica.
//
//  Uso:
//  <StatsCard
//    icon="users"
//    iconColor={theme.colors.brand.primary}
//    iconBgColor={theme.colors.brand.primaryLight}
//    label="Total de usuarios"
//    value={150}
//    description="En el sistema"
//  />
// ============================================================

import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "./Card";
import { useTheme } from "../../hooks/useTheme";
import { useResponsive } from "../../hooks/useResponsive";

/**
 * Tarjeta de estadística reutilizable
 * 
 * @param {string} icon - Nombre del icono de Feather
 * @param {string} iconColor - Color del icono
 * @param {string} iconBgColor - Color de fondo del contenedor del icono
 * @param {string} label - Etiqueta de la estadística
 * @param {number|string} value - Valor de la estadística
 * @param {string} valueColor - Color del valor (opcional)
 * @param {string} description - Descripción adicional (opcional)
 * @param {object} style - Estilos adicionales
 */
export function StatsCard({
    icon,
    iconColor,
    iconBgColor,
    label,
    value,
    valueColor,
    description,
    style,
}) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const c = theme.colors;

    return (
        <Card padding={16} style={[{ flex: 1 }, style]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: c.text.secondary, marginBottom: 4 }}>
                        {label}
                    </Text>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: valueColor || c.text.primary,
                    }}>
                        {value}
                    </Text>
                    {description && (
                        <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 2 }}>
                            {description}
                        </Text>
                    )}
                </View>
                {icon && (
                    <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: iconBgColor || c.brand.primaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Feather
                            name={icon}
                            size={24}
                            color={iconColor || c.brand.primary}
                        />
                    </View>
                )}
            </View>
        </Card>
    );
}

export default StatsCard;
