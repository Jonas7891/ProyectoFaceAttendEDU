# Skeleton Component - Guía de Ejemplos

## 📖 Descripción

`Skeleton` es un componente de loading placeholder animado que muestra dónde aparecerá el contenido mientras se carga. Proporciona mejor feedback visual que un spinner genérico y reduce la percepción de tiempo de carga.

## 🎯 Casos de Uso

### 1. Skeleton Básico

```javascript
import { Skeleton } from '@/components/common/feedback';

// Placeholder rectangular básico
<Skeleton width={200} height={20} />

// Placeholder sin animación
<Skeleton width={150} height={15} animated={false} />

// Con border radius custom
<Skeleton width={300} height={100} borderRadius={16} />
```

---

### 2. Skeleton de Texto

```javascript
// Líneas de texto cargando
<View>
  <Skeleton.Text width={200} />
  <Skeleton.Text width={250} />
  <Skeleton.Text width={180} />
</View>

// Título + párrafo
<View>
  <Skeleton.Text width={150} height={20} />
  <Skeleton.Text width={300} height={14} style={{ marginTop: 8 }} />
  <Skeleton.Text width={280} height={14} />
</View>
```

**Cuándo usar:**
- Loading de artículos/posts
- Loading de listas de texto
- Comentarios cargando

---

### 3. Skeleton Circular (Avatar)

```javascript
// Avatar
<Skeleton.Circle size={48} />

// Múltiples avatares
<View style={{ flexDirection: 'row', gap: 8 }}>
  <Skeleton.Avatar size={40} />
  <Skeleton.Avatar size={40} />
  <Skeleton.Avatar size={40} />
</View>

// Avatar grande (perfil)
<Skeleton.Avatar size={120} />
```

**Cuándo usar:**
- Loading de avatares de usuario
- Íconos circulares cargando
- Imágenes de perfil

---

### 4. Skeleton de Card Completa

```javascript
// Card con avatar + texto
<Skeleton.Card />

// Card custom
<View style={styles.card}>
  <Skeleton.Circle size={48} />
  <View style={{ flex: 1, marginLeft: 12 }}>
    <Skeleton.Text width={120} height={14} />
    <Skeleton.Text width={200} height={12} />
  </View>
</View>
```

**Cuándo usar:**
- Loading de tarjetas de usuario
- Lista de contactos cargando
- Feed de posts

---

### 5. Skeleton de Lista

```javascript
// Lista de 5 items
<Skeleton.List items={5} />

// Lista custom
<View>
  {[1, 2, 3, 4].map((_, i) => (
    <Skeleton.Card key={i} style={{ marginBottom: 12 }} />
  ))}
</View>
```

**Cuándo usar:**
- Loading de listas de estudiantes
- Loading de listados en general
- Feed infinito

---

### 6. Loading de Perfil Completo

```javascript
function ProfileSkeleton() {
  return (
    <View style={{ padding: 16 }}>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Skeleton.Avatar size={100} />
        <Skeleton.Text width={150} height={20} style={{ marginTop: 12 }} />
        <Skeleton.Text width={200} height={14} style={{ marginTop: 4 }} />
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
        <View style={{ alignItems: 'center' }}>
          <Skeleton.Text width={40} height={18} />
          <Skeleton.Text width={60} height={12} style={{ marginTop: 4 }} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Skeleton.Text width={40} height={18} />
          <Skeleton.Text width={60} height={12} style={{ marginTop: 4 }} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Skeleton.Text width={40} height={18} />
          <Skeleton.Text width={60} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Content */}
      <Skeleton.List items={3} />
    </View>
  );
}
```

**Cuándo usar:**
- Loading de perfil de usuario
- Loading de perfil de estudiante/instructor
- Pantallas de detalle

---

### 7. Loading de Dashboard/Home

```javascript
function DashboardSkeleton() {
  return (
    <View style={{ padding: 16 }}>
      {/* Header Stats */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <Skeleton width="48%" height={100} borderRadius={12} />
        <Skeleton width="48%" height={100} borderRadius={12} />
      </View>

      {/* Chart placeholder */}
      <Skeleton width="100%" height={200} borderRadius={12} style={{ marginBottom: 24 }} />

      {/* Recent activity */}
      <Skeleton.Text width={120} height={18} style={{ marginBottom: 12 }} />
      <Skeleton.List items={4} />
    </View>
  );
}
```

**Cuándo usar:**
- Loading de dashboard
- Loading de home screen
- Pantallas con múltiples secciones

---

### 8. Loading de Tabla/Grid

