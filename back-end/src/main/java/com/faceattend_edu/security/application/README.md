# Application Layer - Capa de Aplicación

## Descripción General

La capa de aplicación **orquesta el flujo de negocio** entre la presentación y la infraestructura. Contiene la lógica de aplicación, mapeo de datos y coordinación de servicios. Es el intermediario que implementa los casos de uso del sistema.

## Responsabilidades Principales

- **Servicios de Aplicación**: Orquestación de lógica de negocio
- **Mapeo de Datos**: Conversión entre DTOs y modelos de dominio
- **Coordinación**: Uso de puertos para acceso a datos
- **Transacciones**: Gestión de operaciones atómicas
- **Casos de Uso**: Implementación de las operaciones que el usuario puede hacer

## Estructura de Directorios

```
application/
├── service/                  # Interfaces de servicios
│   ├── UserService.java
│   ├── CourseService.java
│   ├── AttendanceService.java
│   ├── FacialEmbeddingService.java
│   ├── IotDeviceService.java
│   ├── ClassroomService.java
│   ├── EnrollmentService.java
│   ├── JustificationService.java
│   ├── ScheduleService.java
│   ├── SchoolService.java
│   ├── RoleService.java
│   ├── PersonService.java
│   ├── ModuleService.java
│   ├── PeriodService.java
│   ├── LogService.java
│   ├── ActionService.java
│   └── ViewService.java
│
├── impl/                     # Implementaciones de servicios
│   ├── UserServiceImpl.java
│   ├── CourseServiceImpl.java
│   ├── AttendanceServiceImpl.java
│   ├── FacialEmbeddingServiceImpl.java
│   ├── IotDeviceServiceImpl.java
│   ├── ClassroomServiceImpl.java
│   ├── EnrollmentServiceImpl.java
│   ├── JustificationServiceImpl.java
│   ├── ScheduleServiceImpl.java
│   ├── SchoolServiceImpl.java
│   ├── RoleServiceImpl.java
│   ├── PersonServiceImpl.java
│   ├── ModuleServiceImpl.java
│   ├── PeriodServiceImpl.java
│   ├── LogServiceImpl.java
│   ├── ActionServiceImpl.java
│   └── ViewServiceImpl.java
│
└── mapper/                   # Mappers para conversión de datos
    ├── UserServiceMapper.java
    ├── CourseServiceMapper.java
    ├── AttendanceServiceMapper.java
    ├── FacialEmbeddingServiceMapper.java
    ├── IotDeviceServiceMapper.java
    ├── ClassroomServiceMapper.java
    ├── EnrollmentServiceMapper.java
    ├── JustificationServiceMapper.java
    ├── ScheduleServiceMapper.java
    ├── SchoolServiceMapper.java
    ├── RoleServiceMapper.java
    ├── PersonServiceMapper.java
    ├── ModuleServiceMapper.java
    ├── PeriodServiceMapper.java
    ├── LogServiceMapper.java
    ├── ActionServiceMapper.java
    └── ViewServiceMapper.java
```

## Concepto: ABC Pattern (Service, Implementation, Mapper)

Cada funcionalidad sigue este patrón:

### 1. **Service Interface** (`service/XXXService.java`)
Define qué operaciones se pueden realizar:

```java
public interface UserService {
    UserResponseDto getUserById(UUID id);
    UserResponseDto createUser(UserRequestDto dto);
    UserResponseDto updateUser(UUID id, UserRequestDto dto);
    void deleteUser(UUID id);
    List<UserResponseDto> getAllUsers();
}
```

### 2. **Service Implementation** (`impl/XXXServiceImpl.java`)
Implementa la lógica de aplicación y orquestación:

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepositoryPort userRepository;
    private final UserServiceMapper mapper;
    
    @Override
    @Transactional
    public UserResponseDto createUser(UserRequestDto dto) {
        // Validaciones de negocio
        // Mapeo DTO → Modelo
        // Llamada a repositorio
        // Mapeo Modelo → Response DTO
    }
}
```

### 3. **Service Mapper** (`mapper/XXXServiceMapper.java`)
Convierte entre DTOs y modelos de dominio usando MapStruct:

```java
@Mapper(componentModel = "spring")
public interface UserServiceMapper {
    User toModel(UserRequestDto dto);
    UserResponseDto toResponseDto(User user);
    List<UserResponseDto> toResponseDtoList(List<User> users);
}
```

## Características Principales

### Inyección de Dependencias

```java
@Service
@RequiredArgsConstructor  // Lombok: inyecta en constructor
public class UserServiceImpl implements UserService {
    private final UserRepositoryPort repository;
    private final UserServiceMapper mapper;
}
```

### Transacciones

```java
@Transactional(readOnly = false)
public UserResponseDto updateUser(UUID id, UserRequestDto dto) {
    // Cambios se persisten automáticamente
}

