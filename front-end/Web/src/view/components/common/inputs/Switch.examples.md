# Switch Component - Ejemplos de Uso

## 📖 Descripción

Componente Switch (toggle on/off) theme-aware, wrapper del Switch nativo de React Native con styling consistente y labels opcionales.

---

## ✅ Características

- ✅ Toggle on/off simple
- ✅ 5 variants: default, primary, success, warning, danger
- ✅ 3 tamaños (afectan labels): sm, md, lg
- ✅ Label y descripción opcionales
- ✅ Estados: disabled, error
- ✅ Theme-aware (colores del tema)
- ✅ Compatible con iOS y Android
- ✅ Usa componente nativo (mejor performance)

---

## 🎨 Ejemplos

### 1. Switch Básico

```javascript
import { Switch } from "./components/common/inputs";

function BasicExample() {
  const [isActive, setIsActive] = useState(false);

  return (
    <Switch 
      value={isActive}
      onValueChange={setIsActive}
      label="Activo"
    />
  );
}
```

**Resultado:**
```
[⚪──] Activo     (OFF)
[──⚪] Activo     (ON)
```

---

### 2. Switch con Descripción

```javascript
function WithDescriptionExample() {
  const [notifications, setNotifications] = useState(true);

  return (
    <Switch 
      value={notifications}
      onValueChange={setNotifications}
      label="Notificaciones por email"
      description="Recibe alertas sobre asistencia y reportes semanales"
    />
  );
}
```

**Resultado:**
```
[──⚪] Notificaciones por email
      Recibe alertas sobre asistencia y reportes semanales
```

---

### 3. Switches con Variants

```javascript
function VariantsExample() {
  const [settings, setSettings] = useState({
    active: true,
    premium: true,
    alerts: true,
    maintenance: false
  });

  return (
    <View>
      <Switch 
        value={settings.active}
        onValueChange={(v) => setSettings(s => ({ ...s, active: v }))}
        label="Estado activo"
        variant="success"
      />
      
      <Switch 
        value={settings.premium}
        onValueChange={(v) => setSettings(s => ({ ...s, premium: v }))}
        label="Cuenta Premium"
        variant="primary"
      />
      
      <Switch 
        value={settings.alerts}
        onValueChange={(v) => setSettings(s => ({ ...s, alerts: v }))}
        label="Alertas críticas"
        variant="warning"
      />
      
      <Switch 
        value={settings.maintenance}
        onValueChange={(v) => setSettings(s => ({ ...s, maintenance: v }))}
        label="Modo mantenimiento"
        variant="danger"
      />
    </View>
  );
}
```

---

### 4. Switch Deshabilitado

```javascript
function DisabledExample() {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState(false);

  return (
    <View>
      <Switch 
        value={hasSubscription}
        onValueChange={setHasSubscription}
        label="Suscripción activa"
      />
      
      <Divider />
      
      <Switch 
        value={premiumFeature}
        onValueChange={setPremiumFeature}
        label="Funcionalidad Premium"
        description="Solo disponible en plan Pro"
        disabled={!hasSubscription}
      />
    </View>
  );
}
```

**Resultado (cuando disabled):**
```
[──⚪] Suscripción activa

[⚪──] Funcionalidad Premium (opaco)
      Solo disponible en plan Pro
```

---

### 5. Panel de Configuración

```javascript
function SettingsPanel() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    monthlyReport: false,
    darkMode: false,
    autoSave: true,
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView>
      <Card>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        
        <Switch 
          value={settings.emailNotifications}
          onValueChange={(v) => updateSetting('emailNotifications', v)}
          label="Notificaciones por email"
          description="Recibe alertas en tu correo"
        />
        
        <Switch 
          value={settings.pushNotifications}
          onValueChange={(v) => updateSetting('pushNotifications', v)}
          label="Notificaciones push"
          description="Recibe notificaciones en tiempo real"
        />
        
        <Divider />
        
        <Text style={styles.sectionTitle}>Reportes</Text>
        
        <Switch 
          value={settings.weeklyReport}
          onValueChange={(v) => updateSetting('weeklyReport', v)}
          label="Reporte semanal"
          description="Recibe resumen cada lunes"
        />
        
        <Switch 
          value={settings.monthlyReport}
          onValueChange={(v) => updateSetting('monthlyReport', v)}
          label="Reporte mensual"
          description="Recibe estadísticas mensuales"
        />
        
        <Divider />
        
        <Text style={styles.sectionTitle}>Apariencia</Text>
        
        <Switch 
          value={settings.darkMode}
          onValueChange={(v) => updateSetting('darkMode', v)}
          label="Modo oscuro"
          description="Tema oscuro para la interfaz"
        />
        
        <Switch 
          value={settings.autoSave}
          onValueChange={(v) => updateSetting('autoSave', v)}
          label="Guardado automático"
          description="Guarda cambios automáticamente"
        />
      </Card>
      
      <Button variant="primary" onPress={saveSettings}>
        Guardar Configuración
      </Button>
    </ScrollView>
  );
}
```

---

### 6. Permisos del Usuario

