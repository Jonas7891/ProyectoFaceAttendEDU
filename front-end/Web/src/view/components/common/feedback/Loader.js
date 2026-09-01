import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

/**
 * Loader/Spinner reutilizable
 * 
 * @param {string} size - Tamaño: 'small' | 'large'
 * @param {string} message - Mensaje opcional
 * @param {boolean} fullScreen - Si ocupa toda la pantalla
 */
export function Loader({
  size = "large",
  message,
  fullScreen = false,
  style,
}) {
  const { theme } = useTheme();

  const content = (
    <>
      <ActivityIndicator size={size} color={theme.colors.brand.primary} />
      {message && (
        <Text
          style={[
            styles.message,
            { color: theme.colors.text.secondary },
          ]}
        >
          {message}
        </Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: theme.colors.background.app },
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: DESIGN_TOKENS.spacing.xl,
  },
  message: {
    marginTop: DESIGN_TOKENS.spacing.md,
    fontSize: 14,
  },
});

export default Loader;
