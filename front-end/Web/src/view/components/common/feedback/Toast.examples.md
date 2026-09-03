# Toast Component - Ejemplos de Uso

## 📖 Descripción

Sistema completo de notificaciones temporales tipo toast con queue automático, múltiples posiciones, animaciones y variants.

---

## ✅ Características

- ✅ 4 tipos: success, error, warning, info
- ✅ 3 posiciones: top, bottom, center
- ✅ Queue automático (máximo configurable)
- ✅ Duración configurable
- ✅ Animaciones suaves de entrada/salida
- ✅ Acciones opcionales (botones)
- ✅ Dismiss manual o automático
- ✅ Theme-aware
- ✅ API simple y familiar (similar a react-hot-toast)

---

## 🚀 Setup

### 1. Envolver la App con ToastProvider

```javascript
// App.js o Layout principal
import { ToastProvider } from "./components/common/feedback";

export default function App() {
  return (
    <ToastProvider position="top" duration={3000} maxToasts={3}>
      <YourApp />
    </ToastProvider>
  );
}
```

### 2. Usar el Hook en Componentes

```javascript
import { useToast } from "./components/common/feedback";

function MyComponent() {
  const toast = useToast();
  
  // Usar toast.success(), toast.error(), etc.
}
```

---

## 🎨 Ejemplos

### 1. Toasts Básicos

```javascript
import { useToast } from "./components/common/feedback";

function BasicExample() {
  const toast = useToast();

  return (
    <View>
      <Button onPress={() => toast.success("Operación exitosa")}>
        Success Toast
      </Button>
      
      <Button onPress={() => toast.error("Algo salió mal")}>
        Error Toast
      </Button>
      
      <Button onPress={() => toast.warning("Ten cuidado")}>
        Warning Toast
      </Button>
      
      <Button onPress={() => toast.info("Información importante")}>
        Info Toast
      </Button>
    </View>
  );
}
```

**Resultado:**
```
✓ Operación exitosa        [X]
✗ Algo salió mal           [X]
⚠ Ten cuidado              [X]
ℹ Información importante   [X]
```

---

### 2. Operaciones CRUD

```javascript
function CRUDExample() {
  const toast = useToast();

  const handleCreate = async () => {
    try {
      await createStudent({ name: "Juan" });
      toast.success("Estudiante creado exitosamente");
    } catch (error) {
      toast.error("Error al crear estudiante");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateStudent(id, { name: "María" });
      toast.success("Estudiante actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStudent(id);
      toast.success("Estudiante eliminado");
    } catch (error) {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <View>
      <Button onPress={handleCreate}>Crear</Button>
      <Button onPress={() => handleUpdate(1)}>Actualizar</Button>
      <Button onPress={() => handleDelete(1)}>Eliminar</Button>
    </View>
  );
}
```

---

### 3. Toast con Duración Custom

```javascript
function DurationExample() {
  const toast = useToast();

  return (
    <View>
      {/* Toast corto (1 segundo) */}
      <Button onPress={() => 
        toast.success("Rápido", { duration: 1000 })
      }>
        Toast Corto (1s)
      </Button>
      
      {/* Toast normal (3 segundos) - default */}
      <Button onPress={() => 
        toast.success("Normal")
      }>
        Toast Normal (3s)
      </Button>
      
      {/* Toast largo (5 segundos) */}
      <Button onPress={() => 
        toast.success("Largo", { duration: 5000 })
      }>
        Toast Largo (5s)
      </Button>
      
      {/* Toast permanente (no se cierra automáticamente) */}
      <Button onPress={() => 
        toast.info("Permanente - cierra manualmente", { duration: 0 })
      }>
        Toast Permanente
      </Button>
    </View>
  );
}
```

---

### 4. Toast con Acciones

```javascript
function ActionsExample() {
  const toast = useToast();

  const handleDelete = () => {
    toast.warning("¿Eliminar estudiante?", {
      duration: 0,  // No auto-dismiss
      action: {
        label: "Confirmar",
        onPress: async () => {
          await deleteStudent();
          toast.success("Estudiante eliminado");
        }
      }
    });
  };

  const handleSave = async () => {
    const result = await saveData();
    
    toast.success("Guardado exitosamente", {
      action: {
        label: "Ver",
        onPress: () => {
          navigation.navigate("Detail", { id: result.id });
        }
      }
    });
  };

  return (
    <View>
      <Button onPress={handleDelete}>
        Eliminar con Confirmación
      </Button>
      
      <Button onPress={handleSave}>
        Guardar con Acción
      </Button>
    </View>
  );
}
```

**Resultado:**
```
⚠ ¿Eliminar estudiante?    [Confirmar] [X]
✓ Guardado exitosamente     [Ver] [X]
```

---

### 5. Toast con Diferentes Posiciones

```javascript
function PositionsExample() {
  const toast = useToast();

  return (
    <View>
      <Button onPress={() => 
        toast.success("Toast arriba", { position: "top" })
      }>
        Top Toast
      </Button>
      
      <Button onPress={() => 
        toast.info("Toast centro", { position: "center" })
      }>
        Center Toast
      </Button>
      
      <Button onPress={() => 
        toast.success("Toast abajo", { position: "bottom" })
      }>
        Bottom Toast
      </Button>
    </View>
  );
}
```

