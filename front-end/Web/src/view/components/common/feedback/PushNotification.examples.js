// ============================================================
//  PushNotification - Ejemplos de uso
// ============================================================
//  Este archivo contiene ejemplos de cómo usar el sistema de
//  notificaciones push en diferentes contextos y módulos.
// ============================================================

import { usePushNotification } from "./PushNotification";

// ══════════════════════════════════════════════════════════════
//  EJEMPLO 1: Notificación simple de éxito
// ══════════════════════════════════════════════════════════════

export function ExampleSuccessNotification() {
    const pushNotification = usePushNotification();

    const handleSaveSuccess = () => {
        pushNotification.success(
            "Guardado exitoso",
            "Los cambios se guardaron correctamente"
        );
    };

    return <button onClick={handleSaveSuccess}>Guardar</button>;
}

// ══════════════════════════════════════════════════════════════
//  EJEMPLO 2: Notificación con navegación
// ══════════════════════════════════════════════════════════════

export function ExampleNotificationWithNavigation() {
    const pushNotification = usePushNotification();

    const handleNewAttendance = (student) => {
        // Cuando se registra asistencia facial, notificar y permitir navegar al perfil
        pushNotification.show({
            title: "Asistencia registrada",
            message: `${student.name} ha sido registrado exitosamente`,
            type: "success",
            duration: 8000,
            source: "facial-recognition",
            priority: "high",
            navigation: {
                screen: "Students",
                params: { studentId: student.id }
            }
        });
    };

    return null;
}

// ══════════════════════════════════════════════════════════════
//  EJEMPLO 3: Notificación de advertencia con acción
// ══════════════════════════════════════════════════════════════

export function ExampleWarningWithAction() {
    const pushNotification = usePushNotification();

    const handleLowAttendance = (student) => {
        pushNotification.show({
            title: "⚠️ Estudiante en riesgo",
            message: `${student.name} tiene ${student.attendance}% de asistencia`,
            type: "warning",
            duration: 0, // No se cierra automáticamente
            priority: "urgent",
            source: "attendance-monitor",
            action: {
                label: "Ver detalles",
                onPress: () => {
                    // Abrir modal de detalles o navegar
                    console.log("Abriendo detalles de", student.name);
                }
            }
        });
    };

    return null;
}

// ══════════════════════════════════════════════════════════════
//  EJEMPLO 4: Notificación de error crítico
// ══════════════════════════════════════════════════════════════

export function ExampleErrorNotification() {
    const pushNotification = usePushNotification();

    const handleCriticalError = async () => {
        try {
            await someApiCall();
        } catch (error) {
            pushNotification.error(
                "Error de conexión",
                "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
                {
                    duration: 10000,
                    priority: "high",
                    action: {
                        label: "Reintentar",
                        onPress: () => {
                            handleCriticalError(); // Reintentar
                        }
                    }
                }
            );
        }
    };

    return null;
}

// ══════════════════════════════════════════════════════════════
//  EJEMPLO 5: Notificación de información con datos personalizados
// ══════════════════════════════════════════════════════════════

export function ExampleInfoWithCustomData() {
    const pushNotification = usePushNotification();

    const handlePeriodExpiration = (daysLeft) => {
        pushNotification.info(
            "Período académico próximo a finalizar",
            `Quedan ${daysLeft} días para el fin del período actual`,
            {
                duration: 15000,
                priority: "normal",
                source: "academic-calendar",
                data: {
                    daysLeft,
                    periodEnd: "2024-12-31"
                },
                onDismiss: () => {
                    console.log("Usuario cerró la notificación de período");
                }
            }
        );
    };

    return null;
}

// ══════════════════════════════════════════════════════════════
//  EJEMPLO 6: Uso en contexto de reconocimiento facial
// ══════════════════════════════════════════════════════════════

export function FacialRecognitionNotifications() {
    const pushNotification = usePushNotification();

    // Caso 1: Reconocimiento exitoso
    const notifySuccessfulRecognition = (student) => {
        pushNotification.success(
            `¡Bienvenido, ${student.name}!`,
            "Tu asistencia ha sido registrada",
            {
                duration: 5000,
                icon: "user-check",
                source: "facial-scanner",
                navigation: {
                    screen: "Dashboard",
                    params: { highlight: "recent-attendance" }
                }
            }
        );
    };

    // Caso 2: Rostro no reconocido
    const notifyUnrecognizedFace = () => {
        pushNotification.warning(
            "Rostro no reconocido",
            "No pudimos identificarte. Por favor, regístrate primero.",
            {
                duration: 8000,
                source: "facial-scanner",
                action: {
                    label: "Registrarse",
                    onPress: () => {
                        // Navegar a registro facial
                    }
                }
            }
        );
    };

    // Caso 3: Confianza baja en reconocimiento
    const notifyLowConfidence = (student, confidence) => {
        pushNotification.warning(
            "Verificación requerida",
            `Reconocimiento de ${student.name} con ${confidence}% de confianza. Se requiere confirmación manual.`,
            {
                duration: 0, // No cerrar automáticamente
                priority: "high",
                source: "facial-scanner",
                action: {
                    label: "Confirmar",
                    onPress: () => {
                        // Confirmar manualmente
                    }
                }
            }
        );
    };

    return { 
        notifySuccessfulRecognition, 
        notifyUnrecognizedFace, 
        notifyLowConfidence 
    };
}

