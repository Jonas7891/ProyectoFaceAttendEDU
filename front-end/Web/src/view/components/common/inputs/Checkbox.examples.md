# Checkbox Component - Ejemplos de Uso

## 📖 Descripción

Componente Checkbox reutilizable con soporte para estados indeterminados, múltiples variantes, labels, descripciones y estados de error.

---

## ✅ Características

- ✅ Tres estados: checked, unchecked, indeterminate
- ✅ 5 variants: default, primary, success, warning, danger
- ✅ 3 tamaños: sm, md, lg
- ✅ Label y descripción opcionales
- ✅ Estados: disabled, error
- ✅ Theme-aware (colores del tema)
- ✅ Responsive y accesible
- ✅ JSDoc completo con ejemplos

---

## 🎨 Ejemplos

### 1. Checkbox Básico

```javascript
import { Checkbox } from "./components/common/inputs";

function BasicExample() {
  const [agreed, setAgreed] = useState(false);

  return (
    <Checkbox 
      checked={agreed} 
      onToggle={setAgreed}
      label="Acepto los términos y condiciones"
    />
  );
}
```

**Resultado:**
```
☐ Acepto los términos y condiciones
```

---

### 2. Checkbox con Descripción

```javascript
function WithDescription() {
  const [notifications, setNotifications] = useState(true);

  return (
    <Checkbox 
      checked={notifications}
      onToggle={setNotifications}
      label="Notificaciones por email"
      description="Recibe alertas sobre asistencia y reportes semanales"
    />
  );
}
```

**Resultado:**
```
☑ Notificaciones por email
  Recibe alertas sobre asistencia y reportes semanales
```

---

### 3. Checkbox Indeterminado (Select All)

```javascript
function SelectAllExample() {
  const [students, setStudents] = useState([
    { id: 1, name: "Juan", selected: true },
    { id: 2, name: "María", selected: false },
    { id: 3, name: "Pedro", selected: true },
  ]);

  const selectedCount = students.filter(s => s.selected).length;
  const allSelected = selectedCount === students.length;
  const someSelected = selectedCount > 0 && selectedCount < students.length;

  const toggleSelectAll = (checked) => {
    setStudents(students.map(s => ({ ...s, selected: checked })));
  };

  return (
    <View>
      <Checkbox 
        checked={allSelected}
        indeterminate={someSelected}
        onToggle={toggleSelectAll}
        label="Seleccionar todos"
      />
      
      {students.map(student => (
        <Checkbox 
          key={student.id}
          checked={student.selected}
          onToggle={(checked) => {
            setStudents(students.map(s => 
              s.id === student.id ? { ...s, selected: checked } : s
            ));
          }}
          label={student.name}
        />
      ))}
    </View>
  );
}
```

**Resultado:**
```
⊟ Seleccionar todos    (indeterminate state)
☑ Juan
☐ María
☑ Pedro
```

---

### 4. Checkbox con Variants

```javascript
function VariantsExample() {
  return (
    <View>
      <Checkbox 
        checked={true}
        label="Default variant"
        variant="default"
      />
      
      <Checkbox 
        checked={true}
        label="Success variant"
        variant="success"
      />
      
      <Checkbox 
        checked={true}
        label="Warning variant"
        variant="warning"
      />
      
      <Checkbox 
        checked={true}
        label="Danger variant"
        variant="danger"
      />
    </View>
  );
}
```

---

### 5. Checkbox con Tamaños

```javascript
function SizesExample() {
  return (
    <View>
      <Checkbox 
        checked={true}
        label="Small checkbox"
        size="sm"
      />
      
      <Checkbox 
        checked={true}
        label="Medium checkbox (default)"
        size="md"
      />
      
      <Checkbox 
        checked={true}
        label="Large checkbox"
        size="lg"
      />
    </View>
  );
}
```

---

### 6. Checkbox con Error

```javascript
function ErrorExample() {
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (!agreed) {
      // Mostrar error
      return;
    }
    // Proceder con el envío
  };

  return (
    <View>
      <Checkbox 
        checked={agreed}
        onToggle={setAgreed}
        label="Acepto los términos y condiciones"
        error={submitted && !agreed}
        errorMessage="Debes aceptar los términos para continuar"
      />
      
      <Button onPress={handleSubmit}>
        Enviar
      </Button>
    </View>
  );
}
```

**Resultado (cuando hay error):**
```
☐ Acepto los términos y condiciones  (en rojo)
  ⚠ Debes aceptar los términos para continuar
```

---

### 7. Checkbox Disabled

```javascript
function DisabledExample() {
  return (
    <View>
      <Checkbox 
        checked={false}
        disabled={true}
        label="Checkbox deshabilitado (unchecked)"
      />
      
      <Checkbox 
        checked={true}
        disabled={true}
        label="Checkbox deshabilitado (checked)"
      />
    </View>
  );
}
```

---

### 8. Lista de Permisos

