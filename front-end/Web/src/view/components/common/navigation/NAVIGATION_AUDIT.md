# 🔍 Navigation Components - Auditoría para Fase 2

## 📋 Componentes Analizados

### 1. Navbar.js
**Ubicación:** `src/view/components/common/navigation/Navbar.js`

### 2. Sidebar.js
**Ubicación:** `src/view/components/common/layout/Sidebar.js`

---

## ✅ Navbar - Estado Actual

### Props Actuales:
```javascript
{
  left: ReactNode,      // Contenido izquierdo
  center: ReactNode,    // Contenido central
  right: ReactNode,     // Contenido derecho
  border: boolean,      // Borde inferior (default: true)
  style: object         // Estilos custom
}
```

### ✅ Fortalezas:
- **Ya es genérico** → Usa composition pattern (left, center, right)
- **Responsive** → Usa `useResponsive()` para spacing
- **Themeable** → Usa `useTheme()` para colores
- **Flexible** → Acepta cualquier contenido mediante ReactNode
- **JSDoc** → Documentado

### ⚠️ Oportunidades de Mejora:

1. **Falta prop `height`** → Actualmente solo padding, no control de altura total
2. **Falta prop `sticky`/`fixed`** → Para navbars fijos al scroll
3. **Falta prop `shadow`** → Para añadir elevación/sombra
4. **Falta prop `transparent`** → Para navbars transparentes (landing, hero)
5. **Podría tener variants** → "default", "transparent", "floating"

### 📊 Uso Actual:
```javascript
// Landing
<Navbar 
  left={<Logo />} 
  right={<SecondaryLogo />} 
/>

// Otras screens (aliasado como PageHeader)
<PageHeader 
  left={<BackButton />}
  center={<Title />}
  right={<Actions />}
/>
```

---

## ⚠️ Sidebar - Estado Actual

### Props Actuales:
```javascript
{
  tabs: Array,          // Array de tabs [{key, label, icon, badge?}]
  activeTab: string,    // Tab actualmente activo
  onTabChange: func,    // Callback al cambiar tab
  user: object,         // Datos del usuario {name, role}
  onLogout: func        // Callback para logout
}
```

### ❌ Problemas Detectados:

1. **Hardcodea width: 240px** → No es configurable
2. **Hardcodea layout específico** → Siempre: User Header → Tabs → Logout
3. **Hardcodea badge styling** → No permite customización
4. **No soporta collapsed state** → No se puede minimizar
5. **No soporta position** → Siempre left, no soporta right
6. **No soporta custom sections** → No puedes añadir elementos custom
7. **Props específicos** → `user`, `onLogout` hardcodeados en el componente
8. **No es extensible** → Difícil agregar features custom

### 📊 Uso Actual:
```javascript
// DashboardScreen
<Sidebar
  currentTab={vm.currentTab}
  onNavigate={vm.setTab}
  onLogout={handleLogout}
/>
```

**Problema:** Sidebar espera prop `tabs`, pero recibe `currentTab` y `onNavigate`. **Hay inconsistencia**.

---

## 🎯 Plan de Refactorización

### 1. **Navbar** → Mejoras Incrementales ✅

**Objetivo:** Agregar props faltantes sin breaking changes.

#### Nuevas Props:
```javascript
{
  // Existentes
  left, center, right, border, style,
  
  // Nuevas
  height: number,           // Altura custom del navbar
  sticky: boolean,          // Si es sticky al scroll
  shadow: boolean,          // Mostrar sombra/elevación
  transparent: boolean,     // Background transparente
  variant: string,          // "default" | "transparent" | "floating"
  zIndex: number,           // Control de z-index
}
```

#### Compatibilidad:
✅ **100% backward compatible** → Props existentes funcionan igual

---

### 2. **Sidebar** → Refactorización Completa 🔄

**Objetivo:** Hacer completamente genérico y extensible mediante composition.

#### Nueva API Propuesta:

```javascript
<Sidebar
  width={240}                    // Ancho configurable
  collapsible={true}             // Permite minimizar
  collapsed={isCollapsed}        // Estado collapsed
  onToggle={toggle}              // Callback toggle
  position="left"                // "left" | "right"
  style={customStyle}
>
  {/* Composition: cualquier contenido */}
  <SidebarHeader>
    <UserProfile user={user} />
  </SidebarHeader>
  
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

#### Componentes Internos:

1. **Sidebar** (container principal)
2. **SidebarHeader** (sección superior - opcional)
3. **SidebarNav** (navegación principal)
4. **SidebarItem** (item individual de navegación)
5. **SidebarFooter** (sección inferior - opcional)
6. **SidebarDivider** (separador visual)

#### Props de `SidebarItem`:
```javascript
{
  icon: string,           // Feather icon name
  label: string,          // Texto del item
  active: boolean,        // Si está activo
  badge: string|number,   // Badge opcional
  variant: string,        // "default" | "danger" | "success"
  onPress: func,          // Callback
  disabled: boolean,      // Deshabilitado
  leftElement: ReactNode, // Custom left (reemplaza icon)
  rightElement: ReactNode,// Custom right (reemplaza badge)
}
```

---

## 🔄 Migración

### Navbar → Sin breaking changes
```javascript
// ✅ Código existente funciona igual
<Navbar left={...} right={...} />

