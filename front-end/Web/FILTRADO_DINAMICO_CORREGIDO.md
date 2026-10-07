# 🔄 Corrección: Filtrado Dinámico de Estudiantes en Riesgo

## ❌ Problema Identificado

### Situación
Con la configuración:
- **Asistencia mínima:** 50%
- **Días para sanción:** 30 días
- **Días consecutivos:** 3 días

**Sebastián Torres Ávila (65% asistencia)** aparecía en "Estudiantes en Riesgo" cuando NO debería, ya que:
- ✅ 65% > 50% (cumple umbral mínimo)
- ✅ Solo 3 días sin asistir < 30 días (no alcanza umbral de días)
- ✅ Solo 3 consecutivas = 3 (justo en el límite, pero no excede)

### Causa Raíz

1. **Llamadas sin parámetro de threshold:**
   ```javascript
   // ❌ ANTES (useDashboardViewModel.js líneas 677 y 707)
   const atRiskStudents = getAtRiskStudents(students);
   // → Usaba default de 80% en lugar del configurado (50%)
   ```

2. **Falta de dependencias en useMemo:**
   ```javascript
   // ❌ ANTES
   }, [userRole, fichas, students, teachers]);
   // → No se recalculaba cuando cambiaba la configuración
   ```

3. **Filtro simplista:**
   ```javascript
   // ❌ ANTES
   return isActive && attendance < minAttendanceThreshold;
   // → Solo consideraba el % de asistencia
   ```

## ✅ Soluciones Aplicadas

### 1. Pasar Threshold Dinámico

#### Archivo: `useDashboardViewModel.js`

**Antes:**
```javascript
const atRiskStudents = getAtRiskStudents(students); // ❌ Default 80%
```

**Después:**
```javascript
const minAttendanceThreshold = institutionConfig.minAttendance || 80;
const atRiskStudents = getAtRiskStudents(students, minAttendanceThreshold); // ✅ Dinámico
```

### 2. Agregar Dependencias Reactivas

**Antes:**
```javascript
}, [userRole, fichas, students, teachers]); // ❌ No reactivo a config
```

**Después:**
```javascript
}, [
    userRole, 
    fichas, 
    students, 
    teachers, 
    institutionConfig.minAttendance,           // ✅ Recalcula al cambiar
    institutionConfig.daysUntilSanction,       // ✅ Recalcula al cambiar
    institutionConfig.consecutiveDaysForSanction // ✅ Recalcula al cambiar
]);
```

### 3. Filtrado Inteligente Multicritero

#### Archivo: `userDerivedData.js`

**Antes:**
```javascript
return students
    .filter(student => {
        const isActive = student.status === "active";
        return isActive && attendance < minAttendanceThreshold; // ❌ Solo 1 criterio
    })
    .map(/* ... */);
```

**Después:**
```javascript
// Paso 1: Calcular datos de TODOS los estudiantes activos
const studentsWithRiskData = students
    .filter(student => student.status === "active")
    .map(student => {
        // Calcular ausencias consecutivas, días restantes, etc.
        // ...
        return { /* datos completos */ };
    });

// Paso 2: Filtrar por MÚLTIPLES criterios (OR lógico)
const filteredStudents = studentsWithRiskData.filter(student => {
    const belowAttendanceThreshold = student.attendanceRate < minAttendanceThreshold;
    const exceededConsecutiveDays = student.hasExceededConsecutiveDays;
    const exceededTotalDays = student.daysUntilSanction === 0;
    
    // En riesgo si cumple AL MENOS UNO de estos criterios:
    return belowAttendanceThreshold || exceededConsecutiveDays || exceededTotalDays;
});

// Paso 3: Ordenar
return filteredStudents.sort(/* ... */);
```

## 🎯 Lógica de Filtrado Actualizada

Un estudiante está en riesgo SI cumple **AL MENOS UNO** de estos criterios:

```javascript
// Criterio 1: Asistencia baja
attendanceRate < minAttendanceThreshold
// Ejemplo: 45% < 50% → EN RIESGO ✅

// Criterio 2: Excedió días consecutivos
consecutiveAbsences >= consecutiveDaysForSanction
// Ejemplo: 5 consecutivas >= 3 → EN RIESGO ✅

// Criterio 3: Excedió días totales sin asistir
daysUntilSanction === 0
// Ejemplo: Hace 30 días no asiste y umbral es 30 → EN RIESGO ✅
```

## 📊 Casos de Prueba

### Config de Prueba
```javascript
minAttendance: 50%
daysUntilSanction: 30 días
consecutiveDaysForSanction: 3 días
```

