# 🎯 Hero Components - Análisis para Refactorización Genérica

## 📋 Estado Actual

### Componentes Existentes

```
hero/
├── heroButtons.js   → Wrapper de Button (2 botones en row)
├── heroLeft.js      → Contenedor left: Title + Buttons + Stats
├── heroRight.js     → Contenedor right: Logo + Badges flotantes
├── heroStats.js     → Grid de estadísticas (value + label)
└── heroTitle.js     → Título con accent color
```

### ❌ Problemas Identificados

1. **heroButtons.js**: Solo envuelve 2 botones. No es necesario, se puede usar directamente Button.
2. **heroLeft.js**: Demasiado específico del Landing. Hardcodea estructura (Title → Buttons → Stats).
3. **heroRight.js**: Hardcodea logo de splash-icon.png y círculo decorativo.
4. **Nombres confusos**: "Left" y "Right" no describen funcionalidad, solo posición en Landing.

### ✅ Componentes que SÍ son genéricos

- **heroStats.js**: Ya es genérico, recibe `stats[]` y los renderiza.
- **heroTitle.js**: Ya es genérico, recibe `title`, `accent`, `end`.

---

## 🎨 Diseño de Refactorización

### Objetivo
Hacer que `hero/` sea **completamente reutilizable** para cualquier View que necesite:
- Secciones hero con contenido flexible
- Títulos destacados con acentos
- Estadísticas visuales
- Contenido multimedia (imágenes, badges)

### Principios
1. **Props configurables**: Todos los componentes deben aceptar props para personalizar contenido y estilo.
2. **Composición > Estructura fija**: Los componentes no deben imponer un layout específico.
3. **Nombres descriptivos**: Los nombres deben describir **qué hacen**, no **dónde están**.

---

## 🔧 Plan de Refactorización

### 1. **Eliminar `heroButtons.js`**
**Razón**: Wrapper innecesario de 2 botones.

**Solución**: Usar `<Button>` directamente en las Views.

```javascript
// ❌ Antes
<HeroButtons primary="Registrarse" secondary="Login" onPrimary={...} onSecondary={...} />

// ✅ Después
<View style={{ flexDirection: "row", gap: sp(12) }}>
  <Button label="Registrarse" onPress={...} />
  <Button label="Login" variant="outline" onPress={...} />
</View>
```

---

### 2. **Refactorizar `heroLeft.js` → `HeroSection.js`**
**Razón**: Nombre confuso y estructura hardcodeada.

**Nueva firma**:
```javascript
export default function HeroSection({ 
  children,           // Contenido flexible (title, buttons, stats, custom)
  fadeAnim,           // Animación fade (opcional)
  slideAnim,          // Animación slide (opcional)
  layout = "column",  // "column" | "row"
  align = "flex-start", // Alineación
  gap = 36,
  style,              // Estilos custom
}) {
  return (
    <Animated.View style={[
      { gap: sp(gap), flexDirection: layout, alignItems: align },
      fadeAnim && { opacity: fadeAnim },
      slideAnim && { transform: [{ translateX: slideAnim }] },
      style
    ]}>
      {children}
    </Animated.View>
  );
}
```

**Uso**:
```javascript
// Landing puede usar composition
<HeroSection fadeAnim={fadeLeft} slideAnim={slideLeft}>
  <HeroTitle title="Asistencia" accent="inteligente" end="para tu institución" />
  <View style={{ flexDirection: "row", gap: sp(12) }}>
    <Button label="Registrarse" onPress={...} />
    <Button label="Login" variant="outline" onPress={...} />
  </View>
  <HeroStats stats={STATS} />
</HeroSection>

// Otra view puede usarlo diferente
<HeroSection layout="row" align="center">
  <HeroTitle title="Dashboard" accent="Administrativo" />
  <Text>Contenido custom</Text>
</HeroSection>
```

---

### 3. **Refactorizar `heroRight.js` → `HeroMediaSection.js`**
**Razón**: Hardcodea imagen específica y círculo decorativo.

**Nueva firma**:
```javascript
export default function HeroMediaSection({ 
  mediaSource,         // Imagen/logo (require() o URI)
  mediaSize,           // Tamaño custom o auto-responsive
  decorationCircle = true, // Mostrar círculo decorativo
  circleColor,         // Color del círculo (default: brand.primaryLight)
  badges = [],         // Array de badges flotantes
  fadeAnim,
  slideAnim,
  style,
}) {
  const { sp, isSmall } = useResponsive();
  const { theme } = useTheme();
  const c = theme.colors;

  const containerSize = mediaSize || (isSmall ? sp(260) : sp(400));
  const circleSize = containerSize * 0.8;
  const logoSize = containerSize * 0.5;

  return (
    <Animated.View style={[
      { width: containerSize, height: containerSize, alignItems: "center", justifyContent: "center" },
      fadeAnim && { opacity: fadeAnim },
      slideAnim && { transform: [{ translateX: slideAnim }] },
      style
    ]}>
      {decorationCircle && (
        <View style={{
          position: "absolute",
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: circleColor || c.brand.primaryLight,
          opacity: 0.7,
        }} />
      )}

      {mediaSource && (
        <Image
          source={mediaSource}
          style={{ width: logoSize, height: logoSize, zIndex: 1 }}
          resizeMode="contain"
        />
      )}

      {badges.map((b, idx) => (
        <FloatingBadge
          key={b.label || idx}
          label={b.label}
          icon={b.icon}
          delay={b.delay}
          style={b.style}
        />
      ))}
    </Animated.View>
  );
}
```