// ✅ Nuevas props opcionales
<Navbar 
  left={...} 
  right={...}
  sticky={true}
  shadow={true}
  variant="floating"
/>
```

### Sidebar → Breaking changes necesarios

#### ❌ Antes:
```javascript
<Sidebar
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={onTabChange}
  user={user}
  onLogout={onLogout}
/>
```

#### ✅ Después:
```javascript
<Sidebar width={240} position="left">
  <SidebarHeader>
    {user && (
      <View style={{ padding: 20 }}>
        <Text>{user.name}</Text>
        <Text>{user.role}</Text>
      </View>
    )}
  </SidebarHeader>
  
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
- ✅ Completamente flexible
- ✅ Fácil agregar sections custom
- ✅ Reordenar elementos libremente
- ✅ Custom styling por sección
- ✅ Extensible sin modificar el componente base

---

## 🎨 Casos de Uso

### 1. Sidebar Minimalista
```javascript
<Sidebar width={60} collapsed={true}>
  <SidebarNav>
    <SidebarItem icon="home" active={true} onPress={...} />
    <SidebarItem icon="users" onPress={...} />
    <SidebarItem icon="settings" onPress={...} />
  </SidebarNav>
</Sidebar>
```

### 2. Sidebar con Custom Header
```javascript
<Sidebar>
  <SidebarHeader>
    <Image source={logo} />
    <Text>Mi App</Text>
  </SidebarHeader>
  <SidebarNav>{/* tabs */}</SidebarNav>
</Sidebar>
```

### 3. Sidebar con Múltiples Secciones
```javascript
<Sidebar>
  <SidebarNav>
    <SidebarItem icon="home" label="Dashboard" />
    <SidebarItem icon="users" label="Usuarios" />
  </SidebarNav>
  
  <SidebarDivider />
  
  <SidebarNav>
    <SidebarItem icon="settings" label="Configuración" />
    <SidebarItem icon="help-circle" label="Ayuda" />
  </SidebarNav>
  
  <SidebarFooter>
    <SidebarItem icon="log-out" label="Salir" variant="danger" />
  </SidebarFooter>
</Sidebar>
```

### 4. Sidebar Right (Settings Panel)
```javascript
<Sidebar width={300} position="right">
  <SidebarHeader>
    <Text>Configuración</Text>
    <CloseButton />
  </SidebarHeader>
  
  <ScrollView>
    <ToggleRow label="Dark Mode" />
    <ToggleRow label="Notifications" />
    <Select label="Language" />
  </ScrollView>
</Sidebar>
```

---

## 📋 Checklist de Implementación

### Navbar:
- [ ] Agregar prop `height`
- [ ] Agregar prop `sticky`
- [ ] Agregar prop `shadow`
- [ ] Agregar prop `transparent`
- [ ] Agregar prop `variant`
- [ ] Agregar prop `zIndex`
- [ ] Actualizar JSDoc
- [ ] Crear ejemplos de uso

### Sidebar:
- [ ] Crear `Sidebar.js` (container)
- [ ] Crear `SidebarHeader.js`
- [ ] Crear `SidebarNav.js`
- [ ] Crear `SidebarItem.js`
- [ ] Crear `SidebarFooter.js`
- [ ] Crear `SidebarDivider.js`
- [ ] Actualizar barrel export (`index.js`)
- [ ] Migrar `DashboardScreen.js` al nuevo API
- [ ] Crear guía de migración
- [ ] JSDoc completo en todos los componentes

---

## ✅ Decisiones de Diseño

### ¿Por qué composition en Sidebar?

**❌ Props específicos (actual):**
```javascript
<Sidebar 
  tabs={tabs} 
  user={user} 
  onLogout={onLogout}
  // ¿Qué pasa si necesito agregar un search input?
  // ¿Y si quiero reordenar user y tabs?
  // ¿Y si quiero 2 secciones de navegación?
/>
```

**✅ Composition (propuesto):**
```javascript
<Sidebar>
  <SearchInput />  {/* Fácil agregar */}
  <SidebarHeader><UserProfile /></SidebarHeader>  {/* Fácil reordenar */}
  <SidebarNav>{/* tabs 1 */}</SidebarNav>
  <SidebarNav>{/* tabs 2 */}</SidebarNav>  {/* Múltiples secciones */}
  <CustomElement />  {/* Cualquier cosa */}
</Sidebar>
```

**Filosofía:** "La View decide qué y cómo, el componente solo provee la base"

---

## 🎯 Resultado Esperado

### Navbar:
- ✅ Más props configurables
- ✅ 100% backward compatible
- ✅ Soporta más casos de uso (sticky, floating, transparent)

### Sidebar:
- ✅ Completamente genérico
- ✅ Composición flexible
- ✅ Extensible sin modificar el componente
- ✅ Consistente con filosofía de Fase 1 (hero/)
- ⚠️ Breaking changes (requiere migración)

---

**Próximo paso:** Implementar refactorizaciones según este plan.
