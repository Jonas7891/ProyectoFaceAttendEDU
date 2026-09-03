# Radio & RadioGroup Components - Ejemplos de Uso

## 📖 Descripción

Componentes para selección única: **Radio** (botón individual) y **RadioGroup** (grupo manejado automáticamente).

---

## ✅ Características

### Radio
- ✅ Selección única
- ✅ 5 variants: default, primary, success, warning, danger
- ✅ 3 tamaños: sm, md, lg
- ✅ Label y descripción opcionales
- ✅ Estados: disabled, error
- ✅ Theme-aware

### RadioGroup
- ✅ Manejo automático de selección única
- ✅ Layout vertical u horizontal
- ✅ Opciones con descripciones
- ✅ Error handling
- ✅ Disabled individual o grupal
- ✅ Simplifica el manejo de estado

---

## 🎨 Ejemplos

### 1. RadioGroup Básico

```javascript
import { RadioGroup } from "./components/common/inputs";

function BasicExample() {
  const [gender, setGender] = useState('');

  return (
    <RadioGroup 
      value={gender}
      onValueChange={setGender}
      options={[
        { value: 'male', label: 'Masculino' },
        { value: 'female', label: 'Femenino' },
        { value: 'other', label: 'Otro' }
      ]}
    />
  );
}
```

**Resultado:**
```
◉ Masculino
○ Femenino
○ Otro
```

---

### 2. RadioGroup con Label y Descripciones

```javascript
function PlanSelectionExample() {
  const [plan, setPlan] = useState('free');

  return (
    <RadioGroup 
      label="Selecciona tu plan"
      value={plan}
      onValueChange={setPlan}
      options={[
        { 
          value: 'free', 
          label: 'Plan Gratis',
          description: 'Funcionalidades básicas - Perfecto para empezar'
        },
        { 
          value: 'pro', 
          label: 'Plan Pro',
          description: 'Funcionalidades avanzadas - $19.99/mes'
        },
        { 
          value: 'enterprise', 
          label: 'Plan Enterprise',
          description: 'Todo incluido + soporte prioritario - Contactar'
        }
      ]}
    />
  );
}
```

**Resultado:**
```
Selecciona tu plan

◉ Plan Gratis
  Funcionalidades básicas - Perfecto para empezar

○ Plan Pro
  Funcionalidades avanzadas - $19.99/mes

○ Plan Enterprise
  Todo incluido + soporte prioritario - Contactar
```

---

### 3. RadioGroup Horizontal

```javascript
function PriorityExample() {
  const [priority, setPriority] = useState('medium');

  return (
    <View>
      <Text style={styles.label}>Prioridad del ticket</Text>
      <RadioGroup 
        value={priority}
        onValueChange={setPriority}
        layout="horizontal"
        options={[
          { value: 'low', label: 'Baja' },
          { value: 'medium', label: 'Media' },
          { value: 'high', label: 'Alta' },
          { value: 'urgent', label: 'Urgente' }
        ]}
      />
    </View>
  );
}
```

**Resultado:**
```
Prioridad del ticket
○ Baja    ◉ Media    ○ Alta    ○ Urgente
```

---

### 4. RadioGroup con Variants

```javascript
function StatusExample() {
  const [status, setStatus] = useState('');

  return (
    <View>
      <RadioGroup 
        label="Estado del estudiante"
        value={status}
        onValueChange={setStatus}
        variant="success"
        options={[
          { value: 'active', label: 'Activo' },
          { value: 'inactive', label: 'Inactivo' }
        ]}
      />
      
      <RadioGroup 
        label="Nivel de alerta"
        value={alertLevel}
        onValueChange={setAlertLevel}
        variant="warning"
        options={[
          { value: 'low', label: 'Bajo' },
          { value: 'high', label: 'Alto' }
        ]}
      />
    </View>
  );
}
```

---

### 5. RadioGroup con Error