```javascript
function TableSkeleton() {
  return (
    <View>
      {/* Header */}
      <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1 }}>
        <Skeleton.Text width={100} height={14} />
        <Skeleton.Text width={150} height={14} style={{ marginLeft: 16 }} />
        <Skeleton.Text width={80} height={14} style={{ marginLeft: 16 }} />
      </View>

      {/* Rows */}
      {[1, 2, 3, 4, 5].map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', padding: 12 }}>
          <Skeleton.Text width={100} height={12} />
          <Skeleton.Text width={150} height={12} style={{ marginLeft: 16 }} />
          <Skeleton.Text width={80} height={12} style={{ marginLeft: 16 }} />
        </View>
      ))}
    </View>
  );
}
```

**Cuándo usar:**
- Loading de tablas de datos
- Loading de grids
- Reportes cargando

---

## 🎨 Props API

### Skeleton (Base)

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circle' \| 'rect'` | `'rect'` | Tipo de skeleton |
| `width` | `number` | `100` | Ancho en pixels |
| `height` | `number` | `20` | Alto en pixels |
| `animated` | `boolean` | `true` | Si debe animar (shimmer) |
| `borderRadius` | `number` | - | Radio de borde custom |
| `style` | `object` | - | Estilos adicionales |

### Sub-componentes

#### Skeleton.Text
- `width`: número (default: 200)
- `height`: número (default: 16)

#### Skeleton.Circle / Skeleton.Avatar
- `size`: número (default: 48)

#### Skeleton.Card
- Placeholder pre-armado: avatar + 2 líneas de texto

#### Skeleton.List
- `items`: número de cards (default: 3)

---

## ✅ Buenas Prácticas

### 1. Simular Estructura Real
```javascript
// ❌ Malo: No refleja la UI final
<Skeleton width={300} height={200} />

// ✅ Bueno: Simula estructura real
<View>
  <Skeleton.Avatar size={48} />
  <Skeleton.Text width={180} />
  <Skeleton.Text width={220} />
  <Skeleton.Text width={150} />
</View>
```

### 2. Usar Dimensiones Reales
```javascript
// ❌ Malo: Dimensiones random
<Skeleton width={250} height={50} />

// ✅ Bueno: Dimensiones del componente real
<Skeleton width="100%" height={listItemHeight} />
```

### 3. Cantidad Apropiada
```javascript
// ❌ Malo: Demasiados items
<Skeleton.List items={50} />

// ✅ Bueno: Items visibles en viewport
<Skeleton.List items={8} />
```

### 4. Transición Suave
```javascript
function UserList() {
  const { users, loading } = useUsers();

  if (loading) {
    return <Skeleton.List items={5} />;
  }

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserCard user={item} />}
    />
  );
}
```

---

## ⚠️ Cuándo NO Usar Skeleton

### 1. Acciones Rápidas
```javascript
// ❌ No usar skeleton para acciones que toman <500ms
// El skeleton aparecería y desaparecería muy rápido

// ✅ Usar spinner o nada para acciones rápidas
{loading && <ActivityIndicator />}
```

### 2. Actualizaciones Parciales
```javascript
// ❌ No reemplazar toda la UI con skeleton en refetch
// ✅ Mostrar datos anteriores con indicador de actualización
<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
```

### 3. Loading Indeterminado Largo
```javascript
// ❌ No usar skeleton para operaciones que toman minutos
// ✅ Usar progress bar con porcentaje
<ProgressBar progress={uploadProgress} />
```

---

## 🎯 Variantes por Caso de Uso

| Caso de Uso | Componente | Configuración |
|-------------|------------|---------------|
| **Lista de usuarios** | `<Skeleton.List />` | items={5-8} |
| **Perfil** | `<Skeleton.Avatar />` + textos | size={100} |
| **Artículo/Post** | `<Skeleton.Text />` múltiples | Widths variados |
| **Card con imagen** | `<Skeleton />` rect | height={200} |
| **Tabla** | Custom rows + cols | Grid structure |
| **Dashboard** | Custom layout | Mezcla de variants |
| **Avatar solo** | `<Skeleton.Circle />` | size={40-48} |
| **Botón cargando** | `<Skeleton />` rect | width/height del botón |

---

## 🔗 Relacionado

- **Loader** - Para loading fullscreen o simple
- **ProgressBar** - Para progreso determinado
- **EmptyState** - Para cuando no hay datos (post-loading)

---

## 📝 Notas de Implementación

- **Animación:** Usa `Animated.loop` para shimmer effect suave
- **Performance:** Animación usa `useNativeDriver` para 60fps
- **Theme-aware:** Colores automáticos del tema
- **Composición:** Sub-componentes exportados como `Skeleton.Text`, etc.
- **Flexibilidad:** Props style permite custom layouts complejos

---

**Componente:** Skeleton  
**Ubicación:** `src/view/components/common/feedback/Skeleton.js`  
**Documentado:** ✅ JSDoc + examples.md
