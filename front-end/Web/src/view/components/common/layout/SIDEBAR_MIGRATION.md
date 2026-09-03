# 🔄 Sidebar - Guía de Migración

## ✅ Refactorización Completada

El Sidebar ha sido refactorizado de un componente monolítico con props específicos a un **sistema de composición flexible** con múltiples sub-componentes.

---

## 📦 Nuevos Componentes

| Componente | Descripción |
|-----------|-------------|
| `<Sidebar>` | Contenedor principal |
| `<SidebarHeader>` | Sección superior (logo, user, etc) |
| `<SidebarNav>` | Navegación (scrollable) |
| `<SidebarItem>` | Item individual de navegación |
| `<SidebarFooter>` | Sección inferior (logout, etc) |
| `<SidebarDivider>` | Separador visual |

---

## 🔄 Migración

### ❌ API Anterior (Deprecated)

```javascript
<Sidebar
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={onTabChange}
  user={user}
  onLogout={onLogout}
/>
```

**Problemas:**
- Hardcodea estructura (user → tabs → logout)
- No permite customización
- No extensible

### ✅ Nuevo API (Composition)

```javascript
<Sidebar width={240} position="left">
  {user && (
    <SidebarHeader>
      <Text>{user.name}</Text>
      <Text>{user.role}</Text>
    </SidebarHeader>
  )}
  
  <SidebarNav>
    {tabs.map(tab => (
      <SidebarItem
        key={tab.key}
        icon={tab.icon}
        label={tab.label}
        active={activeTab === tab.key}
        badge={tab.badge}
        onPress={() => onTabChange(tab.key)}
      />
    ))}
  </SidebarNav>
  
  <SidebarFooter>
    <SidebarItem
      icon="log-out"
      label="Cerrar sesión"
      variant="danger"
      onPress={onLogout}
    />
  </SidebarFooter>
</Sidebar>
```

**Beneficios:**
- ✅ Estructura flexible
- ✅ Fácil personalizar
- ✅ Extensible sin cambiar componente base

---

## 📖 Ejemplos de Uso

### 1. Sidebar Básico

```javascript
import { Sidebar, SidebarNav, SidebarItem } from "../components/common/layout";

<Sidebar>
  <SidebarNav>
    <SidebarItem icon="home" label="Inicio" active={true} onPress={...} />
    <SidebarItem icon="users" label="Usuarios" onPress={...} />
    <SidebarItem icon="settings" label="Configuración" onPress={...} />
  </SidebarNav>
</Sidebar>
```

### 2. Con Header y Footer

```javascript
<Sidebar>
  <SidebarHeader>
    <Image source={logo} />
    <Text>Mi App</Text>
  </SidebarHeader>
  
  <SidebarNav>
    {tabs.map(tab => <SidebarItem key={tab.key} {...tab} />)}
  </SidebarNav>
  
  <SidebarFooter>
    <SidebarItem icon="log-out" label="Salir" variant="danger" onPress={logout} />
  </SidebarFooter>
</Sidebar>
```

### 3. Con Badges y Dividers

```javascript
<Sidebar>
  <SidebarNav>
    <SidebarItem icon="home" label="Dashboard" />
    <SidebarItem icon="bell" label="Notificaciones" badge={5} />
  </SidebarNav>
  
  <SidebarDivider />
  
  <SidebarNav>
    <SidebarItem icon="settings" label="Configuración" />
    <SidebarItem icon="help-circle" label="Ayuda" />
  </SidebarNav>
</Sidebar>
```

### 4. Sidebar Derecho (Panel)

```javascript
<Sidebar width={300} position="right" border={true}>
  <SidebarHeader>
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text>Filtros</Text>
      <TouchableOpacity onPress={onClose}>
        <Feather name="x" size={20} />
      </TouchableOpacity>
    </View>
  </SidebarHeader>
  
  <SidebarNav>
    <FilterSection />
    <DateRangePicker />
    <CategorySelect />
  </SidebarNav>
  
  <SidebarFooter padding={16}>
    <Button label="Aplicar Filtros" onPress={applyFilters} />
  </SidebarFooter>
</Sidebar>
```

### 5. Sidebar Minimalista (Solo Icons)

```javascript
<Sidebar width={60}>
  <SidebarNav>
    {tabs.map(tab => (
      <SidebarItem
        key={tab.key}
        icon={tab.icon}
        // Sin label = solo icono
        active={activeTab === tab.key}
        onPress={() => setTab(tab.key)}
      />
    ))}
  </SidebarNav>
</Sidebar>
```

### 6. Custom Items con leftElement/rightElement

```javascript
<SidebarNav>
  {/* Avatar custom */}
  <SidebarItem
    leftElement={<Avatar source={user.avatar} size={20} />}
    label={user.name}
  />
  
  {/* Badge custom */}
  <SidebarItem
    icon="inbox"
    label="Mensajes"
    rightElement={<Badge count={10} variant="primary" />}
  />
</SidebarNav>
```

---

## 🎨 Props de Cada Componente