```javascript
function RoleSelectionExample() {
  const [role, setRole] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (!role) {
      // Mostrar error
      return;
    }
    // Proceder
  };

  return (
    <View>
      <RadioGroup 
        label="Rol del usuario *"
        value={role}
        onValueChange={setRole}
        options={[
          { 
            value: 'student', 
            label: 'Estudiante',
            description: 'Acceso a cursos y asistencias'
          },
          { 
            value: 'teacher', 
            label: 'Docente',
            description: 'Gestión de cursos y estudiantes'
          },
          { 
            value: 'admin', 
            label: 'Administrador',
            description: 'Acceso completo al sistema'
          }
        ]}
        error={submitted && !role}
        errorMessage="Debes seleccionar un rol para continuar"
      />
      
      <Button onPress={handleSubmit} variant="primary">
        Crear Usuario
      </Button>
    </View>
  );
}
```

**Resultado (cuando hay error):**
```
Rol del usuario *

○ Estudiante
  Acceso a cursos y asistencias

○ Docente  
  Gestión de cursos y estudiantes

○ Administrador
  Acceso completo al sistema

⚠ Debes seleccionar un rol para continuar
```

---

### 6. RadioGroup con Opciones Disabled

```javascript
function SubscriptionExample() {
  const [subscription, setSubscription] = useState('basic');

  return (
    <RadioGroup 
      label="Plan de suscripción"
      value={subscription}
      onValueChange={setSubscription}
      options={[
        { 
          value: 'basic', 
          label: 'Básico',
          description: 'Gratis para siempre'
        },
        { 
          value: 'premium', 
          label: 'Premium',
          description: '$9.99/mes'
        },
        { 
          value: 'enterprise', 
          label: 'Enterprise',
          description: 'Contactar ventas',
          disabled: true  // Opción deshabilitada
        }
      ]}
    />
  );
}
```

---

### 7. Radio Individual (sin RadioGroup)

```javascript
import { Radio } from "./components/common/inputs";

function IndividualRadioExample() {
  const [selected, setSelected] = useState('option1');

  return (
    <View>
      <Radio 
        selected={selected === 'option1'}
        onPress={() => setSelected('option1')}
        label="Opción 1"
      />
      
      <Radio 
        selected={selected === 'option2'}
        onPress={() => setSelected('option2')}
        label="Opción 2"
        description="Esta opción tiene una descripción"
      />
      
      <Radio 
        selected={selected === 'option3'}
        onPress={() => setSelected('option3')}
        label="Opción 3"
        variant="success"
      />
    </View>
  );
}
```

**Nota:** Usar RadioGroup es más conveniente que manejar Radios individuales.

---

### 8. Formulario de Configuración

