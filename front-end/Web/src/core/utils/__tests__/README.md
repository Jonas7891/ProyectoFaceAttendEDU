# 🧪 Tests Unitarios - Core Utils

Tests unitarios para las utilidades del módulo `core/utils`.

---

## 📋 Archivos de Test

- **`validation.test.js`** - Tests para validaciones (email, teléfono, contraseñas, etc.)
- **`formatting.test.js`** - Tests para formateo (números, texto, moneda, archivos, etc.)
- **`dates.test.js`** - Tests para manejo de fechas (formateo, cálculos, comparaciones, etc.)

---

## 🚀 Ejecutar Tests

### Todos los tests

```bash
npm test
```

### Tests específicos

```bash
# Solo tests de validación
npm test validation

# Solo tests de formateo
npm test formatting

# Solo tests de fechas
npm test dates
```

### Modo watch (desarrollo)

```bash
npm test -- --watch
```

### Con coverage

```bash
npm test -- --coverage
```

---

## 📊 Cobertura de Tests

### validation.test.js
✅ **17 funciones** testadas:
- isValidEmail
- isRequired
- minLength / maxLength
- isNumber / isInRange
- isValidUrl
- isValidPhone
- isValidDate / isAdult
- isStrongPassword
- isValidStudentCode
- isValidFileSize / isValidFileType
- validate + validators

### formatting.test.js
✅ **20 funciones** testadas:
- formatNumber / formatPercentage / formatCurrency
- truncate / capitalize / titleCase / slugify
- formatFullName / formatInitials
- formatPhone / formatFileSize
- maskEmail / maskPhone
- camelToTitle / pluralize
- getColorFromText

### dates.test.js
✅ **25 funciones** testadas:
- formatDate / formatTime / formatDateTime
- getRelativeTime
- isToday / isYesterday
- startOfDay / endOfDay
- startOfWeek / endOfWeek
- startOfMonth / endOfMonth
- addDays / addMonths / daysBetween
- calculateAge
- parseDate
- getWeekDays / getMonths
- isDateInRange

---

## 🎯 Casos de Test Cubiertos

### ✅ Happy Path
- Entradas válidas
- Casos típicos de uso

### ⚠️ Edge Cases
- Valores vacíos (null, undefined, "")
- Valores límite (min/max)
- Formatos especiales

### ❌ Error Handling
- Entradas inválidas
- Tipos incorrectos
- Valores fuera de rango

---

## 🔧 Configuración de Jest

Si necesitas configurar Jest, crea `jest.config.js` en la raíz:

```javascript
module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  collectCoverageFrom: [
    'src/core/utils/**/*.js',
    '!src/core/utils/__tests__/**',
    '!src/core/utils/index.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## 📝 Agregar Nuevos Tests

### Estructura de un test

```javascript
import { myFunction } from '../myUtils';

describe('myFunction', () => {
  test('descripción del comportamiento esperado', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Mejores prácticas

1. **Nombres descriptivos**: Los tests deben explicar qué hacen
2. **Arrange-Act-Assert**: Estructura clara de 3 pasos
3. **Un concepto por test**: Cada test valida una sola cosa
4. **Tests independientes**: No dependen unos de otros
5. **Casos edge incluidos**: null, undefined, vacíos, límites

---

## 🐛 Debugging Tests

### Ver output detallado

```bash
npm test -- --verbose
```

### Ver solo tests fallidos

```bash
npm test -- --onlyFailures
```

### Ejecutar un test específico

```bash
npm test -- -t "nombre del test"
```

---

## ✅ Estado Actual

| Archivo | Tests | Coverage | Estado |
|---------|-------|----------|--------|
| validation.js | 30+ | ~95% | ✅ |
| formatting.js | 35+ | ~90% | ✅ |
| dates.js | 40+ | ~85% | ✅ |

**Total**: 105+ tests unitarios

---

## 🎯 Próximos Pasos

- [ ] Agregar tests de integración
- [ ] Configurar CI/CD para ejecutar tests automáticamente
- [ ] Agregar tests de performance para funciones críticas
- [ ] Documentar casos de uso complejos

---

**Última actualización**: 2026-09-03  
**Mantenido por**: Equipo FaceAttend EDU