---

### 6. Operación con Loading

```javascript
function LoadingExample() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    
    // Toast inicial
    const loadingToastId = toast.info("Importando estudiantes...", { 
      duration: 0  // No auto-dismiss
    });

    try {
      const result = await importStudents(file);
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      // Mostrar resultado
      toast.success(`${result.count} estudiantes importados`);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Error al importar estudiantes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onPress={handleImport} disabled={loading}>
      {loading ? "Importando..." : "Importar Estudiantes"}
    </Button>
  );
}
```

---

### 7. Múltiples Toasts Secuenciales

```javascript
function SequentialExample() {
  const toast = useToast();

  const handleBulkOperation = async () => {
    const students = [
      { id: 1, name: "Juan" },
      { id: 2, name: "María" },
      { id: 3, name: "Pedro" }
    ];

    for (const student of students) {
      try {
        await processStudent(student);
        toast.success(`${student.name} procesado`);
      } catch (error) {
        toast.error(`Error con ${student.name}`);
      }
      
      // Pequeña pausa entre toasts
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    toast.success("Proceso completado", {
      duration: 5000,
      position: "center"
    });
  };

  return (
    <Button onPress={handleBulkOperation}>
      Procesar Todos
    </Button>
  );
}
```

**Resultado (secuencial):**
```
✓ Juan procesado     [X]
✓ María procesado    [X]
✓ Pedro procesado    [X]
... (luego)
✓ Proceso completado [X]  (en centro)
```

---

### 8. Toast con onPress

```javascript
function OnPressExample() {
  const toast = useToast();

  const handleNotification = () => {
    toast.info("Tienes un nuevo mensaje", {
      duration: 5000,
      onPress: () => {
        // Navegar al mensaje cuando se hace tap en el toast
        navigation.navigate("Messages");
      }
    });
  };

  const handleError = (error) => {
    toast.error("Error de conexión", {
      duration: 0,
      onPress: () => {
        // Mostrar detalles del error
        Alert.alert("Error", error.message);
      }
    });
  };

  return (
    <View>
      <Button onPress={handleNotification}>
        Simular Notificación
      </Button>
      
      <Button onPress={() => handleError(new Error("Network failed"))}>
        Simular Error
      </Button>
    </View>
  );
}
```

---

### 9. Validación de Formulario

```javascript
function FormValidationExample() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: ""
  });

  const validate = () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }
    
    if (!formData.email.includes("@")) {
      toast.error("Email inválido");
      return false;
    }
    
    if (formData.age < 18) {
      toast.warning("Debes ser mayor de edad");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await submitForm(formData);
      toast.success("Formulario enviado exitosamente");
      // Reset form
      setFormData({ name: "", email: "", age: "" });
    } catch (error) {
      toast.error("Error al enviar formulario");
    }
  };

  return (
    <View>
      <TextInput 
        label="Nombre"
        value={formData.name}
        onChangeText={(name) => setFormData(prev => ({ ...prev, name }))}
      />
      
      <TextInput 
        label="Email"
        value={formData.email}
        onChangeText={(email) => setFormData(prev => ({ ...prev, email }))}
      />
      
      <TextInput 
        label="Edad"
        value={formData.age}
        onChangeText={(age) => setFormData(prev => ({ ...prev, age }))}
      />
      
      <Button onPress={handleSubmit} variant="primary">
        Enviar
      </Button>
    </View>
  );
}
```

---

### 10. Manejo de Estados de Red

```javascript
function NetworkStatusExample() {
  const toast = useToast();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Conexión restaurada", {
        position: "bottom"
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Sin conexión a internet", {
        duration: 0,  // Permanente hasta reconectar
        position: "bottom"
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <View>
      <Text>Estado: {isOnline ? "🟢 Online" : "🔴 Offline"}</Text>
    </View>
  );
}
```

---

### 11. Dismiss Programático

```javascript
function DismissExample() {
  const toast = useToast();
  const [toastId, setToastId] = useState(null);

  const showPersistentToast = () => {
    const id = toast.info("Toast permanente - usa el botón para cerrar", {
      duration: 0
    });
    setToastId(id);
  };

  const dismissToast = () => {
    if (toastId) {
      toast.dismiss(toastId);
      setToastId(null);
    }
  };

  const dismissAll = () => {
    toast.dismissAll();
  };

  return (
    <View>
      <Button onPress={showPersistentToast}>
        Mostrar Toast Permanente
      </Button>
      
      <Button onPress={dismissToast} disabled={!toastId}>
        Cerrar Toast Específico
      </Button>
      
      <Button onPress={dismissAll}>
        Cerrar Todos los Toasts
      </Button>
    </View>
  );
}
```

---

### 12. Sistema de Notificaciones Completo