### `<Sidebar>`
```typescript
{
  children: ReactNode,
  width: number = 240,
  collapsedWidth: number = 60,
  collapsible: boolean = false,
  collapsed: boolean = false,
  onToggle: function,
  position: "left" | "right" = "left",
  border: boolean = true,
  style: object
}
```

### `<SidebarHeader>`
```typescript
{
  children: ReactNode,
  padding: number = 20,
  border: boolean = true,
  style: object
}
```

### `<SidebarNav>`
```typescript
{
  children: ReactNode,
  scrollable: boolean = true,
  style: object,
  contentContainerStyle: object
}
```

### `<SidebarItem>`
```typescript
{
  icon: string,
  label: string,
  active: boolean = false,
  badge: string | number,
  variant: "default" | "danger" | "success" | "warning",
  onPress: function,
  disabled: boolean = false,
  leftElement: ReactNode,
  rightElement: ReactNode,
  style: object
}
```

### `<SidebarFooter>`
```typescript
{
  children: ReactNode,
  padding: number = 0,
  border: boolean = true,
  style: object
}
```

### `<SidebarDivider>`
```typescript
{
  marginVertical: number = 8,
  marginHorizontal: number = 16,
  style: object
}
```

---

## ✅ Checklist de Migración

Si tienes código usando el Sidebar antiguo:

- [ ] Importar nuevos componentes: `import { Sidebar, SidebarHeader, SidebarNav, SidebarItem, SidebarFooter } from "../components/common/layout"`
- [ ] Reemplazar `<Sidebar tabs={...} activeTab={...} />` con composición
- [ ] Mover user profile a `<SidebarHeader>`
- [ ] Mapear tabs dentro de `<SidebarNav>` con `<SidebarItem>`
- [ ] Mover logout a `<SidebarFooter>`
- [ ] Verificar que activeTab se pasa correctamente a cada item
- [ ] Verificar que callbacks funcionan (onPress, etc)
- [ ] Testear en mobile y desktop

---

## 🎯 Ventajas del Nuevo Sistema

### 1. **Flexibilidad Total**
```javascript
// Fácil agregar secciones custom
<Sidebar>
  <SearchBar />  {/* Custom */}
  <SidebarHeader>{/* ... */}</SidebarHeader>
  <SidebarNav>{/* tabs */}</SidebarNav>
  <PromoSection />  {/* Custom */}
  <SidebarFooter>{/* logout */}</SidebarFooter>
</Sidebar>
```

### 2. **Múltiples Secciones de Navegación**
```javascript
<Sidebar>
  <SidebarNav>
    <SidebarItem icon="home" label="Principal" />
  </SidebarNav>
  
  <SidebarDivider />
  
  <SidebarNav>
    <SidebarItem icon="star" label="Favoritos" />
  </SidebarNav>
</Sidebar>
```

### 3. **Reordenar sin Modificar Componente**
```javascript
// Versión A: User arriba
<Sidebar>
  <SidebarHeader><User /></SidebarHeader>
  <SidebarNav>{tabs}</SidebarNav>
</Sidebar>

// Versión B: User abajo
<Sidebar>
  <SidebarNav>{tabs}</SidebarNav>
  <SidebarHeader><User /></SidebarHeader>
</Sidebar>
```

### 4. **Extensible**
Agregar features nuevas sin tocar el componente base:
- Collapsed state
- Drag & drop tabs
- Nested navigation
- Custom animations
- Tooltips
- ...

---

## 🚀 Casos de Uso Avanzados

### Dashboard con Múltiples Roles

```javascript
function DashboardSidebar({ userRole, tabs }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <RoleBadge role={userRole} />
      </SidebarHeader>
      
      {/* Admin tabs */}
      {userRole === "admin" && (
        <SidebarNav>
          <SidebarItem icon="shield" label="Admin Panel" />
        </SidebarNav>
      )}
      
      <SidebarDivider />
      
      {/* Tabs comunes */}
      <SidebarNav>
        {tabs.map(tab => <SidebarItem key={tab.key} {...tab} />)}
      </SidebarNav>
    </Sidebar>
  );
}
```

### Settings Sidebar con Secciones

```javascript
<Sidebar width={280} position="right">
  <SidebarHeader>
    <Text>Configuración</Text>
    <CloseButton />
  </SidebarHeader>
  
  <SidebarNav>
    <Text style={styles.sectionTitle}>Perfil</Text>
    <SidebarItem icon="user" label="Datos personales" />
    <SidebarItem icon="lock" label="Seguridad" />
    
    <SidebarDivider />
    
    <Text style={styles.sectionTitle}>Notificaciones</Text>
    <SidebarItem icon="bell" label="Preferencias" />
    <SidebarItem icon="mail" label="Email" />
  </SidebarNav>
</Sidebar>
```

---

## 📚 Documentación

- **JSDoc completo** en cada componente
- Usa IntelliSense para ver props y ejemplos
- Ver archivos en `src/view/components/common/layout/`

---

**Migración completada en:** `src/view/screens/DashboardScreen.js` ✅
