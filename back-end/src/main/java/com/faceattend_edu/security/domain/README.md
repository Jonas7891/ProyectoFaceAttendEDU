# Domain Layer - Capa de Dominio

## Descripción General

La capa de dominio contiene la **lógica de negocio central** del sistema FaceAttend-EDU. Define los modelos, excepciones, DTOs y puertos (interfaces) que representan los conceptos principales del dominio y establecen los contratos que el resto de la aplicación debe cumplir.

## Responsabilidades Principales

- **Modelos de Dominio**: Representación de las entidades del negocio (Escuela, Usuario, Curso, Asistencia, etc.)
- **Data Transfer Objects (DTOs)**: Objetos para transferencia de datos entre capas
- **Puertos**: Interfaces que definen contratos para repositorios y servicios
- **Excepciones Personalizadas**: Errores específicos del dominio de negocio
- **Lógica de Negocio Pura**: Reglas y restricciones del negocio sin dependencias técnicas

## Estructura de Directorios

```
domain/
├── model/                    # Modelos de dominio
│   ├── Action.java          # Acciones en el sistema
│   ├── Attendance.java      # Registros de asistencia
│   ├── Classroom.java       # Aulas
│   ├── Course.java          # Cursos
│   ├── Enrollment.java      # Inscripciones de estudiantes
│   ├── FacialEmbedding.java # Embeddings faciales
│   ├── IotDevice.java       # Dispositivos IoT
│   ├── Justification.java   # Justificaciones de inasistencia
│   ├── Log.java             # Registros de auditoría
│   ├── Module.java          # Módulos educativos
│   ├── Period.java          # Períodos académicos
│   ├── Person.java          # Información de personas
│   ├── Role.java            # Roles de usuarios
│   ├── Schedule.java        # Horarios de clases
│   ├── School.java          # Información escolar
│   ├── User.java            # Usuarios del sistema
│   └── View.java            # Vistas consolidadas de datos
│
├── port/                     # Puertos (interfaces de contrato)
│   ├── ActionRepositoryPort.java
│   ├── AttendanceRepositoryPort.java
│   ├── ClassroomRepositoryPort.java
│   ├── CourseRepositoryPort.java
│   ├── EnrollmentRepositoryPort.java
│   ├── FacialEmbeddingRepositoryPort.java
│   ├── IotDeviceRepositoryPort.java
│   ├── JustificationRepositoryPort.java
│   ├── LogRepositoryPort.java
│   ├── ModuleRepositoryPort.java
│   ├── PeriodRepositoryPort.java
│   ├── PersonRepositoryPort.java
│   ├── RoleRepositoryPort.java
│   ├── ScheduleRepositoryPort.java
│   ├── SchoolRepositoryPort.java
│   ├── UserRepositoryPort.java
│   └── ViewRepositoryPort.java
│
├── dto/
│   ├── request/              # DTOs para solicitudes HTTP
│   ├── response/             # DTOs para respuestas HTTP
│   └── patch/                # DTOs para actualizaciones parciales
│
└── exception/                # Excepciones personalizadas
    ├── BaseException.java           # Excepción base
    ├── BusinessException.java       # Errores de lógica de negocio
    ├── DuplicateResourceException.java
    ├── ForbiddenException.java
    ├── NotFoundException.java
    ├── UnauthorizedException.java
    └── ValidationException.java
```

## Conceptos Clave

### Modelos de Dominio (`model/`)

Representan las entidades principales del negocio. Cada modelo es **independiente de la tecnología** y contiene:
- Identificadores únicos (ID)
- Atributos del dominio
- Relaciones entre entidades
- Restricciones de negocio

**Ejemplo conceptual:**
```java
public class User {
    private UUID id;
    private String username;
    private String email;
    private Role role;
    private boolean active;
    // Lógica de negocio pura
}
```

### Puertos (`port/`)

Son **interfaces que definen contratos** para acceso a datos. Permiten que la lógica de negocio sea **independiente de la implementación**:

- `XXXRepositoryPort`: Define operaciones CRUD y consultas personalizadas
- Implementadas en la capa de `infrastructure/persistence`
- Inyectadas en servicios de `application`

### DTOs (Data Transfer Objects)

Objetos especializados para diferentes propósitos:

- **Request DTOs** (`dto/request/`): Validación y mapeo de datos de entrada
- **Response DTOs** (`dto/response/`): Formato de salida hacia el cliente
- **Patch DTOs** (`dto/patch/`): Actualizaciones parciales

### Excepciones Personalizadas (`exception/`)

Jerarquía de excepciones para casos de error específicos del negocio:

| Excepción | Caso de Uso | HTTP Status |
|-----------|-----------|------------|
| `BaseException` | Clase base para todas | Varía |
| `BusinessException` | Violación de reglas de negocio | 400 |
| `NotFoundException` | Recurso no encontrado | 404 |
| `UnauthorizedException` | Sin autenticación | 401 |
| `ForbiddenException` | Sin permisos | 403 |
| `DuplicateResourceException` | Recurso duplicado | 409 |
| `ValidationException` | Datos inválidos | 422 |

## Flujo de Datos

```
Request HTTP
    ↓
[Presentation] Controller recibe Request DTO
    ↓
[Application] Service mapea a modelo de dominio
    ↓
[Domain] Lógica de negocio (validaciones, reglas)
    ↓
[Application] Llama a puerto (interfaz)
    ↓
[Infrastructure] Implementación de puerto (JPA Repository)
    ↓
Base de Datos
```

## Principios de Diseño

1. **Independencia Técnica**: Sin dependencias de Spring, JPA o cualquier framework
2. **Cohesión Alta**: Las entidades relacionadas están juntas
3. **Encapsulación**: Lógica de negocio privada dentro de modelos
4. **Contrato Claro**: Los puertos definen explícitamente lo que se espera
5. **Reutilización**: Los modelos se usan en toda la aplicación

## Dependencias

- ⚠️ **Mínimas**: Idealmente solo Java estándar
- Lombok (anotaciones para reducir código)
- MapStruct (para mapeo de objetos)

## Contribuciones

Al agregar nuevas funcionalidades:

1. Define el modelo en `model/`
2. Crea el puerto en `port/`
3. Define DTOs en `dto/` (request, response, patch)
4. Crea excepciones específicas en `exception/` si es necesario
5. **NO importes** clases de otras capas

## Ejemplos de Modelos Principales

### User (Usuario)
- Identificación única
- Credenciales
- Rol asignado
- Estado activo/inactivo

### Course (Curso)
- Código del curso
- Descripción
- Período académico
- Profesor responsable

### Attendance (Asistencia)
- Estudiante
- Curso
- Fecha y hora
- Estado (presente, ausente, justificado)

### FacialEmbedding (Embedding Facial)
- Vector de características faciales
- Usuario asociado
- Fecha de captura

## Testing

Tests unitarios de modelos y validaciones de negocio:
- Sin dependencias de BD
- Sin contexto de Spring
- Enfocados en reglas de negocio