```javascript
function NotificationSystemExample() {
  const toast = useToast();

  const notificationHandlers = {
    newMessage: (data) => {
      toast.info(`Mensaje de ${data.from}`, {
        duration: 4000,
        action: {
          label: "Ver",
          onPress: () => {
            navigation.navigate("Chat", { userId: data.from });
          }
        }
      });
    },

    attendanceMarked: (data) => {
      toast.success(`Asistencia registrada: ${data.studentName}`, {
        position: "bottom"
      });
    },

    reportReady: (data) => {
      toast.success("Reporte generado", {
        duration: 6000,
        action: {
          label: "Descargar",
          onPress: () => {
            downloadReport(data.reportId);
          }
        }
      });
    },

    lowAttendance: (data) => {
      toast.warning(`${data.studentName} tiene baja asistencia (${data.percentage}%)`, {
        duration: 0,
        action: {
          label: "Ver",
          onPress: () => {
            navigation.navigate("StudentDetail", { id: data.studentId });
          }
        }
      });
    },

    systemError: (error) => {
      toast.error("Error del sistema", {
        duration: 0,
        action: {
          label: "Reportar",
          onPress: () => {
            reportBug(error);
          }
        }
      });
    }
  };

  // Simular notificaciones entrantes
  useEffect(() => {
    // Suscribirse a notificaciones push, websockets, etc.
    const unsubscribe = subscribeToNotifications((notification) => {
      const handler = notificationHandlers[notification.type];
      if (handler) {
        handler(notification.data);
      }
    });

    return unsubscribe;
  }, []);

  return <YourApp />;
}
```

---

## 📋 API Reference

### ToastProvider Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | ReactNode | - | Contenido de la app |
| `position` | string | "top" | Posición por defecto: 'top', 'bottom', 'center' |
| `duration` | number | 3000 | Duración por defecto en ms |
| `maxToasts` | number | 3 | Máximo de toasts simultáneos |

### useToast() API

```typescript
{
  // Mostrar toast genérico
  show: (message: string, options?: ToastOptions) => toastId,
  
  // Shortcuts por tipo
  success: (message: string, options?: ToastOptions) => toastId,
  error: (message: string, options?: ToastOptions) => toastId,
  warning: (message: string, options?: ToastOptions) => toastId,
  info: (message: string, options?: ToastOptions) => toastId,
  
  // Dismiss
  dismiss: (toastId: number) => void,
  dismissAll: () => void
}
```

### ToastOptions

```typescript
{
  type?: 'success' | 'error' | 'warning' | 'info',
  duration?: number,  // ms, 0 = permanente
  position?: 'top' | 'bottom' | 'center',
  action?: {
    label: string,
    onPress: () => void
  },
  onPress?: () => void  // Callback al hacer tap en el toast
}
```

---

## 🎯 Mejores Prácticas

### ✅ Hacer

1. **Usar mensajes cortos y claros:**
   ```javascript
   toast.success("Guardado");  // ✅
   toast.error("Error al guardar");  // ✅
   ```

2. **Usar el tipo apropiado:**
   ```javascript
   toast.success("Operación exitosa");  // ✅ Para éxitos
   toast.error("Algo falló");           // ✅ Para errores
   toast.warning("Ten cuidado");        // ✅ Para advertencias
   toast.info("FYI");                   // ✅ Para información
   ```

3. **Agregar acciones cuando sea útil:**
   ```javascript
   toast.success("Guardado", {
     action: {
       label: "Ver",
       onPress: () => navigate("Detail")
     }
   });
   ```

4. **Usar duration: 0 para toasts críticos:**
   ```javascript
   toast.error("Error crítico", { duration: 0 });
   ```

### ❌ Evitar

1. **No usar toasts para mensajes largos:**
   ```javascript
   // ❌ Mal
   toast.info("Este es un mensaje muy largo que explica muchos detalles...");
   
   // ✅ Bien - Usa Alert o Modal
   Alert.alert("Título", "Mensaje largo...");
   ```

2. **No abusar de toasts permanentes:**
   ```javascript
   // ❌ Mal - Demasiados permanentes
   toast.info("Mensaje 1", { duration: 0 });
   toast.info("Mensaje 2", { duration: 0 });
   
   // ✅ Bien
   toast.info("Mensaje", { duration: 3000 });  // Auto-dismiss
   ```

3. **No usar toasts para input del usuario:**
   ```javascript
   // ❌ Mal
   toast.warning("¿Estás seguro?");  // No puede responder
   
   // ✅ Bien - Usa Alert/Modal
   Alert.alert("Confirmar", "¿Estás seguro?", [
     { text: "Cancelar" },
     { text: "OK", onPress: handleConfirm }
   ]);
   ```

---

## 🔗 Componentes Relacionados

- **Alert** - Para mensajes en contexto (no overlay)
- **Modal** - Para diálogos que requieren atención
- **Loader** - Para estados de carga

---

## 📝 Notas de Implementación

- El sistema usa un Context Provider para manejar el estado global
- Los toasts se apilan automáticamente (max configurable)
- Las animaciones usan Animated API de React Native
- Los toasts antiguos se eliminan automáticamente si se excede maxToasts
- Compatible con React Native Web y Mobile

---

**Versión:** 1.0  
**Creado:** Fase 3 - Tarea #3  
**Mantenido por:** Equipo de desarrollo FaceAttend EDU
