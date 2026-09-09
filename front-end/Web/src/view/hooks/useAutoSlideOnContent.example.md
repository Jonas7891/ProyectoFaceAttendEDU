# useAutoSlideOnContent - Ejemplos de Uso

Hook reutilizable que detecta cambios en contenido visible y dispara autoslide automáticamente.

## 📦 Casos de Uso

### 1. Recomendaciones de Contraseña (SignupView)

Detecta cuando aparecen nuevas recomendaciones de contraseña no cumplidas:

```jsx
import { useAutoSlideOnContent } from './hooks/useAutoSlideOnContent';

function SignupView() {
    const [autoSlideTrigger, setAutoSlideTrigger] = useState(null);
    const [password, setPassword] = useState('');
    
    // Calcular recomendaciones visibles
    const visibleRequirementsCount = useMemo(() => {
        if (!password) return 0;
        
        const requirements = [
            password.length < 8,
            !/[A-Z]/.test(password),
            !/[a-z]/.test(password),
            !/[0-9]/.test(password),
            !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        ];
        
        return requirements.filter(Boolean).length;
    }, [password]);
    
    // Autoslide cuando aparecen MÁS recomendaciones
    useAutoSlideOnContent(
        visibleRequirementsCount,
        autoSlideTrigger,
        { triggerOnIncrease: true }
    );
    
    return (
        <CustomScrollBar
            effects={{
                autoSlide: {
                    enabled: true,
                    target: 'end',
                    trigger: (callback) => setAutoSlideTrigger(() => callback),
                }
            }}
        >
            {/* Contenido */}
        </CustomScrollBar>
    );
}
```

### 2. Lista de Errores de Validación

Detecta cuando aparecen nuevos errores de validación:

```jsx
function FormWithValidation() {
    const [autoSlideTrigger, setAutoSlideTrigger] = useState(null);
    const [errors, setErrors] = useState([]);
    
    // Autoslide cuando aumentan los errores
    useAutoSlideOnContent(
        errors.length,
        autoSlideTrigger,
        { 
            triggerOnIncrease: true,
            delay: 150 
        }
    );
    
    return (
        <CustomScrollBar
            effects={{
                autoSlide: {
                    enabled: true,
                    target: 'end',
                    trigger: (callback) => setAutoSlideTrigger(() => callback),
                }
            }}
        >
            {errors.map(error => <ErrorMessage key={error.id} {...error} />)}
        </CustomScrollBar>
    );
}
```

### 3. Mensajes de Chat/Notificaciones

Detecta cuando llegan nuevos mensajes:

```jsx
function ChatMessages() {
    const [autoSlideTrigger, setAutoSlideTrigger] = useState(null);
    const [messages, setMessages] = useState([]);
    
    // Autoslide cada vez que llega un mensaje nuevo
    useAutoSlideOnContent(
        messages.length,
        autoSlideTrigger,
        { 
            triggerOnIncrease: true,
            delay: 100 
        }
    );
    
    return (
        <CustomScrollBar
            effects={{
                autoSlide: {
                    enabled: true,
                    target: 'end',
                    trigger: (callback) => setAutoSlideTrigger(() => callback),
                }
            }}
        >
            {messages.map(msg => <Message key={msg.id} {...msg} />)}
        </CustomScrollBar>
    );
}
```

### 4. Usando `useAutoSlideOnShow` para Mostrar/Ocultar

Útil cuando el contenido completo aparece o desaparece:

```jsx
import { useAutoSlideOnShow } from './hooks/useAutoSlideOnContent';

function FormWithConditionalHelp() {
    const [autoSlideTrigger, setAutoSlideTrigger] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    
    // Autoslide cuando aparece la ayuda
    useAutoSlideOnShow(showHelp, autoSlideTrigger);
    
    return (
        <CustomScrollBar
            effects={{
                autoSlide: {
                    enabled: true,
                    target: 'end',
                    trigger: (callback) => setAutoSlideTrigger(() => callback),
                }
            }}
        >
            <Form />
            {showHelp && <HelpSection />}
        </CustomScrollBar>
    );
}
```

## ⚙️ Opciones de Configuración

### `useAutoSlideOnContent(count, trigger, options)`

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `delay` | number | 100 | Delay en ms antes de disparar el slide |
| `enabled` | boolean | true | Habilita/deshabilita el hook |
| `triggerOnIncrease` | boolean | true | Solo dispara cuando aumenta el count |

### `useAutoSlideOnShow(isVisible, trigger, options)`

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `delay` | number | 100 | Delay en ms antes de disparar el slide |
| `enabled` | boolean | true | Habilita/deshabilita el hook |

## 🎯 Tips y Best Practices

1. **Usa `useMemo`** para calcular el count de items visibles - evita recálculos innecesarios
2. **`triggerOnIncrease: true`** es mejor para la UX - evita scroll cuando el usuario CUMPLE requisitos
3. **Ajusta el `delay`** según la velocidad de animación de tu contenido
4. **Combina con CustomScrollBar** para máxima flexibilidad
5. **Reutilizable** - el hook es independiente del tipo de contenido

## 🔄 Cómo Funciona

1. El hook observa cambios en `visibleItemsCount` o `isVisible`
2. Cuando detecta un cambio (aumento si `triggerOnIncrease: true`):
   - Espera el `delay` configurado
   - Llama al `autoSlideTrigger` del CustomScrollBar
3. CustomScrollBar ejecuta su animación hacia el `target` configurado

## 🎨 Ventajas

- ✅ **Reutilizable** en cualquier vista con scroll dinámico
- ✅ **Desacoplado** - no depende del tipo de contenido
- ✅ **Configurable** - ajusta el comportamiento según necesites
- ✅ **Performante** - usa refs y cleanup adecuado
- ✅ **TypeScript-ready** - fácil de tipar si migras a TS
