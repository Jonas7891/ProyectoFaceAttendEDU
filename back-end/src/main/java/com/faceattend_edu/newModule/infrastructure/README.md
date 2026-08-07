# Infrastructure Layer - Capa de Infraestructura

## Descripción General

La capa de infraestructura maneja todos los **detalles técnicos y de persistencia** del sistema. Implementa los puertos definidos en el dominio, gestiona la conexión a la base de datos, configuración de seguridad y otras responsabilidades técnicas específicas de Spring Boot.

## Responsabilidades Principales

- **Persistencia**: Implementación de repositorios JPA
- **Adaptadores**: Implementación de puertos del dominio
- **Acceso a Datos**: Consultas, mapeo objeto-relacional
- **Configuración Técnica**: Security, CORS, etc.
- **Detalles de Implementación**: Dependencias externas

## Estructura de Directorios

```
infrastructure/
└── persistence/
    ├── entity/                  # Entidades JPA (mapeo a BD)
    │   ├── ActionEntity.java
    │   ├── AttendanceEntity.java
    │   ├── ClassroomEntity.java
    │   ├── CourseEntity.java
    │   ├── EnrollmentEntity.java
    │   ├── FacialEmbeddingEntity.java
    │   ├── IotDeviceEntity.java
    │   ├── JustificationEntity.java
    │   ├── LogEntity.java
    │   ├── ModuleEntity.java
    │   ├── PeriodEntity.java
    │   ├── PersonEntity.java
    │   ├── RoleEntity.java
    │   ├── ScheduleEntity.java
    │   ├── SchoolEntity.java
    │   ├── UserEntity.java
    │   └── ViewEntity.java
    │
    ├── repository/              # Repositorios JPA + Adaptadores
    │   ├── jpa/
    │   │   ├── ActionJpaRepository.java
    │   │   ├── AttendanceJpaRepository.java
    │   │   ├── ClassroomJpaRepository.java
    │   │   ├── CourseJpaRepository.java
    │   │   ├── EnrollmentJpaRepository.java
    │   │   ├── FacialEmbeddingJpaRepository.java
    │   │   ├── IotDeviceJpaRepository.java
    │   │   ├── JustificationJpaRepository.java
    │   │   ├── LogJpaRepository.java
    │   │   ├── ModuleJpaRepository.java
    │   │   ├── PeriodJpaRepository.java
    │   │   ├── PersonJpaRepository.java
    │   │   ├── RoleJpaRepository.java
    │   │   ├── ScheduleJpaRepository.java
    │   │   ├── SchoolJpaRepository.java
    │   │   ├── UserJpaRepository.java
    │   │   └── ViewJpaRepository.java
    │   │
    │   └── adapter/             # Adaptadores que implementan puertos
    │       ├── ActionRepositoryAdapter.java
    │       ├── AttendanceRepositoryAdapter.java
    │       ├── ClassroomRepositoryAdapter.java
    │       ├── CourseRepositoryAdapter.java
    │       ├── EnrollmentRepositoryAdapter.java
    │       ├── FacialEmbeddingRepositoryAdapter.java
    │       ├── IotDeviceRepositoryAdapter.java
    │       ├── JustificationRepositoryAdapter.java
    │       ├── LogRepositoryAdapter.java
    │       ├── ModuleRepositoryAdapter.java
    │       ├── PeriodRepositoryAdapter.java
    │       ├── PersonRepositoryAdapter.java
    │       ├── RoleRepositoryAdapter.java
    │       ├── ScheduleRepositoryAdapter.java
    │       ├── SchoolRepositoryAdapter.java
    │       ├── UserRepositoryAdapter.java
    │       └── ViewRepositoryAdapter.java
    │
    └── mapper/                  # Mappers Entity ↔ Model
        ├── ActionInfrastructureMapper.java
        ├── AttendanceInfrastructureMapper.java
        ├── ClassroomInfrastructureMapper.java
        ├── CourseInfrastructureMapper.java
        ├── EnrollmentInfrastructureMapper.java
        ├── FacialEmbeddingInfrastructureMapper.java
        ├── IotDeviceInfrastructureMapper.java
        ├── JustificationInfrastructureMapper.java
        ├── LogInfrastructureMapper.java
        ├── ModuleInfrastructureMapper.java
        ├── PeriodInfrastructureMapper.java
        ├── PersonInfrastructureMapper.java
        ├── RoleInfrastructureMapper.java
        ├── ScheduleInfrastructureMapper.java
        ├── SchoolInfrastructureMapper.java
        ├── UserInfrastructureMapper.java
        └── ViewInfrastructureMapper.java
```

## Conceptos Clave

### Entidades JPA (`entity/`)

Representan tablas de la base de datos:

```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
```

**Características:**
- Mapeo automático con tablas
- Relaciones (OneToMany, ManyToOne, ManyToMany)
- Validación a nivel BD
- Ciclo de vida gestionado por Hibernate

### Repositorios JPA (`repository/jpa/`)

Interfaces que heredan de `JpaRepository`:

```java
@Repository
public interface UserJpaRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUsername(String username);
    List<UserEntity> findByRoleId(UUID roleId);
}
```