**Uso**:
```javascript
// Landing
<HeroMediaSection 
  mediaSource={require("../../../assets/images/splash-icon.png")}
  badges={BADGES}
  fadeAnim={fadeRight}
  slideAnim={slideRight}
/>

// Dashboard con imagen diferente, sin círculo
<HeroMediaSection 
  mediaSource={require("../../../assets/images/dashboard-hero.png")}
  decorationCircle={false}
/>

// Otra view sin imagen, solo badges
<HeroMediaSection badges={CUSTOM_BADGES} />
```

---

### 4. **Mantener `heroStats.js` → `HeroStats.js`** ✅
Ya es genérico. Solo renombrar a PascalCase consistente.

---

### 5. **Mantener `heroTitle.js` → `HeroTitle.js`** ✅
Ya es genérico. Solo renombrar a PascalCase consistente.

---

## 📦 Estructura Final

```
hero/
├── HeroSection.js       → Contenedor genérico con animaciones (antes heroLeft)
├── HeroMediaSection.js  → Sección multimedia genérica (antes heroRight)
├── HeroStats.js         → Grid de estadísticas (ya genérico)
├── HeroTitle.js         → Título con accent (ya genérico)
└── index.js             → Barrel export
```

**Eliminado**:
- ❌ `heroButtons.js` (usar Button directamente)

---

## 🔄 Migración de LandingScreen

### Antes:
```javascript
<HeroLeft
  fadeLeft={fadeLeft} slideLeft={slideLeft}
  title="Asistencia" accent="inteligente" end="para tu institución"
  primary="Registrarse" secondary="Iniciar sesión"
  stats={STATS}
  onPrimary={...} onSecondary={...}
/>
<HeroRight fadeRight={fadeRight} slideRight={slideRight} badges={BADGES} />
```

### Después:
```javascript
<HeroSection fadeAnim={fadeLeft} slideAnim={slideLeft} gap={36}>
  <HeroTitle title="Asistencia" accent="inteligente" end="para tu institución" />
  <View style={{ flexDirection: "row", gap: sp(12) }}>
    <Button label="Registrarse" onPress={...} />
    <Button label="Iniciar sesión" variant="outline" onPress={...} />
  </View>
  <HeroStats stats={STATS} />
</HeroSection>

<HeroMediaSection 
  mediaSource={require("../../../assets/images/splash-icon.png")}
  badges={BADGES}
  fadeAnim={fadeRight}
  slideAnim={slideRight}
/>
```

**Beneficios**:
- ✅ Más explícito: se ve exactamente qué se renderiza
- ✅ Más flexible: se puede reordenar o agregar elementos custom
- ✅ Más reutilizable: otros screens pueden usar composition diferente

---

## ✅ Checklist de Implementación

1. [ ] Crear `HeroSection.js` (reemplaza heroLeft.js)
2. [ ] Crear `HeroMediaSection.js` (reemplaza heroRight.js)
3. [ ] Renombrar `heroStats.js` → `HeroStats.js`
4. [ ] Renombrar `heroTitle.js` → `HeroTitle.js`
5. [ ] Eliminar `heroButtons.js`
6. [ ] Actualizar `index.js` barrel export
7. [ ] Migrar `LandingScreen.js` al nuevo API
8. [ ] Verificar que animaciones y responsive funcionan
9. [ ] Eliminar archivos antiguos

---

## 🎓 Filosofía del Diseño

> **"El chiste es que cualquier view pueda decir 'ey necesito tal y tal de tal forma' y que sencillamente el proyecto ya sepa que es lo que está buscando como base y la view ya simplemente determina como o si ya la base en sí le sirve"**

**Aplicado a hero/**:
- `HeroSection`: "Necesito una sección hero con layout flexible" → View decide qué componentes van dentro
- `HeroMediaSection`: "Necesito mostrar multimedia con decoraciones" → View decide imagen, círculo, badges
- `HeroTitle`, `HeroStats`: Ya son bases genéricas → View solo pasa props

**Resultado**: Componentes base sólidos, Views tienen control total de composición.