// ══════════════════════════════════════════════════════════════
//  EJEMPLO 7: Uso en módulo de reportes
// ══════════════════════════════════════════════════════════════

export function ReportsNotifications() {
    const pushNotification = usePushNotification();

    const notifyReportGenerated = (reportType) => {
        pushNotification.success(
            "Reporte generado",
            `Tu reporte de ${reportType} está listo para descargar`,
            {
                duration: 10000,
                source: "reports",
                action: {
                    label: "Descargar",
                    onPress: () => {
                        // Trigger download
                    }
                }
            }
        );
    };

    const notifyReportError = (error) => {
        pushNotification.error(
            "Error al generar reporte",
            error.message || "Ocurrió un error desconocido",
            {
                duration: 0,
                priority: "high",
                source: "reports"
            }
        );
    };

    return { notifyReportGenerated, notifyReportError };
}

// ══════════════════════════════════════════════════════════════
//  EJEMPLO 8: Notificaciones de sistema/mantenimiento
// ══════════════════════════════════════════════════════════════

export function SystemNotifications() {
    const pushNotification = usePushNotification();

    const notifyMaintenance = (startTime, duration) => {
        pushNotification.show({
            title: "🔧 Mantenimiento programado",
            message: `El sistema estará en mantenimiento el ${startTime} durante ${duration}`,
            type: "info",
            duration: 0, // Mantener visible
            priority: "urgent",
            source: "system",
            icon: "alert-circle"
        });
    };

    const notifyUpdate = (version) => {
        pushNotification.info(
            "Nueva versión disponible",
            `FaceAttend EDU ${version} está disponible. Actualiza para obtener las últimas mejoras.`,
            {
                duration: 0,
                priority: "normal",
                source: "system",
                action: {
                    label: "Actualizar",
                    onPress: () => {
                        // Trigger update
                        window.location.reload();
                    }
                }
            }
        );
    };

    return { notifyMaintenance, notifyUpdate };
}

// ══════════════════════════════════════════════════════════════
//  EJEMPLO 9: Uso con duración desde configuración
// ══════════════════════════════════════════════════════════════

export function NotificationsWithConfigDuration() {
    const pushNotification = usePushNotification();
    
    // Obtener duración desde la configuración del sistema
    const getConfiguredDuration = () => {
        const config = getInstitutionConfig(); // De institutionConfig.js
        return (config.pushDuration || 5) * 1000; // Convertir a milisegundos
    };

    const showConfiguredNotification = (title, message, type = "info") => {
        pushNotification.show({
            title,
            message,
            type,
            duration: getConfiguredDuration(), // Usar duración de settings
            source: "app"
        });
    };

    return { showConfiguredNotification };
}

// ══════════════════════════════════════════════════════════════
//  NOTAS DE USO
// ══════════════════════════════════════════════════════════════

/*
INTEGRACIÓN EN APP.JS o LAYOUT PRINCIPAL:

import { PushNotificationProvider } from "./view/components/common/feedback";
import { useNavigation } from "@react-navigation/native";

function App() {
    const navigation = useNavigation();
    
    const handleNavigate = ({ screen, params }) => {
        navigation.navigate(screen, params);
    };
    
    return (
        <PushNotificationProvider 
            defaultDuration={5000}
            maxNotifications={5}
            onNavigate={handleNavigate}
        >
            <YourAppContent />
        </PushNotificationProvider>
    );
}

PRIORIDADES:
- low: Notificaciones informativas de baja importancia
- normal: Notificaciones estándar del sistema
- high: Alertas importantes que requieren atención
- urgent: Notificaciones críticas (errores graves, seguridad, etc.)

DURACIÓN:
- 0: No se cierra automáticamente (usuario debe cerrar)
- 1-5 segundos: Notificaciones muy breves
- 5-15 segundos: Notificaciones normales (recomendado)
- 15-60 segundos: Notificaciones importantes
- 60+ segundos: Notificaciones críticas o con acción requerida

TIPOS:
- info: Información general (azul)
- success: Operaciones exitosas (verde)
- warning: Advertencias (amarillo/naranja)
- error: Errores (rojo)
- custom: Personalizado (gris, permite personalización total)
*/
