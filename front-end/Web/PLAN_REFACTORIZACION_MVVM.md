# 🏗️ PLAN DE REFACTORIZACIÓN MVVM + DRY
## FaceAttendEDU - Arquitectura Limpia

---

## 🎯 OBJETIVO

Migrar de arquitectura híbrida **MVC/MVVM** a **MVVM puro** con componentes centralizados siguiendo el principio **DRY** (Don't Repeat Yourself).

---

## 📊 ANÁLISIS DE ARQUITECTURA ACTUAL

### **Problemas Identificados**

1. **Componentes duplicados** en diferentes carpetas
2. **Lógica mezclada** entre View y ViewModel
3. **Modals inconsistentes** (algunos usan BaseModal, otros no)
4. **Gráficas no reutilizables** (DailyBarChart solo en Dashboard)
5. **Botones dispersos** sin sistema de diseño unificado
6. **Formularios duplicados** en múltiples vistas
7. **Tabs/Pestañas** implementados manualmente cada vez
8. **Listas** con lógica repetida
9. **Badges** duplicados o con estilos inconsistentes

---

## 🏛️ NUEVA ESTRUCTURA MVVM PROPUESTA

```
src/
├── core/                           # 🆕 Capa de Infraestructura
│   ├── config/
│   │   ├── app.config.js           # Configuración global
│   │   └── theme.config.js         # Tema por defecto
│   ├── constants/
│   │   ├── routes.js               # Rutas de navegación
│   │   ├── colors.js               # ✅ Ya existe
│   │   ├── typography.js           # ✅ Ya existe
│   │   └── badgePositions.js       # ✅ Ya existe
│   └── utils/
│       ├── validation.js           # Validaciones reutilizables
│       ├── formatting.js           # Formateo de datos
│       └── dates.js                # Manejo de fechas
│
├── models/                         # ✅ Capa de Datos (existente)
│   ├── data/
│   │   ├── StudentStorage.js
│   │   ├── UserStorage.js
│   │   ├── EnvironmentStorage.js
│   │   └── mockData.js
│   └── types/
│       └── index.js
│
├── viewmodels/                     # ✅ Capa de Lógica (existente)
│   ├── useAuthViewModel.js
│   ├── useCoursesViewModel.js
│   ├── useDashboardViewModel.js
│   ├── useStudentsViewModel.js
│   ├── useEnvironmentsViewModel.js
│   └── useReportsViewModel.js
│
├── view/                           # 🔄 Capa de Presentación (refactorizar)
│   │
│   ├── screens/                    # 🎯 PANTALLAS/VISTAS COMPLETAS (todas las views viven aquí)
│   │   ├── LandingScreen.js        # ✅ Ya existe
│   │   ├── LoginScreen.js          # ✅ Ya existe
│   │   ├── SignupScreen.js         # ✅ Ya existe
│   │   ├── DashboardScreen.js      # ✅ Ya existe
│   │   ├── StudentsScreen.js       # 🆕 Migrar desde components/students/StudentsView.js
│   │   ├── CoursesScreen.js        # 🆕 Migrar desde components/courses/CoursesView.js
│   │   ├── EnvironmentsScreen.js   # 🆕 Migrar desde components/environments/EnvironmentsView.js
│   │   ├── ReportsScreen.js        # 🆕 Migrar desde components/reports/ReportsView.js
│   │   └── SettingsScreen.js       # 🆕 Migrar desde components/settings/SettingsView.js
│   │
│   ├── components/                 # 🧩 SOLO COMPONENTES REUTILIZABLES (NO VISTAS)
│   │   │
│   │   ├── common/                 # 🆕 Componentes compartidos (DRY)
│   │   │   ├── buttons/
│   │   │   │   ├── Button.js       # Botón base unificado
│   │   │   │   ├── IconButton.js
│   │   │   │   ├── FloatingButton.js
│   │   │   │   └── ButtonGroup.js
│   │   │   ├── inputs/
│   │   │   │   ├── TextInput.js
│   │   │   │   ├── Select.js
│   │   │   │   ├── Checkbox.js
│   │   │   │   ├── Switch.js
│   │   │   │   ├── DatePicker.js
│   │   │   │   └── FormField.js    # ✅ Migrar desde ui/
│   │   │   ├── modals/
│   │   │   │   ├── BaseModal.js    # ✅ Ya existe, mejorar
│   │   │   │   ├── ConfirmModal.js
│   │   │   │   ├── FormModal.js
│   │   │   │   └── DetailModal.js
│   │   │   ├── cards/
│   │   │   │   ├── Card.js         # Card base
│   │   │   │   ├── InfoCard.js
│   │   │   │   ├── StatCard.js
│   │   │   │   └── ActionCard.js
│   │   │   ├── lists/
│   │   │   │   ├── List.js         # Lista reutilizable
│   │   │   │   ├── ListItem.js
│   │   │   │   ├── VirtualList.js  # Para listas grandes
│   │   │   │   └── SearchableList.js
│   │   │   ├── tables/
│   │   │   │   ├── Table.js        # Tabla reutilizable
│   │   │   │   ├── TableHeader.js
│   │   │   │   ├── TableRow.js
│   │   │   │   ├── TableCell.js
│   │   │   │   └── PaginatedTable.js
│   │   │   ├── tabs/
│   │   │   │   ├── Tabs.js         # Sistema de pestañas
│   │   │   │   ├── Tab.js
│   │   │   │   └── TabPanel.js
│   │   │   ├── charts/             # 🆕 Gráficas centralizadas
│   │   │   │   ├── BarChart.js
│   │   │   │   ├── LineChart.js
│   │   │   │   ├── PieChart.js
│   │   │   │   ├── DoughnutChart.js
│   │   │   │   └── MixedChart.js
│   │   │   ├── badges/
│   │   │   │   ├── Badge.js        # Badge base
│   │   │   │   ├── StatusBadge.js
│   │   │   │   ├── AttendanceBadge.js # ✅ Migrar desde ui/
│   │   │   │   └── FloatingBadge.js   # ✅ Migrar desde ui/
│   │   │   ├── navigation/
│   │   │   │   ├── Navbar.js       # ✅ Migrar desde layout/
│   │   │   │   ├── Sidebar.js      # ✅ Migrar desde layout/
│   │   │   │   ├── Breadcrumbs.js
│   │   │   │   └── Pagination.js
│   │   │   ├── feedback/
│   │   │   │   ├── Alert.js
│   │   │   │   ├── Toast.js
│   │   │   │   ├── Loader.js
│   │   │   │   ├── Skeleton.js
│   │   │   │   └── EmptyState.js
│   │   │   ├── animation/
│   │   │   │   ├── FadeIn.js
│   │   │   │   ├── SlideIn.js
│   │   │   │   ├── AnimatedDropdown.js # ✅ Migrar desde ui/
│   │   │   │   └── AnimatedLayout.js
│   │   │   └── layout/
│   │   │       ├── Container.js
│   │   │       ├── Grid.js
│   │   │       ├── Flex.js
│   │   │       ├── Stack.js
│   │   │       └── Divider.js
│   │   │
│   │   ├── auth/                   # 🔧 Componentes específicos de autenticación
│   │   │   ├── AuthLayout.js       # Layout para login/signup
│   │   │   ├── AuthForm.js         # Formulario base auth
│   │   │   └── AuthBanner.js       # Banner de errores
│   │   │
│   │   ├── students/               # 🔧 Componentes específicos de estudiantes (NO la vista)
│   │   │   ├── StudentCard.js      # Card individual de estudiante
│   │   │   ├── StudentList.js      # Lista de estudiantes
│   │   │   ├── StudentTable.js     # Tabla de estudiantes
│   │   │   └── modals/             # Modals específicos de estudiantes
│   │   │       ├── StudentDetailModal.js
│   │   │       ├── RegisterStudentModal.js
│   │   │       ├── ImportStudentsModal.js
│   │   │       └── FaceRegistrationModal/
│   │   │           ├── index.js
│   │   │           ├── OptionsStep.js
│   │   │           ├── CameraStep.js
│   │   │           ├── ConfirmStep.js
│   │   │           └── DoneStep.js
│   │   │
│   │   ├── courses/                # 🔧 Componentes específicos de cursos
│   │   │   ├── CourseCard.js       # Card individual de curso
│   │   │   ├── CourseList.js       # Lista de cursos
│   │   │   └── CourseDetailModal.js
│   │   │
│   │   ├── environments/           # 🔧 Componentes específicos de ambientes
│   │   │   ├── EnvironmentCard.js
│   │   │   ├── EnvironmentList.js
│   │   │   └── modals/
│   │   │       ├── EnvironmentFormModal.js
│   │   │       ├── EnvironmentDetailModal.js
│   │   │       └── ScheduleModal.js
│   │   │
│   │   ├── dashboard/              # 🔧 Componentes específicos de dashboard
│   │   │   ├── StatisticsPanel.js  # Panel de estadísticas
│   │   │   ├── WeeklyTrend.js      # Gráfica de tendencias
│   │   │   ├── RecentActivity.js   # Actividad reciente
│   │   │   └── QuickActions.js     # Acciones rápidas
│   │   │
│   │   ├── reports/                # 🔧 Componentes específicos de reportes
│   │   │   ├── ReportFilters.js    # Filtros de reportes
│   │   │   ├── ReportChart.js      # Gráfica de reporte
│   │   │   └── ExportButton.js     # Botón de exportación
│   │   │
│   │   ├── settings/               # 🔧 Componentes específicos de configuración
│   │   │   ├── SettingCard.js      # Card de configuración
│   │   │   ├── ColorPicker.js      # Selector de color
│   │   │   └── tabs/               # Tabs de settings (contenido, no el tab system)
│   │   │       ├── ThemeTab.js
│   │   │       ├── LanguageTab.js
│   │   │       ├── AccountTab.js
│   │   │       ├── PrivacyTab.js
│   │   │       ├── NotificationsTab.js
│   │   │       ├── AboutTab.js
│   │   │       ├── ExportTab.js
│   │   │       ├── ImportTab.js
│   │   │       ├── HelpTab.js
│   │   │       └── PersonalizationTab.js
│   │   │
│   │   └── hero/                   # 🔧 Componentes del landing hero
│   │       ├── HeroLeft.js         # ✅ Ya existe
│   │       ├── HeroRight.js        # ✅ Ya existe
│   │       ├── HeroStats.js        # ✅ Ya existe
│   │       └── HeroButtons.js      # ✅ Ya existe
│   │
│   └── hooks/                      # ✅ Custom hooks de UI (existentes)
│       ├── useResponsive.js
│       ├── useTheme.js
│       ├── useFloatAnimation.js
│       ├── useAuthAnimation.js
│       └── useRolePermissions.js
│
├── context/                        # ✅ Context API (existente)
│   ├── AuthContext.js
│   └── AppDataContext.js
│
├── i18n/                           # ✅ Internacionalización (existente)
│   └── ...
│
└── navegation/                     # ✅ Navegación (existente)
    └── appNavigator.js
```

---

## 🔄 FASES DE REFACTORIZACIÓN

### **FASE 1: Crear Core Infrastructure** 🆕
**Objetivo:** Establecer fundamentos reutilizables

#### Tareas:
1. ✅ Crear `src/core/config/`
   - `app.config.js` - Configuración centralizada
   - `theme.config.js` - Tema base

2. ✅ Crear `src/core/utils/`
   - `validation.js` - Funciones de validación
   - `formatting.js` - Formateo de strings, números, etc.
   - `dates.js` - Utilidades de fechas

3. ✅ Mover constantes existentes a `src/core/constants/`
   - Migrar `view/components/constants/*` → `core/constants/`

---

### **FASE 2: Componentes Base (Common)** 🎨
**Objetivo:** Crear biblioteca de componentes reutilizables

#### 2.1 Sistema de Botones
```javascript
// src/view/components/common/buttons/Button.js
export function Button({
  variant = 'primary',     // primary | secondary | outline | ghost | danger
  size = 'md',             // sm | md | lg
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
  ...props
}) { ... }

// Variantes:
// - PrimaryButton
// - SecondaryButton
// - IconButton
// - FloatingButton
// - ButtonGroup
```

#### 2.2 Sistema de Inputs
```javascript
// src/view/components/common/inputs/TextInput.js
export function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  leftIcon,
  rightIcon,
  type = 'text',        // text | email | password | number
  required = false,
  disabled = false,
  ...props
}) { ... }

// Otros componentes:
// - Select (dropdown)
// - Checkbox
// - Switch
// - DatePicker
// - FormField (mejorado del existente)
```

#### 2.3 Sistema de Modals
```javascript
// src/view/components/common/modals/BaseModal.js (mejorado)
export function BaseModal({
  visible,
  onClose,
  title,
  subtitle,
  size = 'md',          // sm | md | lg | xl | full
  closeOnBackdrop = true,
  showCloseButton = true,
  footer,
  children,
  ...props
}) { ... }

// Componentes especializados:
// - ConfirmModal (confirmaciones con botones Sí/No)
// - FormModal (con validación integrada)
// - DetailModal (para mostrar detalles de entidades)
```

#### 2.4 Sistema de Cards
```javascript
// src/view/components/common/cards/Card.js
export function Card({
  variant = 'default',  // default | elevated | outlined
  padding = 'md',       // sm | md | lg
  onPress,
  header,
  footer,
  children,
  ...props
}) { ... }

// Variantes especializadas:
// - InfoCard (información estática)
// - StatCard (para métricas/estadísticas)
// - ActionCard (con botones de acción)
```

#### 2.5 Sistema de Charts 📊
```javascript
// src/view/components/common/charts/BarChart.js
export function BarChart({
  data,              // [{ label, value, color }]
  height = 200,
  showGrid = true,
  showLabels = true,
  animated = true,
  onBarPress,
  ...props
}) { ... }

// Migrar y generalizar:
// ✅ DailyBarChart → BarChart (con props configurables)
// 🆕 LineChart
// 🆕 PieChart
// 🆕 DoughnutChart
```

#### 2.6 Sistema de Listas
```javascript
// src/view/components/common/lists/List.js
export function List({
  data,
  renderItem,
  keyExtractor,
  loading,
  emptyMessage,
  searchable = false,
  onSearch,
  refreshing = false,
  onRefresh,
  ...props
}) { ... }

// - VirtualList (optimizado para grandes datasets)
// - SearchableList (con búsqueda integrada)
```

#### 2.7 Sistema de Tabs
```javascript
// src/view/components/common/tabs/Tabs.js
export function Tabs({
  tabs,              // [{ key, label, icon, content }]
  activeTab,
  onTabChange,
  variant = 'default', // default | pills | underline
  ...props
}) { ... }

// Usado en:
// - SettingsView (10 tabs actualmente manuales)
// - Reportes
// - Detalles de estudiantes
```

#### 2.8 Sistema de Badges
```javascript
// src/view/components/common/badges/Badge.js
export function Badge({
  variant = 'default',  // default | success | warning | danger | info
  size = 'md',          // sm | md | lg
  rounded = true,
  children,
  ...props
}) { ... }

// Migrar existentes:
// ✅ AttendanceBadge → StatusBadge (generalizado)
// ✅ FloatingBadge → Badge con prop floating
```

#### 2.9 Sistema de Navegación
```javascript
// Migrar desde layout/
// ✅ navBar.js → Navbar.js
// ✅ Sidebar.js (sin cambios)
// 🆕 Breadcrumbs.js
// 🆕 Pagination.js
```

#### 2.10 Sistema de Feedback
```javascript
// src/view/components/common/feedback/Alert.js
export function Alert({
  type = 'info',        // info | success | warning | error
  message,
  description,
  closable = false,
  onClose,
  ...props
}) { ... }

// Otros:
// - Toast (notificaciones temporales)
// - Loader (spinners)
// - Skeleton (loading states)
// - EmptyState (cuando no hay datos)
```

---

### **FASE 3: Refactorizar Features** 🔧
**Objetivo:** Migrar componentes de features para usar componentes comunes

#### 3.1 Dashboard
**Antes:**
```javascript
// DashboardView.js (línea 20)
export function DailyBarChart({ data }) { ... }
export function WeeklyTrend({ data }) { ... }
```

**Después:**
```javascript
import { BarChart, LineChart } from '../../common/charts';

function DashboardView() {
  return (
    <BarChart
      data={dailyData}
      height={200}
      animated
      showGrid
    />
  );
}
```

#### 3.2 Students
**Antes:**
- Modals con estilos inconsistentes
- Lógica de formularios duplicada
- Botones custom en cada modal

**Después:**
```javascript
import { FormModal } from '../../common/modals';
import { Button } from '../../common/buttons';
import { TextInput, Select } from '../../common/inputs';

function RegisterStudentModal({ visible, onClose, onSubmit }) {
  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title="Registrar Estudiante"
      onSubmit={onSubmit}
    >
      <TextInput label="Nombre" required />
      <TextInput label="Apellido" required />
      <Select label="Curso" options={courses} />
    </FormModal>
  );
}
```

#### 3.3 Courses
**Antes:**
- CourseCard con estilos inline
- Modal custom

**Después:**
```javascript
import { Card } from '../../common/cards';
import { DetailModal } from '../../common/modals';

function CourseCard({ course, onPress }) {
  return (
    <Card
      variant="elevated"
      onPress={onPress}
      header={<CourseHeader course={course} />}
      footer={<CourseActions course={course} />}
    >
      <CourseContent course={course} />
    </Card>
  );
}
```

#### 3.4 Settings
**Antes:**
- 10 tabs con lógica manual de switching
- Cada tab es un componente separado sin patrón común

**Después:**
```javascript
import { Tabs } from '../../common/tabs';
import { ThemeTab, LanguageTab, AccountTab, ... } from './tabs';

function SettingsView() {
  const tabs = [
    { key: 'theme', label: 'Tema', icon: '🎨', content: <ThemeTab /> },
    { key: 'language', label: 'Idioma', icon: '🌍', content: <LanguageTab /> },
    { key: 'account', label: 'Cuenta', icon: '👤', content: <AccountTab /> },
    // ... resto de tabs
  ];

  return <Tabs tabs={tabs} />;
}
```

---

### **FASE 4: Eliminar Código Legacy** 🗑️
**Objetivo:** Remover componentes duplicados después de migración

#### Archivos a eliminar/refactorizar:
```
❌ src/view/components/constants/        → movido a core/constants/
❌ src/view/components/layout/           → movido a common/navigation/
❌ src/view/components/ui/button.js      → reemplazado por common/buttons/
❌ src/view/components/ui/floatingBadge.js → reemplazado por common/badges/
⚠️  src/view/components/ui/BaseModal.js  → mejorado y movido a common/modals/
⚠️  src/view/components/ui/FormField.js  → mejorado y movido a common/inputs/
```

---

### **FASE 5: Testing & Validación** ✅
**Objetivo:** Garantizar que todo funciona

#### Checklist:
- [ ] Todas las screens renderizan correctamente
- [ ] Todos los modals abren y cierran
- [ ] Formularios validan correctamente
- [ ] Gráficas muestran datos
- [ ] Navegación funciona
- [ ] Responsive design mantiene consistencia
- [ ] Tema oscuro/claro funciona
- [ ] i18n funciona en todos los componentes nuevos

---

## 📐 PRINCIPIOS MVVM A SEGUIR

### 1. **Separación de Responsabilidades**

```javascript
// ❌ MAL: Lógica en la View
function StudentsView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStudents().then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, []);
  
  return <List data={students} loading={loading} />;
}

// ✅ BIEN: Lógica en ViewModel
function StudentsView() {
  const { students, loading } = useStudentsViewModel();
  return <List data={students} loading={loading} />;
}
```

### 2. **Componentes Puros (Presentational)**

```javascript
// ✅ Componente solo recibe props y renderiza
export function StudentCard({ student, onPress, onEdit, onDelete }) {
  return (
    <Card onPress={onPress}>
      <Text>{student.name}</Text>
      <ButtonGroup>
        <IconButton icon="edit" onPress={onEdit} />
        <IconButton icon="delete" onPress={onDelete} />
      </ButtonGroup>
    </Card>
  );
}

// ❌ NO hacer fetch ni lógica dentro del componente
```

### 3. **Props Documentadas**

```javascript
/**
 * Botón reutilizable con variantes y tamaños
 * 
 * @param {string} variant - Estilo del botón: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Si el botón debe ocupar todo el ancho
 * @param {boolean} loading - Muestra spinner
 * @param {boolean} disabled - Deshabilita el botón
 * @param {ReactNode} leftIcon - Icono a la izquierda
 * @param {ReactNode} rightIcon - Icono a la derecha
 * @param {function} onPress - Callback al presionar
 * @param {ReactNode} children - Contenido del botón
 */
export function Button({ variant, size, ... }) { ... }
```

### 4. **Composición sobre Herencia**

```javascript
// ✅ Componer componentes pequeños
function StudentDetailModal({ student }) {
  return (
    <DetailModal title={student.name}>
      <StudentInfo student={student} />
      <StudentCourses courses={student.courses} />
      <StudentAttendance data={student.attendance} />
    </DetailModal>
  );
}

// ❌ Evitar componentes monolíticos
```

---

## 🎨 SISTEMA DE DISEÑO

### **Tokens de Diseño**

```javascript
// src/core/config/theme.config.js
export const tokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  shadows: {
    sm: { ... },
    md: { ... },
    lg: { ... },
  },
};
```

### **Uso Consistente**

```javascript
// ✅ Usar tokens
<View style={{ padding: tokens.spacing.md, borderRadius: tokens.borderRadius.lg }}>

// ❌ Evitar valores hardcoded
<View style={{ padding: 16, borderRadius: 12 }}>
```

---

## 📦 ESTRUCTURA DE EXPORTS

### **Index Barrels**

```javascript
// src/view/components/common/buttons/index.js
export { Button } from './Button';
export { IconButton } from './IconButton';
export { FloatingButton } from './FloatingButton';
export { ButtonGroup } from './ButtonGroup';

// src/view/components/common/index.js
export * from './buttons';
export * from './inputs';
export * from './modals';
export * from './cards';
export * from './charts';
export * from './badges';
export * from './lists';
export * from './tabs';
export * from './navigation';
export * from './feedback';
export * from './animation';
export * from './layout';
```

### **Imports Limpios**

```javascript
// ✅ Import desde barrel
import { Button, IconButton, ButtonGroup } from '@/view/components/common';

// ❌ Imports largos
import { Button } from '@/view/components/common/buttons/Button';
import { IconButton } from '@/view/components/common/buttons/IconButton';
```

---

## 🔍 CHECKLIST DE COMPONENTE REUTILIZABLE

Cada componente común debe cumplir:

- [ ] **Props documentadas** con JSDoc
- [ ] **Variantes definidas** (size, variant, etc.)
- [ ] **Theming** (usa theme de contexto)
- [ ] **Responsive** (adapta a diferentes tamaños)
- [ ] **Accesible** (labels, roles ARIA)
- [ ] **Testeable** (props controladas, sin side effects)
- [ ] **Composable** (puede contener children)
- [ ] **Consistente** (sigue design tokens)

---

## 📈 MÉTRICAS DE ÉXITO

### **Antes de Refactorización**
- 🔴 **Componentes duplicados:** ~15+
- 🔴 **Archivos con lógica mixta MVC/MVVM:** ~8
- 🔴 **Botones custom diferentes:** ~6
- 🔴 **Modals inconsistentes:** ~7
- 🔴 **Código repetido (DRY):** Alto

### **Después de Refactorización**
- 🟢 **Componentes reutilizables:** ~50+
- 🟢 **Arquitectura MVVM pura:** 100%
- 🟢 **Sistema de diseño unificado:** ✅
- 🟢 **Reducción de código:** ~30-40%
- 🟢 **Mantenibilidad:** Alta
- 🟢 **Velocidad de desarrollo:** +50%

---

## 🚀 PRÓXIMOS PASOS

1. **Aprobar este plan**
2. **Comenzar con FASE 1** (Core Infrastructure)
3. **Continuar con FASE 2** (Componentes Common)
4. **Migrar features en FASE 3**
5. **Cleanup en FASE 4**
6. **Validar en FASE 5**

---

## 📚 REFERENCIAS

- [MVVM Pattern](https://docs.microsoft.com/en-us/xamarin/xamarin-forms/enterprise-application-patterns/mvvm)
- [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [Component Composition](https://reactjs.org/docs/composition-vs-inheritance.html)
- [Design Systems](https://www.designsystems.com/)

---

**Generado:** Septiembre 1, 2026  
**Proyecto:** FaceAttendEDU - React Native Web  
**Arquitectura:** MVVM + DRY