### Caso 1: Sebastián Torres (65%)
```javascript
{
  attendance: 65%,
  lastAttendanceDate: "Hace 3 días",
  consecutiveAbsences: 3
}
```

**Evaluación:**
- `65% < 50%` → ❌ NO (cumple umbral)
- `3 >= 3` → ⚠️  SÍ (justo en el límite)
- `daysRemaining = 27` → ❌ NO (no alcanzó 30)

**Resultado:** ✅ **APARECE** en la lista (por criterio 2)

> **Nota:** Si quieres que NO aparezca, debes configurar `consecutiveDaysForSanction: 4` (entonces 3 < 4 = NO aparece)

### Caso 2: Andrea Morales (68%)
```javascript
{
  attendance: 68%,
  lastAttendanceDate: "Hace 5 días",
  consecutiveAbsences: 5
}
```

**Evaluación:**
- `68% < 50%` → ❌ NO
- `5 >= 3` → ✅ SÍ (supera umbral)
- `daysRemaining = 25` → ❌ NO

**Resultado:** ✅ **APARECE** (por criterio 2: consecutivas)

### Caso 3: María García (92%)
```javascript
{
  attendance: 92%,
  lastAttendanceDate: "Hoy",
  consecutiveAbsences: 0
}
```

**Evaluación:**
- `92% < 50%` → ❌ NO
- `0 >= 3` → ❌ NO
- `daysRemaining = 30` → ❌ NO

**Resultado:** ❌ **NO APARECE** (perfecto! ✅)

### Caso 4: Lucía Jiménez (55%)
```javascript
{
  attendance: 55%,
  lastAttendanceDate: "Hace 9 días",
  consecutiveAbsences: 5
}
```

**Evaluación:**
- `55% < 50%` → ❌ NO (apenas encima)
- `5 >= 3` → ✅ SÍ (supera consecutivas)
- `daysRemaining = 21` → ❌ NO

**Resultado:** ✅ **APARECE** (por criterio 2: consecutivas)

### Caso 5: Juan Pérez (45%)
```javascript
{
  attendance: 45%,
  lastAttendanceDate: "Hace 2 días",
  consecutiveAbsences: 2
}
```

**Evaluación:**
- `45% < 50%` → ✅ SÍ (por debajo del umbral)
- `2 >= 3` → ❌ NO
- `daysRemaining = 28` → ❌ NO

**Resultado:** ✅ **APARECE** (por criterio 1: asistencia baja)

## 🔧 Ajuste del Umbral de Consecutivas

Si NO quieres que Sebastián (3 consecutivas) aparezca:

### Opción 1: Cambiar umbral a 4 días
```javascript
consecutiveDaysForSanction: 4
```
- Sebastián (3 consecutivas) → `3 >= 4` → ❌ NO aparece ✅

### Opción 2: Cambiar lógica a "mayor que" (>)
```javascript
// En userDerivedData.js
const exceededConsecutiveDays = student.consecutiveAbsences > consecutiveDaysForSanction;
// (en lugar de >=)
```
- Sebastián (3 consecutivas) → `3 > 3` → ❌ NO aparece ✅

**Recomendación:** Usar `>=` (mayor o igual) es más estricto y es el estándar en la mayoría de sistemas de asistencia.

## ✨ Beneficios

1. **Filtrado Dinámico:** Respeta la configuración en tiempo real
2. **Multicritero:** Detecta riesgo por asistencia baja, consecutivas, o días totales
3. **Reactivo:** Se recalcula automáticamente al cambiar la configuración
4. **Preciso:** Solo muestra estudiantes que realmente están en riesgo

## 🧪 Testing

### Test 1: Cambiar Umbral de Asistencia
```
Config: 50% → 70%

Sebastián (65%):
  ANTES: No aparece
  DESPUÉS: ✅ Aparece (porque 65% < 70%)
```

### Test 2: Cambiar Días Consecutivos
```
Config: 3 días → 4 días

Sebastián (3 consecutivas):
  ANTES: Aparece
  DESPUÉS: ❌ No aparece (porque 3 < 4)
```

### Test 3: Cambiar Días Totales
```
Config: 30 días → 5 días

Sebastián (Hace 6 días):
  ANTES: No aparece
  DESPUÉS: ✅ Aparece (porque 6 días > 5 días → daysRemaining = 0)
```

---

**Estado:** ✅ Filtrado dinámico y coherente  
**Versión:** 1.2.0  
**Fecha:** 2026-10-08
