// ============================================================
//  PushNotification — Sistema de notificaciones push parametrizable
//
//  Sistema completo de notificaciones tipo popup que pueden:
//  - Aparecer desde cualquier módulo
//  - Redirigir a cualquier pantalla
//  - Tener duración configurable
//  - Ser completamente parametrizables
//
//  Características:
//  - Soporte para múltiples tipos (info, success, warning, error, custom)
//  - Navegación integrada con onNavigate callback
//  - Duración configurable desde settings (segundos a minutos)
//  - Animaciones suaves de entrada/salida
//  - Acciones personalizables
//  - Agrupación por prioridad
// ============================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { DESIGN_TOKENS } from "../../../../core/config/theme.config";

// ══════════════════════════════════════════════════════════════
//  Push Notification Context
// ══════════════════════════════════════════════════════════════

const PushNotificationContext = createContext(null);

let notificationId = 0;

/**
 * PushNotificationProvider - Proveedor del sistema de notificaciones push
 * 
 * Debe envolver la aplicación para que las notificaciones sean accesibles globalmente.
 * 
 * @param {ReactNode} children - Contenido de la aplicación
 * @param {number} defaultDuration - Duración por defecto en milisegundos (puede ser sobrescrita)
 * @param {number} maxNotifications - Máximo de notificaciones simultáneas
 * @param {function} onNavigate - Callback global para navegación (recibe { screen, params })
 * 
 * @example
 * <PushNotificationProvider 
 *   defaultDuration={5000} 
 *   maxNotifications={5}
 *   onNavigate={({ screen, params }) => navigation.navigate(screen, params)}
 * >
 *   <App />
 * </PushNotificationProvider>
 */
export function PushNotificationProvider({ 
  children, 
  defaultDuration = 5000,
  maxNotifications = 5,
  onNavigate 
}) {
  const [notifications, setNotifications] = useState([]);

  /**
   * Mostrar una notificación push
   * 
   * @param {object} config - Configuración de la notificación
   * @param {string} config.title - Título de la notificación
   * @param {string} config.message - Mensaje de la notificación
   * @param {('info'|'success'|'warning'|'error'|'custom')} config.type - Tipo de notificación
   * @param {number} config.duration - Duración en ms (0 = no se cierra automáticamente)
   * @param {string} config.icon - Icono personalizado (Feather icon name)
   * @param {object} config.navigation - Objeto de navegación { screen, params }
   * @param {object} config.action - Acción personalizada { label, onPress }
   * @param {string} config.source - Módulo/pantalla desde donde se origina
   * @param {('low'|'normal'|'high'|'urgent')} config.priority - Prioridad de la notificación
   * @param {object} config.data - Datos adicionales para la notificación
   * @param {function} config.onPress - Callback al hacer click en la notificación
   * @param {function} config.onDismiss - Callback al cerrar la notificación
   * 
   * @returns {number} ID de la notificación
   */
  const show = (config) => {
    const id = notificationId++;
    const notification = {
      id,
      title: config.title || "Notificación",
      message: config.message || "",
      type: config.type || "info",
      duration: config.duration !== undefined ? config.duration : defaultDuration,
      icon: config.icon,
      navigation: config.navigation,
      action: config.action,
      source: config.source || "system",
      priority: config.priority || "normal",
      data: config.data || {},
      onPress: config.onPress,
      onDismiss: config.onDismiss,
      timestamp: Date.now(),
    };

    setNotifications((prev) => {
      const newNotifications = [...prev, notification];
      
      // Ordenar por prioridad
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      newNotifications.sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      // Limitar notificaciones simultáneas
      if (newNotifications.length > maxNotifications) {
        return newNotifications.slice(0, maxNotifications);
      }
      return newNotifications;
    });

    // Auto-dismiss si tiene duración
    if (notification.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, notification.duration);
    }

    return id;
  };

  const dismiss = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification?.onDismiss) {
      notification.onDismiss();
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  const handleNavigate = (navigation) => {
    if (navigation && onNavigate) {
      onNavigate(navigation);
    }
  };

  // API con shortcuts por tipo
  const pushNotification = {
    show,
    
    // Shortcuts por tipo
    info: (title, message, options = {}) => 
      show({ title, message, type: "info", ...options }),
      
    success: (title, message, options = {}) => 
      show({ title, message, type: "success", ...options }),
      
    warning: (title, message, options = {}) => 
      show({ title, message, type: "warning", ...options }),
      
    error: (title, message, options = {}) => 
      show({ title, message, type: "error", ...options }),
    
    // Notificación con navegación
    withNavigation: (title, message, screen, params = {}, options = {}) =>
      show({ 
        title, 
        message, 
        navigation: { screen, params },
        ...options 
      }),
    
    dismiss,
    dismissAll,
  };

  return (
    <PushNotificationContext.Provider value={pushNotification}>
      {children}
      <PushNotificationContainer 
        notifications={notifications} 
        onDismiss={dismiss}
        onNavigate={handleNavigate}
      />
    </PushNotificationContext.Provider>
  );
}

// ══════════════════════════════════════════════════════════════
//  usePushNotification Hook
// ══════════════════════════════════════════════════════════════

/**
 * usePushNotification - Hook para usar el sistema de notificaciones push
 * 
 * @returns {object} API de notificaciones push
 * 
 * @example
 * function MyComponent() {
 *   const pushNotification = usePushNotification();
 *   
 *   const handleNewAttendance = (student) => {
 *     pushNotification.success(
 *       "Asistencia registrada",
 *       `${student.name} ha sido registrado`,
 *       {
 *         duration: 8000,
 *         navigation: { screen: "Students", params: { studentId: student.id } },
 *         source: "facial-recognition",
 *         priority: "high"
 *       }
 *     );
 *   };
 * }
 */
