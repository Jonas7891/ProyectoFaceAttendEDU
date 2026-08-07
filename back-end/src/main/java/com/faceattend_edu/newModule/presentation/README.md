# Presentation Layer - Capa de Presentación

## Descripción General

La capa de presentación es el **punto de entrada** de todas las solicitudes HTTP. Gestiona los controladores REST, valida datos de entrada, maneja excepciones y formatea las respuestas. Es la interfaz entre clientes externos y el sistema.

## Responsabilidades Principales

- **Controladores REST**: Endpoints HTTP y ruteo
- **Validación**: Bean Validation y restricciones
- **Serialización**: Conversión JSON ↔ DTOs
- **Manejo de Errores**: Captura y formateo de excepciones
- **Documentación**: Swagger/OpenAPI
- **CORS**: Configuración de orígenes permitidos

## Estructura de Directorios

```
presentation/
├── controller/              # Controladores REST
│   ├── ActionController.java
│   ├── AttendanceController.java
│   ├── ClassroomController.java
│   ├── CourseController.java
│   ├── EnrollmentController.java
│   ├── FacialEmbeddingController.java
│   ├── IotDeviceController.java
│   ├── JustificationController.java
│   ├── LogController.java
│   ├── ModuleController.java
│   ├── PeriodController.java
│   ├── PersonController.java
│   ├── RoleController.java
│   ├── ScheduleController.java
│   ├── SchoolController.java
│   ├── UserController.java
│   └── ViewController.java
│
├── advice/                  # Manejo global de excepciones
│   └── GlobalExceptionHandler.java
│
└── config/                  # Configuración de CORS (en config/)
    └── CorsConfig.java
```

## Conceptos Clave

### Controladores (`controller/`)

Exponemos operaciones a través de endpoints REST:

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestión de usuarios")
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable UUID id) {
        UserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    @Operation(summary = "Crear nuevo usuario")
    public ResponseEntity<UserResponseDto> createUser(
            @Valid @RequestBody UserRequestDto dto) {
        UserResponseDto created = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserRequestDto dto) {
        UserResponseDto updated = userService.updateUser(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

### Validación

Usar anotaciones Bean Validation en DTOs:

```java
@Data
public class UserRequestDto {
    @NotBlank(message = "El usuario no puede estar vacío")
    @Size(min = 3, max = 50)
    private String username;
    
    @Email(message = "Email debe ser válido")
    @NotBlank
    private String email;
    
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "Mínimo 8 caracteres")
    private String password;
    
    @NotNull(message = "El rol es requerido")
    private UUID roleId;
}
```

### Manejo Global de Excepciones (`advice/`)

Captura excepciones y retorna respuestas estandarizadas:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.NOT_FOUND.value())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(error);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.BAD_REQUEST.value())
            .message("Errores de validación")
            .errors(errors)
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(error);
    }
}
```

### Configuración CORS (`config/CorsConfig.java`)

Permite solicitudes desde orígenes específicos:

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000", "http://localhost:3001")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

## Controladores Principales

### UserController
**Rutas:**
- `POST /api/users` - Crear usuario
- `GET /api/users/{id}` - Obtener usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario
- `GET /api/users` - Listar usuarios

**Operaciones:**
- CRUD completo
- Autenticación (login)
- Cambio de contraseña

### CourseController
**Rutas:**
- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Crear curso
- `GET /api/courses/{id}` - Obtener curso
- `PUT /api/courses/{id}` - Actualizar curso
- `DELETE /api/courses/{id}` - Eliminar curso
- `GET /api/courses/{id}/students` - Estudiantes inscritos

**Operaciones:**
- Gestión de cursos
- Asignación de docentes
- Consulta de inscritos

### AttendanceController
**Rutas:**
- `POST /api/attendance` - Registrar asistencia
- `GET /api/attendance/{id}` - Obtener registro
- `GET /api/attendance/course/{courseId}` - Por curso
- `GET /api/attendance/student/{studentId}` - Por estudiante
- `GET /api/attendance/reports` - Reportes

**Operaciones:**
- Registro facial de asistencia
- Consultas por periodo
- Estadísticas

### EnrollmentController
**Rutas:**
- `POST /api/enrollments` - Inscribir estudiante
- `GET /api/enrollments/{id}` - Obtener inscripción
- `DELETE /api/enrollments/{id}` - Cancelar inscripción
- `GET /api/enrollments/course/{courseId}` - Por curso

**Operaciones:**
- Inscripciones
- Cambios de estado
- Consultas

### FacialEmbeddingController
**Rutas:**
- `POST /api/facial-embeddings` - Guardar embedding
- `GET /api/facial-embeddings/{userId}` - Obtener embeddings
- `DELETE /api/facial-embeddings/{id}` - Eliminar

**Operaciones:**
- Almacenamiento de vectores faciales
- Actualizaciones

### IotDeviceController
**Rutas:**
- `POST /api/iot-devices` - Registrar dispositivo
- `GET /api/iot-devices` - Listar dispositivos
- `PUT /api/iot-devices/{id}` - Actualizar estado
- `GET /api/iot-devices/status` - Estado de dispositivos

**Operaciones:**
- Gestión de dispositivos
- Monitoreo

### JustificationController
**Rutas:**
- `POST /api/justifications` - Crear justificación
- `GET /api/justifications/{id}` - Obtener
- `PUT /api/justifications/{id}/approve` - Aprobar
- `PUT /api/justifications/{id}/reject` - Rechazar

**Operaciones:**
- Gestión de justificaciones
- Aprobación

### ScheduleController
**Rutas:**
- `POST /api/schedules` - Crear horario
- `GET /api/schedules/course/{courseId}` - Por curso
- `GET /api/schedules/classroom/{classroomId}` - Por aula

**Operaciones:**
- Gestión de horarios
- Consulta de disponibilidad

### ViewService Controllers
Endpoints consolidados para dashboards y reportes.

## Estándares REST

### Convenciones HTTP

| Método | Uso | Status Éxito |
|--------|-----|----------|
| `GET` | Consultar | 200 OK |
| `POST` | Crear | 201 Created |
| `PUT` | Reemplazar | 200 OK |
| `PATCH` | Actualizar parcial | 200 OK |
| `DELETE` | Eliminar | 204 No Content |

### Estructura de URLs

```
/api/{versión}/{recurso}/{id}/{acción}