**Ventajas:**
- CRUD automático
- Queries dinámicas
- Paginación y ordenamiento
- Sin escribir SQL

### Adaptadores (`repository/adapter/`)

Implementan los puertos del dominio, adaptando de JPA a modelos:

```java
@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepositoryPort {
    private final UserJpaRepository jpaRepository;
    private final UserInfrastructureMapper mapper;
    
    @Override
    public Optional<User> findById(UUID id) {
        return jpaRepository.findById(id)
            .map(mapper::toModel);  // Entity → Model
    }
    
    @Override
    public User save(User user) {
        UserEntity entity = mapper.toEntity(user);  // Model → Entity
        UserEntity saved = jpaRepository.save(entity);
        return mapper.toModel(saved);
    }
}
```

**Patrón Hexagonal:**
- `UserRepositoryPort` (dominio) ← contrato
- `UserRepositoryAdapter` (infraestructura) ← implementación
- `UserJpaRepository` (infraestructura) ← acceso a datos

### Mappers de Infraestructura (`mapper/`)

Convierten entre Entidades JPA y Modelos de Dominio:

```java
@Mapper(componentModel = "spring")
public interface UserInfrastructureMapper {
    User toModel(UserEntity entity);
    UserEntity toEntity(User model);
    List<User> toModelList(List<UserEntity> entities);
}
```

## Flujo de Persistencia

```
Application Service
    ↓
Llama a UserRepositoryPort (interfaz)
    ↓
UserRepositoryAdapter (implementación)
    ↓
Mapea User → UserEntity
    ↓
Llama UserJpaRepository.save()
    ↓
Hibernate mapea a SQL INSERT/UPDATE
    ↓
PostgreSQL persiste datos
    ↓
Retorna UserEntity
    ↓
Mapea UserEntity → User
    ↓
Retorna User al Service
```

## Configuración

### application.properties

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5433/faceattend_edu
spring.datasource.username=admin
spring.datasource.password=admin123
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Docker
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5433/faceattend_edu}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:admin}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:admin123}
```

### Estrategias DDL

| Valor | Descripción | Uso |
|-------|-------------|-----|
| `create` | Crea nuevo esquema cada inicio | Desarrollo inicial |
| `create-drop` | Crea y borra al cerrar | Testing |
| `update` | Actualiza esquema existente | Desarrollo/producción |
| `validate` | Solo valida sin cambios | Producción |
| `none` | Sin acciones automáticas | Producción |

## Entidades Principales

### UserEntity
```
- id (UUID)
- username (String, único)
- password (String, hasheada)
- email (String)
- role_id (FK → RoleEntity)
- is_active (Boolean)
- created_at (LocalDateTime)
- updated_at (LocalDateTime)
```

### CourseEntity
```
- id (UUID)
- code (String, único)
- name (String)
- description (String)
- teacher_id (FK → UserEntity)
- period_id (FK → PeriodEntity)
- school_id (FK → SchoolEntity)
```

### AttendanceEntity
```
- id (UUID)
- student_id (FK → UserEntity)
- course_id (FK → CourseEntity)
- date (LocalDate)
- time (LocalTime)
- status (PRESENT/ABSENT/JUSTIFIED)
- device_id (FK → IotDeviceEntity)
```

### FacialEmbeddingEntity
```
- id (UUID)
- user_id (FK → UserEntity)
- embedding (VECTOR) // Array de floats
- created_at (LocalDateTime)
```

### IotDeviceEntity
```
- id (UUID)
- device_id (String, único)
- name (String)
- location (String)
- classroom_id (FK → ClassroomEntity)
- status (ONLINE/OFFLINE)
- last_seen (LocalDateTime)
```

## Relaciones Entre Entidades

```
User ←→ Role (ManyToOne)
User ←→ Course (como profesor) (ManyToOne)
User ←→ Enrollment (como estudiante) (OneToMany)
User ←→ FacialEmbedding (OneToMany)
User ←→ Log (OneToMany)

Course ←→ Period (ManyToOne)
Course ←→ Classroom (ManyToOne)
Course ←→ Enrollment (OneToMany)
Course ←→ Attendance (OneToMany)
Course ←→ Schedule (OneToMany)

Enrollment ←→ Attendance (OneToMany)

Classroom ←→ IotDevice (OneToMany)

IotDevice ←→ Attendance (OneToMany)
```

## Mejores Prácticas

### ✅ Hacer

- Usar repositorios JPA, no queries manuales
- Mapear entidades con anotaciones JPA
- Lazy loading para relaciones grandes
- Índices en columnas frecuentes
- Validación con `@NotNull`, `@NotBlank`

### ❌ No Hacer

- Escribir SQL directo sin razón
- Exponer entidades directamente
- Cambios en esquema sin versionado
- Queries sin optimización (N+1 problem)
- Lógica de negocio en adaptadores

## Testing

Tests de integración:
- Con `@DataJpaTest` para solo persistencia
- Verifica mapeo correcto Entity ↔ Model
- Consultas personalizadas
- Transacciones

## Dependencias

- **Spring Data JPA**: Repositorios automáticos
- **Hibernate**: ORM y mapeo
- **PostgreSQL**: Driver JDBC
- **MapStruct**: Mapeo Entity ↔ Model