```javascript
function UserPermissionsExample() {
  const [permissions, setPermissions] = useState({
    canViewStudents: true,
    canEditStudents: false,
    canDeleteStudents: false,
    canViewReports: true,
    canExportReports: false,
  });

  const updatePermission = (key, value) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <Text style={styles.title}>Permisos del Usuario</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estudiantes</Text>
        
        <Switch 
          value={permissions.canViewStudents}
          onValueChange={(v) => updatePermission('canViewStudents', v)}
          label="Ver estudiantes"
        />
        
        <Switch 
          value={permissions.canEditStudents}
          onValueChange={(v) => updatePermission('canEditStudents', v)}
          label="Editar estudiantes"
          disabled={!permissions.canViewStudents}
        />
        
        <Switch 
          value={permissions.canDeleteStudents}
          onValueChange={(v) => updatePermission('canDeleteStudents', v)}
          label="Eliminar estudiantes"
          variant="danger"
          disabled={!permissions.canViewStudents}
        />
      </View>
      
      <Divider />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reportes</Text>
        
        <Switch 
          value={permissions.canViewReports}
          onValueChange={(v) => updatePermission('canViewReports', v)}
          label="Ver reportes"
        />
        
        <Switch 
          value={permissions.canExportReports}
          onValueChange={(v) => updatePermission('canExportReports', v)}
          label="Exportar reportes"
          disabled={!permissions.canViewReports}
        />
      </View>
      
      <Button variant="primary" onPress={savePermissions}>
        Guardar Permisos
      </Button>
    </Card>
  );
}
```

---

### 7. Switch con Confirmación

```javascript
function ConfirmationExample() {
  const [isPublic, setIsPublic] = useState(false);
  const { showAlert } = useAlert();

  const handleToggle = (value) => {
    if (value) {
      // Mostrar confirmación al activar
      showAlert({
        title: "¿Hacer perfil público?",
        message: "Todos podrán ver tu información",
        buttons: [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Confirmar", 
            onPress: () => setIsPublic(true),
            style: "destructive"
          }
        ]
      });
    } else {
      // Desactivar sin confirmación
      setIsPublic(false);
    }
  };

  return (
    <Switch 
      value={isPublic}
      onValueChange={handleToggle}
      label="Perfil público"
      description="Otros usuarios podrán ver tu perfil"
      variant="warning"
    />
  );
}
```

---

### 8. Switch con Efectos Secundarios

```javascript
function SideEffectsExample() {
  const [darkMode, setDarkMode] = useState(false);
  const { setTheme } = useTheme();
  const toast = useToast();

  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    setTheme(value ? 'dark' : 'light');
    
    toast.success(
      value ? "Modo oscuro activado" : "Modo claro activado"
    );
  };

  return (
    <Switch 
      value={darkMode}
      onValueChange={handleDarkModeToggle}
      label="Modo oscuro"
      description="Cambia el tema de la aplicación"
    />
  );
}
```

---

### 9. Formulario de Preferencias

```javascript
function PreferencesForm() {
  const [preferences, setPreferences] = useState({
    emailDigest: true,
    marketing: false,
    analytics: true,
    crashReports: true,
    betaFeatures: false,
  });
  const [saved, setSaved] = useState(false);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await savePreferences(preferences);
      setSaved(true);
      toast.success("Preferencias guardadas");
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  return (
    <View>
      <Card>
        <Text style={styles.sectionTitle}>Comunicaciones</Text>
        
        <Switch 
          value={preferences.emailDigest}
          onValueChange={(v) => updatePreference('emailDigest', v)}
          label="Resumen diario por email"
          description="Recibe un resumen de actividad cada día"
        />
        
        <Switch 
          value={preferences.marketing}
          onValueChange={(v) => updatePreference('marketing', v)}
          label="Emails de marketing"
          description="Novedades, tips y ofertas especiales"
        />
        
        <Divider />
        
        <Text style={styles.sectionTitle}>Privacidad y Datos</Text>
        
        <Switch 
          value={preferences.analytics}
          onValueChange={(v) => updatePreference('analytics', v)}
          label="Análisis de uso"
          description="Ayúdanos a mejorar el producto"
        />
        
        <Switch 
          value={preferences.crashReports}
          onValueChange={(v) => updatePreference('crashReports', v)}
          label="Reportes de errores"
          description="Envía reportes automáticos de fallos"
        />
        
        <Divider />
        
        <Text style={styles.sectionTitle}>Experimental</Text>
        
        <Switch 
          value={preferences.betaFeatures}
          onValueChange={(v) => updatePreference('betaFeatures', v)}
          label="Funcionalidades beta"
          description="Accede a nuevas funciones antes que nadie"
          variant="warning"
        />
      </Card>
      
      <Button 
        variant="primary" 
        onPress={handleSave}
        disabled={saved}
      >
        {saved ? "✓ Guardado" : "Guardar Preferencias"}
      </Button>
    </View>
  );
}
```

---

### 10. Switch con Validación