```javascript
function PermissionsExample() {
  const [permissions, setPermissions] = useState({
    viewStudents: true,
    editStudents: false,
    deleteStudents: false,
    viewReports: true,
    exportReports: false,
  });

  const togglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Card>
      <Text style={styles.title}>Permisos del Usuario</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estudiantes</Text>
        <Checkbox 
          checked={permissions.viewStudents}
          onToggle={() => togglePermission('viewStudents')}
          label="Ver estudiantes"
          description="Permite ver la lista de estudiantes"
        />
        <Checkbox 
          checked={permissions.editStudents}
          onToggle={() => togglePermission('editStudents')}
          label="Editar estudiantes"
          description="Permite modificar información de estudiantes"
          disabled={!permissions.viewStudents}
        />
        <Checkbox 
          checked={permissions.deleteStudents}
          onToggle={() => togglePermission('deleteStudents')}
          label="Eliminar estudiantes"
          description="Permite eliminar estudiantes del sistema"
          variant="danger"
          disabled={!permissions.viewStudents}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reportes</Text>
        <Checkbox 
          checked={permissions.viewReports}
          onToggle={() => togglePermission('viewReports')}
          label="Ver reportes"
        />
        <Checkbox 
          checked={permissions.exportReports}
          onToggle={() => togglePermission('exportReports')}
          label="Exportar reportes"
          disabled={!permissions.viewReports}
        />
      </View>
    </Card>
  );
}
```

---

### 9. Formulario de Registro

```javascript
function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    agreeTerms: false,
    agreePrivacy: false,
    subscribeNewsletter: false,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Debes aceptar los términos";
    }
    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = "Debes aceptar la política de privacidad";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Enviar formulario
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
      
      <Divider />
      
      <Checkbox 
        checked={formData.agreeTerms}
        onToggle={(checked) => setFormData(prev => ({ ...prev, agreeTerms: checked }))}
        label="Acepto los términos y condiciones"
        error={!!errors.agreeTerms}
        errorMessage={errors.agreeTerms}
      />
      
      <Checkbox 
        checked={formData.agreePrivacy}
        onToggle={(checked) => setFormData(prev => ({ ...prev, agreePrivacy: checked }))}
        label="Acepto la política de privacidad"
        error={!!errors.agreePrivacy}
        errorMessage={errors.agreePrivacy}
      />
      
      <Checkbox 
        checked={formData.subscribeNewsletter}
        onToggle={(checked) => setFormData(prev => ({ ...prev, subscribeNewsletter: checked }))}
        label="Quiero recibir el newsletter"
        description="Opcional - Enviaremos actualizaciones mensuales"
        variant="primary"
      />
      
      <Button onPress={handleSubmit} variant="primary">
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
| `checked` | boolean | false | Si el checkbox está marcado |
| `onToggle` | function | - | Callback al cambiar estado (recibe boolean) |
| `variant` | string | "default" | Variante: 'default', 'primary', 'success', 'warning', 'danger' |
| `size` | string | "md" | Tamaño: 'sm', 'md', 'lg' |
| `label` | string\|ReactNode | - | Texto o elemento del label |
| `description` | string | - | Texto descriptivo debajo del label |
| `indeterminate` | boolean | false | Estado indeterminado (para "select all") |
| `disabled` | boolean | false | Si está deshabilitado |
| `error` | boolean | false | Si hay error |
| `errorMessage` | string | - | Mensaje de error |
| `style` | object | - | Estilos adicionales del contenedor |
| `checkboxStyle` | object | - | Estilos adicionales del checkbox |
| `labelStyle` | object | - | Estilos adicionales del label |

---

## 🎯 Mejores Prácticas

### ✅ Hacer

1. **Usar labels descriptivos:**
   ```javascript
   <Checkbox label="Acepto los términos y condiciones" />
   ```

2. **Agregar descripciones para claridad:**
   ```javascript
   <Checkbox 
     label="Notificaciones"
     description="Recibe alertas por email"
   />
   ```

3. **Usar state indeterminate para "select all":**
   ```javascript
   <Checkbox 
     checked={allSelected}
     indeterminate={someSelected && !allSelected}
   />
   ```

4. **Mostrar errores cuando es requerido:**
   ```javascript
   <Checkbox 
     error={submitted && !agreed}
     errorMessage="Campo requerido"
   />
   ```

### ❌ Evitar

1. **No usar checkboxes sin labels:**
   ```javascript
   // ❌ Mal
   <Checkbox checked={value} onToggle={setValue} />
   
   // ✅ Bien
   <Checkbox checked={value} onToggle={setValue} label="Aceptar" />
   ```

2. **No usar checkboxes para acciones:**
   ```javascript
   // ❌ Mal
   <Checkbox label="Eliminar usuario" />
   
   // ✅ Bien - Usa un botón
   <Button variant="danger">Eliminar usuario</Button>
   ```

3. **No usar más de 2 niveles de indentación:**
   ```javascript
   // ❌ Mal
   <Checkbox label="Opción padre" />
     <Checkbox label="Opción hija" />
       <Checkbox label="Opción nieta" />  // Confuso
   ```

---

## 🔗 Componentes Relacionados

- **Radio** - Para selección única
- **Switch** - Para toggle on/off
- **Button** - Para acciones

---

## 📝 Notas de Implementación

- El componente usa `Feather` icons para check (✓) y minus (−)
- Soporta tema claro/oscuro automáticamente via `useTheme()`
- Los colores se adaptan según el theme activo
- El estado `indeterminate` tiene prioridad sobre `checked` visualmente
- Al hacer toggle desde estado indeterminate, siempre pasa a checked=true

---

**Versión:** 1.0  
**Creado:** Fase 3 - Tarea #1  
**Mantenido por:** Equipo de desarrollo FaceAttend EDU