export function usePushNotification() {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error("usePushNotification debe usarse dentro de PushNotificationProvider");
  }
  return context;
}

// ══════════════════════════════════════════════════════════════
//  Push Notification Container
// ══════════════════════════════════════════════════════════════

function PushNotificationContainer({ notifications, onDismiss, onNavigate }) {
  if (notifications.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((notification) => (
        <PushNotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
          onNavigate={onNavigate}
        />
      ))}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
//  Push Notification Item
// ══════════════════════════════════════════════════════════════

function PushNotificationItem({ notification, onDismiss, onNavigate }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [animation] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Animación de entrada
    Animated.spring(animation, {
      toValue: 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();

    // Animación de barra de progreso si tiene duración
    if (notification.duration > 0) {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: notification.duration,
        useNativeDriver: false,
      }).start();
    }
  }, []);

  const handleDismiss = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss(notification.id);
    });
  };

  const handlePress = () => {
    if (notification.onPress) {
      notification.onPress(notification);
    } else if (notification.navigation) {
      onNavigate(notification.navigation);
    }
    handleDismiss();
  };

  // Configuración por tipo
  const typeConfig = {
    success: {
      icon: "check-circle",
      bgColor: c.status.successLight || "#D1FAE5",
      iconColor: c.status.success || "#10B981",
      textColor: "#065F46",
      borderColor: c.status.success || "#10B981",
    },
    error: {
      icon: "alert-circle",
      bgColor: c.status.dangerLight || "#FEE2E2",
      iconColor: c.status.danger || "#EF4444",
      textColor: "#991B1B",
      borderColor: c.status.danger || "#EF4444",
    },
    warning: {
      icon: "alert-triangle",
      bgColor: c.status.warningLight || "#FEF3C7",
      iconColor: c.status.warning || "#F59E0B",
      textColor: "#92400E",
      borderColor: c.status.warning || "#F59E0B",
    },
    info: {
      icon: "info",
      bgColor: c.brand.primaryLight || "#DBEAFE",
      iconColor: c.brand.primary || "#3B82F6",
      textColor: "#1E40AF",
      borderColor: c.brand.primary || "#3B82F6",
    },
    custom: {
      icon: "bell",
      bgColor: c.background.surface || "#FFFFFF",
      iconColor: c.text.primary || "#1F2937",
      textColor: c.text.primary || "#1F2937",
      borderColor: c.border.primary || "#E5E7EB",
    },
  };

  const config = typeConfig[notification.type] || typeConfig.info;
  const displayIcon = notification.icon || config.icon;

  // Transform para entrada
  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const opacity = animation;

  // Width de la barra de progreso
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const isPressable = !!(notification.onPress || notification.navigation);

  return (
    <Animated.View
      style={[
        styles.notification,
        {
          backgroundColor: config.bgColor,
          borderLeftColor: config.borderColor,
          transform: [{ translateX }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={handlePress}
        disabled={!isPressable}
        activeOpacity={isPressable ? 0.7 : 1}
      >
        {/* Icono principal */}
        <View style={[styles.iconContainer, { backgroundColor: config.iconColor + "20" }]}>
          <Feather name={displayIcon} size={22} color={config.iconColor} />
        </View>

        {/* Contenido */}
        <View style={styles.contentContainer}>
          {/* Título */}
          <View style={styles.headerRow}>
            <Text
              style={[styles.title, { color: config.textColor }]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            
            {/* Badge de origen/fuente */}
            {notification.source && notification.source !== "system" && (
              <View style={[styles.badge, { backgroundColor: config.iconColor + "20" }]}>
                <Text style={[styles.badgeText, { color: config.iconColor }]}>
                  {notification.source}
                </Text>
              </View>
            )}
          </View>

          {/* Mensaje */}
          <Text
            style={[styles.message, { color: config.textColor }]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>

          {/* Acción personalizada */}
          {notification.action && (
            <TouchableOpacity
              onPress={() => {
                notification.action.onPress(notification);
                handleDismiss();
              }}
              style={[styles.actionButton, { borderColor: config.iconColor }]}
            >
              <Text style={[styles.actionButtonText, { color: config.iconColor }]}>
                {notification.action.label}
              </Text>
            </TouchableOpacity>
          )}

          {/* Indicador de navegación */}
          {notification.navigation && !notification.action && (
            <View style={styles.navigationHint}>
              <Feather name="arrow-right" size={12} color={config.iconColor} />
              <Text style={[styles.navigationText, { color: config.iconColor }]}>
                Toca para ver más
              </Text>
            </View>
          )}
        </View>

        {/* Botón de cerrar */}
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={18} color={config.textColor} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Barra de progreso de auto-dismiss */}
      {notification.duration > 0 && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: config.iconColor,
              width: progressWidth,
            },
          ]}
        />
      )}
    </Animated.View>
  );
}

// ══════════════════════════════════════════════════════════════
//  Styles
// ══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 60,
    right: Platform.OS === "web" ? 20 : 16,
    width: Platform.OS === "web" ? 420 : "90%",
    maxWidth: 420,
    zIndex: 99999,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  notification: {
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  notificationContent: {
    flexDirection: "row",
    padding: DESIGN_TOKENS.spacing.md,
    gap: DESIGN_TOKENS.spacing.sm,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: DESIGN_TOKENS.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  actionButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  navigationHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  navigationText: {
    fontSize: 11,
    fontWeight: "500",
  },
  closeButton: {
    padding: 4,
  },
  progressBar: {
    height: 3,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
});

// ══════════════════════════════════════════════════════════════
//  Exports
// ══════════════════════════════════════════════════════════════

export default { PushNotificationProvider, usePushNotification };