@Transactional(readOnly = true)
public UserResponseDto getUserById(UUID id) {
    // Consulta optimizada, sin persist
}
```

### Manejo de Excepciones

```java
public UserResponseDto getUserById(UUID id) {
    return repository.findById(id)
        .map(mapper::toResponseDto)
        .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
}
```

## Servicios Principales

### UserService
Gestión de usuarios del sistema:
- Crear/leer/actualizar/eliminar usuarios
- Cambiar contraseña
- Validar credenciales
- Gestión de roles

### CourseService
Administración de cursos:
- CRUD de cursos
- Asignar profesores
- Asociar con períodos académicos
- Consultar estudiantes inscritos

### AttendanceService
Gestión de asistencia:
- Registrar asistencia
- Consultar histórico
- Calcular estadísticas
- Generar reportes

### FacialEmbeddingService
Manejo de embeddings faciales:
- Almacenar vectores faciales
- Actualizar embeddings
- Eliminar registros antiguos

### EnrollmentService
Inscripciones de estudiantes:
- Inscribir en cursos
- Consultar inscritos
- Gestionar cambios

### IotDeviceService
Gestión de dispositivos:
- Registrar dispositivos
- Actualizar estado
- Monitoreo

### JustificationService
Justificaciones de inasistencia:
- Crear justificaciones
- Aprobar/rechazar
- Consultar historial

### ScheduleService
Horarios de clases:
- Crear/modificar horarios
- Consultar disponibilidad
- Validar conflictos

### SchoolService
Información de la institución:
- Datos de la escuela
- Períodos académicos
- Configuración general

### RoleService
Gestión de roles:
- CRUD de roles
- Asignar permisos
- Consultar permisos

### LogService
Auditoría y registros:
- Registrar acciones
- Consultar historial
- Análisis de actividades

### ViewService
Vistas consolidadas:
- Dashboard consolidado
- Reportes agregados
- Estadísticas

## Flujo de Datos en la Aplicación

```
1. Controller recibe HTTP Request
           ↓
2. Controller llama Service.method(requestDTO)
           ↓
3. Service valida y mapea DTO → Modelo (Mapper.toModel())
           ↓
4. Service implementa lógica de negocio
           ↓
5. Service llama Repository a través del Puerto
           ↓
6. Repository ejecuta en la BD
           ↓
7. Service mapea Modelo → ResponseDTO (Mapper.toResponseDto())
           ↓
8. Service retorna ResponseDTO
           ↓
9. Controller retorna HTTP Response
```

## Mejores Prácticas

### ✅ Hacer

- Usar `@Transactional` para operaciones de escritura
- Mapear datos en ambas direcciones
- Reutilizar mappers existentes
- Inyectar solo puertos, no implementaciones
- Retornar DTOs, nunca modelos directamente

### ❌ No Hacer

- Lógica de persistencia en servicios
- Consultas SQL directas
- Conversión manual de datos
- Mezclar DTOs con modelos
- Retornar entidades JPA

## Testing

Tests de integración que validan:
- Servicios con mocks de repositorios
- Mapeo correcto de datos
- Lógica de transacciones
- Manejo de excepciones

## Dependencias

- **Spring Framework**: @Service, @Transactional, inyección
- **MapStruct**: Mapeo automático de objetos
- **Lombok**: Reducción de código boilerplate

## Patrones Implementados

| Patrón | Uso |
|--------|-----|
| **Service Locator** | Inyección de puertos |
| **Strategy** | Diferentes implementaciones de negocio |
| **Template Method** | Clase base AbstractServiceImpl |
| **Adapter** | Conversión de datos con Mappers |

