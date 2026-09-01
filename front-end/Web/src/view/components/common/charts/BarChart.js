import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * Gráfica de barras reutilizable
 * 
 * @param {Array} data - Datos: [{ label, values: [{ value, color }] }]
 *   Ejemplo: [{ label: "Lun", values: [{ value: 20, color: "#10B981" }, { value: 5, color: "#F59E0B" }] }]
 * @param {number} height - Altura de la gráfica
 * @param {boolean} showGrid - Mostrar líneas de grid
 * @param {boolean} showLabels - Mostrar etiquetas
 * @param {number} barWidth - Ancho de cada barra
 * @param {number} gap - Espacio entre grupos de barras
 */
export function BarChart({
  data = [],
  height = 100,
  showGrid = false,
  showLabels = true,
  barWidth = 8,
  gap = 4,
  style,
}) {
  const { theme } = useTheme();

  if (!data.length) return null;

  // Calcular valor máximo
  const maxValue = Math.max(
    ...data.flatMap(item => 
      Array.isArray(item.values) 
        ? item.values.map(v => v.value)
        : [item.value || 0]
    )
  );

  const renderBars = (item) => {
    const values = Array.isArray(item.values) ? item.values : [{ value: item.value, color: item.color }];
    
    return (
      <View key={item.label} style={styles.barGroup}>
        <View style={[styles.barsContainer, { height }]}>
          {values.map((bar, index) => {
            const barHeight = Math.max(3, (bar.value / maxValue) * height);
            return (
              <View
                key={index}
                style={[
                  styles.bar,
                  {
                    width: barWidth,
                    height: barHeight,
                    backgroundColor: bar.color || theme.colors.brand.primary,
                  },
                ]}
              />
            );
          })}
        </View>
        {showLabels && (
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            {item.label}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { height: height + (showLabels ? 30 : 0) }, style]}>
      <View style={[styles.chart, { gap }]}>
        {data.map(renderBars)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    gap: DESIGN_TOKENS.spacing.xs,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: {
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
  },
  label: {
    fontSize: 11,
    textAlign: "center",
  },
});

export default BarChart;