Ejemplos:
GET    /api/users                      → Listar
POST   /api/users                      → Crear
GET    /api/users/{id}                 → Obtener
PUT    /api/users/{id}                 → Actualizar
DELETE /api/users/{id}                 → Eliminar
GET    /api/users/{id}/courses         → Relación
POST   /api/users/{id}/role/change     → Acción
```

### Respuestas Estándar

**Éxito (200 OK):**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "TEACHER"
}
```

**Error (400 Bad Request):**
```json
{
  "status": 400,
  "message": "Errores de validación",
  "errors": [
    "username: El usuario no puede estar vacío",
    "email: Email debe ser válido"
  ],
  "timestamp": "2024-08-03T10:30:00"
}
```

## Documentación API (Swagger)

Accesible en: `http://localhost:8080/swagger-ui.html`

Usa anotaciones OpenAPI:

```java
@Tag(name = "Users", description = "API de gestión de usuarios")
@Operation(summary = "Crear nuevo usuario", description = "Crea un usuario con datos válidos")
@ApiResponse(responseCode = "201", description = "Usuario creado exitosamente")
@ApiResponse(responseCode = "400", description = "Datos inválidos")
```

## Mejores Prácticas

### ✅ Hacer

- Validar entrada con `@Valid`
- Usar HTTP status codes correctos
- Retornar DTOs, no entidades
- Documentar con OpenAPI
- Manejar excepciones globalmente
- Usar ResponseEntity para controlar status

### ❌ No Hacer

- Exponer entidades directamente
- Retornar null
- Lógica de negocio en controladores
- Errores sin estructura
- Quemar rutas en controladores

## Testing

Tests de controladores con MockMvc:
- Valida endpoints
- Prueba validación
- Verifica respuestas

## Dependencias

- **Spring Web MVC**: Controladores REST
- **Bean Validation**: Validación de entrada
- **SpringDoc OpenAPI**: Swagger/Documentación
- **Spring CORS**: Configuración CORS