```javascript
function ValidationExample() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    
    if (!agreeTerms || !agreePrivacy) {
      toast.error("Debes aceptar todos los términos");
      return;
    }
    
    // Proceder con el registro
    register();
  };

  return (
    <View>
      <Card>
        <Switch 
          value={agreeTerms}
          onValueChange={setAgreeTerms}
          label="Acepto los términos y condiciones"
          error={submitted && !agreeTerms}
          errorMessage="Debes aceptar los términos para continuar"
        />
        
        <Switch 
          value={agreePrivacy}
          onValueChange={setAgreePrivacy}
          label="Acepto la política de privacidad"
          error={submitted && !agreePrivacy}
          errorMessage="Debes aceptar la política de privacidad"
        />
      </Card>
      
      <Button 
        variant="primary" 
        onPress={handleSubmit}
        disabled={!agreeTerms || !agreePrivacy}
      >
        Registrarse
      </Button>
    </View>
  );
}
```

---

## 📋 Props API

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | boolean | false | Si el switch está activo (on) |
| `onValueChange` | function | - | Callback al cambiar (recibe boolean) |
| `variant` | string | "default" | Variante: 'default', 'primary', 'success', 'warning', 'danger' |
| `size` | string | "md" | Tamaño: 'sm', 'md', 'lg' (solo afecta labels) |
| `label` | string\|ReactNode | - | Label del switch |
| `description` | string | - | Descripción debajo del label |
| `disabled` | boolean | false | Si está deshabilitado |
| `error` | boolean | false | Si hay error |
| `errorMessage` | string | - | Mensaje de error |
| `style` | object | - | Estilos del contenedor |
| `switchStyle` | object | - | Estilos del switch |
| `labelStyle` | object | - | Estilos del label |

---

## 🎯 Mejores Prácticas

### ✅ Hacer

1. **Usar switches para opciones on/off binarias:**
   ```javascript
   <Switch label="Notificaciones activadas" />  // ✅
   ```

2. **Agregar descripciones para clarificar:**
   ```javascript
   <Switch 
     label="Modo oscuro"
     description="Cambia el tema de la aplicación"
   />
   ```

3. **Usar variants para estados especiales:**
   ```javascript
   <Switch 
     label="Eliminar automáticamente"
     variant="danger"
   />
   ```

4. **Disabled cuando dependen de otros:**
   ```javascript
   <Switch 
     label="Exportar reportes"
     disabled={!canViewReports}
   />
   ```

### ❌ Evitar

1. **No usar switches para selección entre múltiples opciones:**
   ```javascript
   // ❌ Mal
   <Switch label="Opción A" />
   <Switch label="Opción B" />
   <Switch label="Opción C" />
   
   // ✅ Bien - Usa RadioGroup
   <RadioGroup options={[...]} />
   ```

2. **No usar switches para acciones:**
   ```javascript
   // ❌ Mal
   <Switch label="Eliminar cuenta" />
   
   // ✅ Bien - Usa Button
   <Button variant="danger">Eliminar cuenta</Button>
   ```

3. **No usar switches sin labels:**
   ```javascript
   // ❌ Mal
   <Switch value={value} onValueChange={setValue} />
   
   // ✅ Bien
   <Switch value={value} onValueChange={setValue} label="Activar" />
   ```

---

## 🔗 Componentes Relacionados

- **Checkbox** - Para opciones que pueden estar en múltiples estados
- **Radio** - Para selección única entre múltiples opciones
- **Button** - Para acciones

---

## 📝 Cuándo Usar Cada Componente

| Escenario | Componente |
|-----------|------------|
| Toggle on/off simple | **Switch** |
| Múltiples opciones on/off independientes | **Checkbox** |
| Selección única entre opciones | **Radio** |
| Confirmación de términos | **Checkbox** (más común) o Switch |
| Estado con 3+ valores | **Select** o **RadioGroup** |

---

## 💡 Diferencias: Switch vs Checkbox

| Aspecto | Switch | Checkbox |
|---------|--------|----------|
| **Uso** | Acción inmediata | Selección para envío |
| **Feedback** | Cambio inmediato | Requiere acción posterior |
| **Estados** | 2 (on/off) | 3 (checked/unchecked/indeterminate) |
| **Ejemplo** | Activar notificaciones | Aceptar términos |

### Guía de selección:

**Usa Switch cuando:**
- El cambio tiene efecto inmediato
- Es una configuración on/off
- El usuario espera feedback instantáneo
- Ejemplos: "Activar dark mode", "Habilitar notificaciones"

**Usa Checkbox cuando:**
- La selección es parte de un formulario
- Requiere confirmación posterior (submit)
- Puede tener estado indeterminado
- Ejemplos: "Acepto términos", "Seleccionar items"

---

## 📱 Notas de Plataforma

### iOS
- Switch tiene apariencia nativa de iOS
- Thumb color es siempre blanco
- Track color cambia según estado

### Android
- Switch tiene apariencia Material Design
- Thumb y track cambian de color
- Animación suave de transición

### Web
- Renderiza switch web nativo
- Puede variar según navegador
- Mantiene funcionalidad consistente

---

**Versión:** 1.0  
**Creado:** Fase 3 - Tarea #4  
**Mantenido por:** Equipo de desarrollo FaceAttend EDU
