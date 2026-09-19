# Authorization Service — `02-ms-authorization`

## 1. Responsabilidad

Control de acceso basado en roles (RBAC). Gestionar roles, permisos y asignaciones usuario-rol. Servicio complementario a Identity que determina QUEN puede hacer QUE.

## 2. Tablas

| Tabla | Descripcion | PK |
|-------|-------------|-----|
| `role` | Catalogo de roles del sistema | `role_id` (INT) |
| `permission` | Catalogo de permisos atomicos | `permission_id` (INT) |
| `role_permission` | Asignacion N:N roles <-> permisos | `(role_id, permission_id)` |
| `user_role` | Asignacion N:N usuarios <-> roles | `(user_id, role_id)` |

**Cross-context:** `user_role.user_id` referencia a `Identity.app_user.user_id` (sin FK real)

## 3. Stack Tecnologico

### 3.1 Lenguaje y Framework

| Componente | Tecnologia | Justificacion |
|------------|-----------|---------------|
| Lenguaje | **Go 1.22** | Checks de permisos de baja latencia, binario unico, bajo consumo de memoria |
| Framework | **Gin** | Router de alto rendimiento, middleware nativo |
| Arquitectura | **Hexagonal** | Misma estructura que Identity |

### 3.2 Dependencias Principales

```go
// go.mod
module github.com/faceattend-edu/authorization-service

require (
    github.com/gin-gonic/gin          // HTTP framework
    github.com/jackc/pgx/v5            // PostgreSQL driver
    github.com/redis/go-redis/v9       // Cache de permisos
    github.com/golang-jwt/jwt/v5       // JWT validation
    go.uber.org/zap                    // Structured logging
    github.com/prometheus/client_golang // Metrics
)
```

### 3.3 Librerias Recomendadas Adicionales

| Libreria | Uso | Por que |
|----------|-----|---------|
| **Gin** | HTTP framework | Zero-allocation router, 142k RPS, routing rapido |
| **pgx** | PostgreSQL driver | 3x mas rapido que database/sql, soporte nativo PostgreSQL |
| **go-redis** | Cache de permisos | Cache en memoria para evaluacion rapida de RBAC |
| **golang-jwt** | JWT validation | Validar tokens de Identity de forma eficiente |
| **zap** | Structured logging | Logs JSON de alta performance para Audit |
| **Testcontainers** | Tests de integracion | PostgreSQL real en tests |
| **go-cmp** | Comparacion de objetos | Tests de igualdad estructural |
| **golang-migrate** | Migrations | Alternativa a Liquibase para Go |
| **zerolog** | Logging alternativo | Ultra-bajo overhead si se necesita |

### 3.4 Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Go toolchain** | Build, test, vet, lint |
| **Docker** | Containerizacion (imagen ~8MB) |
| **VS Code + Go extension** | IDE principal |
| **DBeaver** | Cliente PostgreSQL |
| **Postman / Bruno** | Testing REST |
| **golangci-lint** | Linting automatico |

### 3.5 Analisis de Lenguaje

#### Candidatos evaluados

| # | Lenguaje | Framework | Throughput | Memoria | Startup | Ecosistema RBAC | Curva aprendizaje |
|---|----------|-----------|:----------:|:-------:|:-------:|:----------------:|:-----------------:|
| 1 | **Go 1.22** | Gin | 142k RPS | 68MB | 180ms | Moderado | 2-3 semanas |
| 2 | Java 21 | Spring Boot | 100k RPS | 412MB | 3.8s | Excelente | Moderada |
| 3 | TypeScript | NestJS | 54k RPS | 120MB | 800ms | Bueno | Baja |

#### Por que Go gana sobre Java

- **6x menor consumo de memoria**: 68MB vs 412MB a 500 RPS (benchmarks BackendBytes 2026). En 9 microservicios, esto se traduce en ahorro significativo de infraestructura.
- **21x mas rapido en startup**: 180ms vs 3.8s. Critico para autoscaling en Kubernetes.
- **Binario unico de ~8MB**: Sin JVM, sin dependencias runtime. Deploy mas simple.
- **Latencia p99 consistente**: GC sub-milisegundo sin tuning especial.
- **Servicio ligero**: Authorization es fundamentalmente validacion de permisos (lookup en Redis/hash map). No necesita el peso de Spring Boot.