```javascript
function SettingsForm() {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'es',
    notifications: 'all',
    privacy: 'public'
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView>
      <Card>
        <RadioGroup 
          label="Tema"
          value={settings.theme}
          onValueChange={(value) => updateSetting('theme', value)}
          layout="horizontal"
          options={[
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Oscuro' },
            { value: 'auto', label: 'Automático' }
          ]}
        />
        
        <Divider />
        
        <RadioGroup 
          label="Idioma"
          value={settings.language}
          onValueChange={(value) => updateSetting('language', value)}
          options={[
            { value: 'es', label: 'Español' },
            { value: 'en', label: 'English' },
            { value: 'pt', label: 'Português' }
          ]}
        />
        
        <Divider />
        
        <RadioGroup 
          label="Notificaciones"
          value={settings.notifications}
          onValueChange={(value) => updateSetting('notifications', value)}
          options={[
            { 
              value: 'all', 
              label: 'Todas',
              description: 'Recibe todas las notificaciones'
            },
            { 
              value: 'important', 
              label: 'Solo importantes',
              description: 'Solo alertas críticas'
            },
            { 
              value: 'none', 
              label: 'Ninguna',
              description: 'Desactivar notificaciones'
            }
          ]}
        />
        
        <Divider />
        
        <RadioGroup 
          label="Privacidad del perfil"
          value={settings.privacy}
          onValueChange={(value) => updateSetting('privacy', value)}
          variant="warning"
          options={[
            { 
              value: 'public', 
              label: 'Público',
              description: 'Todos pueden ver tu perfil'
            },
            { 
              value: 'friends', 
              label: 'Solo amigos',
              description: 'Solo tus contactos'
            },
            { 
              value: 'private', 
              label: 'Privado',
              description: 'Solo tú'
            }
          ]}
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

### 9. Selección de Método de Pago

```javascript
function PaymentMethodExample() {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState({});

  const validateAndSubmit = () => {
    if (!paymentMethod) {
      setErrors({ paymentMethod: 'Selecciona un método de pago' });
      return;
    }
    // Proceder con el pago
  };

  return (
    <Card>
      <Text style={styles.title}>Método de pago</Text>
      
      <RadioGroup 
        value={paymentMethod}
        onValueChange={(value) => {
          setPaymentMethod(value);
          setErrors({});
        }}
        options={[
          { 
            value: 'card', 
            label: 'Tarjeta de crédito/débito',
            description: 'Visa, Mastercard, American Express'
          },
          { 
            value: 'paypal', 
            label: 'PayPal',
            description: 'Paga con tu cuenta de PayPal'
          },
          { 
            value: 'bank', 
            label: 'Transferencia bancaria',
            description: 'Transferencia directa desde tu banco'
          },
          { 
            value: 'crypto', 
            label: 'Criptomonedas',
            description: 'Bitcoin, Ethereum, USDT',
            disabled: true  // No disponible aún
          }
        ]}
        error={!!errors.paymentMethod}
        errorMessage={errors.paymentMethod}
      />
      
      <Button 
        variant="primary" 
        onPress={validateAndSubmit}
        style={{ marginTop: 16 }}
      >
        Continuar al pago
      </Button>
    </Card>
  );
}
```

---

### 10. Encuesta con Múltiples Preguntas

```javascript
function SurveyExample() {
  const [answers, setAnswers] = useState({
    satisfaction: '',
    recommend: '',
    frequency: ''
  });

  const updateAnswer = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const allAnswered = Object.values(answers).every(a => a !== '');

  return (
    <ScrollView>
      <Card>
        <Text style={styles.surveyTitle}>Encuesta de Satisfacción</Text>
        
        <RadioGroup 
          label="1. ¿Qué tan satisfecho estás con FaceAttend EDU?"
          value={answers.satisfaction}
          onValueChange={(value) => updateAnswer('satisfaction', value)}
          options={[
            { value: '5', label: 'Muy satisfecho' },
            { value: '4', label: 'Satisfecho' },
            { value: '3', label: 'Neutral' },
            { value: '2', label: 'Insatisfecho' },
            { value: '1', label: 'Muy insatisfecho' }
          ]}
        />
        
        <Divider />
        
        <RadioGroup 
          label="2. ¿Recomendarías FaceAttend EDU?"
          value={answers.recommend}
          onValueChange={(value) => updateAnswer('recommend', value)}
          layout="horizontal"
          options={[
            { value: 'yes', label: 'Sí' },
            { value: 'maybe', label: 'Tal vez' },
            { value: 'no', label: 'No' }
          ]}
        />
        
        <Divider />
        
        <RadioGroup 
          label="3. ¿Con qué frecuencia usas el sistema?"
          value={answers.frequency}
          onValueChange={(value) => updateAnswer('frequency', value)}
          options={[
            { value: 'daily', label: 'Diariamente' },
            { value: 'weekly', label: 'Semanalmente' },
            { value: 'monthly', label: 'Mensualmente' },
            { value: 'rarely', label: 'Raramente' }
          ]}
        />
      </Card>
      
      <Button 
        variant="primary" 
        disabled={!allAnswered}
        onPress={submitSurvey}
      >
        Enviar Encuesta
      </Button>
    </ScrollView>
  );
}
```

---

## 📋 Props API

### Radio

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `selected` | boolean | false | Si está seleccionado |
| `onPress` | function | - | Callback al presionar |
| `variant` | string | "default" | Variante: 'default', 'primary', 'success', 'warning', 'danger' |
| `size` | string | "md" | Tamaño: 'sm', 'md', 'lg' |
| `label` | string\|ReactNode | - | Label del radio |
| `description` | string | - | Descripción debajo del label |
| `disabled` | boolean | false | Si está deshabilitado |
| `error` | boolean | false | Si hay error |
| `style` | object | - | Estilos del contenedor |
| `radioStyle` | object | - | Estilos del radio |
| `labelStyle` | object | - | Estilos del label |

### RadioGroup

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | string | - | Valor seleccionado |
| `onValueChange` | function | - | Callback al cambiar (recibe valor) |
| `options` | array | [] | Array de opciones (ver estructura abajo) |
| `label` | string | - | Label del grupo |
| `variant` | string | "default" | Variante de todos los radios |
| `size` | string | "md" | Tamaño de todos los radios |
| `layout` | string | "vertical" | Layout: 'vertical', 'horizontal' |
| `disabled` | boolean | false | Deshabilita todo el grupo |
| `error` | boolean | false | Si hay error |
| `errorMessage` | string | - | Mensaje de error |
| `style` | object | - | Estilos del contenedor |

### Estructura de Options

```typescript
{
  value: string,          // Valor único
  label: string,          // Label del radio
  description?: string,   // Descripción opcional
  disabled?: boolean      // Si esta opción está deshabilitada
}
```

---

## 🎯 Mejores Prácticas

### ✅ Hacer

1. **Usar RadioGroup en lugar de Radios individuales:**
   ```javascript
   // ✅ Bien
   <RadioGroup value={value} onValueChange={setValue} options={...} />
   
   // ❌ Evitar (más código, más complejo)
   <Radio selected={value === 'a'} onPress={() => setValue('a')} />
   <Radio selected={value === 'b'} onPress={() => setValue('b')} />
   ```

2. **Usar descripciones para clarificar opciones:**
   ```javascript
   <RadioGroup 
     options={[
       { 
         value: 'pro', 
         label: 'Plan Pro',
         description: '$19.99/mes - Todas las funcionalidades'
       }
     ]}
   />
   ```

3. **Usar layout horizontal para pocas opciones:**
   ```javascript
   <RadioGroup layout="horizontal" options={[...]} />  // 2-4 opciones
   ```

4. **Mostrar errores cuando es requerido:**
   ```javascript
   <RadioGroup 
     error={submitted && !value}
     errorMessage="Campo requerido"
   />
   ```

### ❌ Evitar

1. **No usar radios para múltiples selecciones:**
   ```javascript
   // ❌ Mal - Usa Checkbox
   <RadioGroup />  // Para selección múltiple
   
   // ✅ Bien
   <Checkbox />  // Para múltiples opciones
   ```

2. **No usar más de 7-8 opciones en un RadioGroup:**
   ```javascript
   // ❌ Mal - Demasiadas opciones
   <RadioGroup options={[...25 opciones...]} />
   
   // ✅ Bien - Usa Select
   <Select options={[...25 opciones...]} />
   ```

3. **No usar layout horizontal con descripciones largas:**
   ```javascript
   // ❌ Mal
   <RadioGroup layout="horizontal" options={[
     { label: 'X', description: 'Descripción muy larga...' }
   ]} />
   
   // ✅ Bien
   <RadioGroup layout="vertical" options={...} />
   ```

---

## 🔗 Componentes Relacionados

- **Checkbox** - Para selección múltiple
- **Select** - Para muchas opciones (>8)
- **Switch** - Para toggle on/off simple

---

## 📝 Cuándo Usar Cada Componente

| Escenario | Componente |
|-----------|------------|
| Selección única (2-7 opciones visibles) | **RadioGroup** |
| Selección única (>8 opciones) | **Select** |
| Selección múltiple | **Checkbox** |
| Toggle on/off simple | **Switch** |
| Sí/No simple | **RadioGroup horizontal** o **Switch** |

---

**Versión:** 1.0  
**Creado:** Fase 3 - Tarea #2  
**Mantenido por:** Equipo de desarrollo FaceAttend EDU