#### Por que Go gana sobre TypeScript

- **2.6x mayor throughput**: 142k vs 54k RPS en benchmarks.
- **35% menos memoria**: 68MB vs 120MB.
- **Type safety en compile-time**: Go detecta mas errores antes del deployment que TypeScript.
- **Concurrencia nativa**: Goroutines para evaluar multiples permisos en paralelo.

#### Decision: Go 1.22

Authorization es un servicio de **baja latencia, alta frecuencia** (cada request de cualquier servicio valida permisos). Go ofrece el mejor ratio throughput/memoria para este caso de uso. El ecosistema de Go para RBAC es suficiente: Redis para cache, pgx para PostgreSQL, y middleware de autenticacion bien establecido.

---

## 4. Endpoints

### 4.1 Roles

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/roles` | Crear rol |
| GET | `/api/v1/roles/{id}` | Obtener rol |
| PUT | `/api/v1/roles/{id}` | Actualizar rol |
| DELETE | `/api/v1/roles/{id}` | Eliminar rol |
| GET | `/api/v1/roles` | Listar roles |

### 4.2 Permisos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/permissions` | Crear permiso |
| GET | `/api/v1/permissions/{id}` | Obtener permiso |
| GET | `/api/v1/permissions` | Listar permisos |

### 4.3 Asignaciones

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/roles/{roleId}/permissions` | Asignar permiso a rol |
| DELETE | `/api/v1/roles/{roleId}/permissions/{permId}` | Remover permiso de rol |
| POST | `/api/v1/users/{userId}/roles` | Asignar rol a usuario |
| DELETE | `/api/v1/users/{userId}/roles/{roleId}` | Remover rol de usuario |
| GET | `/api/v1/users/{userId}/roles` | Roles de un usuario |
| GET | `/api/v1/roles/{roleId}/permissions` | Permisos de un rol |

### 4.4 Evaluacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/auth/evaluate?userId={id}&permission={name}` | Verificar si usuario tiene permiso |

---

## 5. Domain Events

| Evento | Trigger | Consumidores tipicos |
|--------|---------|---------------------|
| `RoleCreated` | Nuevo rol creado | Audit |
| `RoleUpdated` | Rol modificado | Audit |
| `UserRoleAssigned` | Rol asignado a usuario | Audit, Notification |
| `UserRoleRevoked` | Rol removido de usuario | Audit |

---

## 6. Patron RBAC

```
User ──N:N──> Role ──N:N──> Permission
                 │
                 ▼
          role_permission
          (assignment_date)
```

### Roles predefinidos (seeds)

| Rol | Descripcion |
|-----|-------------|
| SUPER_ADMIN | Super administrador del sistema |
| SCHOOL_ADMIN | Administrador de sede |
| INSTRUCTOR | Docente/Instructor |
| STUDENT | Estudiante/Aprendiz |

### Permisos atomicos (seeds)

```
person.create, person.read, person.update, person.delete
school.create, school.read, school.update
enrollment.create, enrollment.read
attendance.read, attendance.update
justification.approve
biometric.update
configuration.manage
```

---

## 7. Configuracion

### config.yaml (ejemplo)

```yaml
server:
  port: 8082

database:
  host: localhost
  port: 5432
  name: faceattend_db
  user: postgres
  password: postgres
  schema: authorization
  max_open_conns: 25
  max_idle_conns: 5

redis:
  addr: localhost:6379
  db: 0
  ttl: 10m

kafka:
  brokers: localhost:9092
  group-id: authorization-service

jwt:
  issuer: faceattend-identity
  audience: faceattend-api
```

---

## 8. Puertos del Servidor

| Puerto | Servicio |
|--------|----------|
| 8082 | REST API |
| 9092 | Kafka (externo) |
| 5432 | PostgreSQL (externo) |
| 6379 | Redis (opcional, cache) |
