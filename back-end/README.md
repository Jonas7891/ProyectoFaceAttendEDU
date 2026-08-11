# FACEATTEND-EDU Backend

## 📋 Descripción del Proyecto

**FACEATTEND-EDU** es un backend robusto desarrollado en **Java 21** con **Spring Boot 4.0.5** para un sistema completo de asistencia facial en entornos educativos. Gestiona usuarios, cursos, aulas, asistencias, dispositivos IoT y más, con una arquitectura hexagonal profesional que facilita escalabilidad, mantenibilidad y testabilidad.

**Características principales:**
- 🔐 Autenticación y autorización con JWT
- 📊 Sistema de asistencia con reconocimiento facial
- 📱 Integración con dispositivos IoT
- 📈 Dashboards y reportes consolidados
- 🔄 Arquitectura hexagonal (Clean Architecture)
- 🐳 Containerización con Docker
- 📖 Documentación API con Swagger/OpenAPI

## 🛠 Tecnologías Utilizadas

| Componente | Versión | Propósito |
|-----------|---------|----------|
| **Java** | 21 | Lenguaje principal |
| **Spring Boot** | 4.0.5 | Framework web |
| **Spring Data JPA** | - | ORM y persistencia |
| **PostgreSQL** | - | Base de datos |
| **Hibernate** | - | ORM avanzado |
| **MapStruct** | 1.5.5 | Mapeo de objetos |
| **Lombok** | - | Reducción de boilerplate |
| **JWT (JJWT)** | 0.11.5 | Autenticación |
| **SpringDoc OpenAPI** | 3.0.2 | Swagger/Documentación |
| **Docker** | - | Contenedorización |
| **Maven** | - | Gestión de dependencias |

## 📐 Arquitectura Hexagonal

El proyecto implementa **Clean Architecture** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│           PRESENTATION (Controladores REST)             │
├─────────────────────────────────────────────────────────┤
│   Validación | Serialización | Manejo de Excepciones   │
├─────────────────────────────────────────────────────────┤
│         APPLICATION (Servicios y Mappers)               │
├─────────────────────────────────────────────────────────┤
│       Lógica de Aplicación | Orquestación              │
├─────────────────────────────────────────────────────────┤
│          DOMAIN (Modelos y Puertos)                     │
├─────────────────────────────────────────────────────────┤
│    Lógica de Negocio Pura | Contratos                 │
├─────────────────────────────────────────────────────────┤
│      INFRASTRUCTURE (Persistencia y Config)             │
├─────────────────────────────────────────────────────────┤
│  JPA | Repositorios | Adaptadores | Base de Datos    │
└─────────────────────────────────────────────────────────┘
```

### 📚 Capas del Proyecto

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Presentation** | `presentation/` | Endpoints REST, validación, serialización |
| **Application** | `application/` | Servicios, mapeo, orquestación |
| **Domain** | `domain/` | Modelos, excepciones, puertos |
| **Infrastructure** | `infrastructure/` | Persistencia, adaptadores |
| **Config** | `config/` | Configuración global |

Para más detalles sobre cada capa, consulta:
- 📖 [Domain Layer](./src/main/java/com/faceattend_edu/security/domain/README.md)
- 📖 [Application Layer](./src/main/java/com/faceattend_edu/security/application/README.md)
- 📖 [Infrastructure Layer](./src/main/java/com/faceattend_edu/security/infrastructure/README.md)
- 📖 [Presentation Layer](./src/main/java/com/faceattend_edu/security/presentation/README.md)
- 📖 [Config Layer](./src/main/java/com/faceattend_edu/security/config/README.md)

## 🚀 Inicio Rápido

### Requisitos Previos

- **Java 21+** instalado
- **Maven 3.8+** instalado
- **PostgreSQL 12+** corriendo (o Docker para contenedorización)
- **Git** para control de versiones

### Instalación Local

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd back-end
   ```

2. **Configurar la base de datos:**
   
   Edita `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5433/faceattend_edu
   spring.datasource.username=admin
   spring.datasource.password=admin123
   ```

3. **Ejecutar la aplicación:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Acceder a la API:**
   - API REST: `http://localhost:8080/api`
   - Swagger UI: `http://localhost:8080/swagger-ui.html`
   - OpenAPI Spec: `http://localhost:8080/v3/api-docs`

### Con Docker

1. **Construir y ejecutar:**
   ```bash
   docker-compose up --build
   ```

2. **Acceder a la API:**
   - API: `http://localhost:8080/api`
   - Swagger: `http://localhost:8080/swagger-ui.html`

3. **Detener los servicios:**
   ```bash
   docker-compose down
   ```

## 📖 Documentación API

La API está completamente documentada con **Swagger/OpenAPI**:

### Acceso

- **UI Interactiva:** `http://localhost:8080/swagger-ui.html`
- **JSON Spec:** `http://localhost:8080/v3/api-docs`

### Recursos Principales

| Recurso | Endpoint | Descripción |
|---------|----------|------------|
| **Users** | `GET/POST/PUT/DELETE /api/users` | Gestión de usuarios |
| **Courses** | `GET/POST/PUT/DELETE /api/courses` | Administración de cursos |
| **Attendance** | `GET/POST /api/attendance` | Registros de asistencia |
| **Enrollment** | `GET/POST/DELETE /api/enrollments` | Inscripciones |
| **FacialEmbedding** | `GET/POST /api/facial-embeddings` | Datos faciales |
| **IotDevices** | `GET/POST/PUT /api/iot-devices` | Gestión de dispositivos |
| **Justification** | `GET/POST/PUT /api/justifications` | Justificaciones |
| **Schedule** | `GET/POST /api/schedules` | Horarios |
| **Views** | `GET /api/views` | Dashboards consolidados |

## 📁 Estructura del Proyecto

```
back-end/
├── src/
│   ├── main/
│   │   ├── java/com/faceattend_edu/
│   │   │   ├── FaceattendEduApplication.java      # Punto de entrada
│   │   │   └── newModule/
│   │   │       ├── config/                        # Configuración global
│   │   │       │   └── CorsConfig.java
│   │   │       ├── domain/                        # Lógica de negocio
│   │   │       │   ├── model/
│   │   │       │   ├── dto/
│   │   │       │   ├── port/
│   │   │       │   └── exception/
│   │   │       ├── application/                   # Servicios
│   │   │       │   ├── service/
│   │   │       │   ├── impl/
│   │   │       │   └── mapper/
│   │   │       ├── infrastructure/                # Persistencia
│   │   │       │   └── persistence/
│   │   │       │       ├── entity/
│   │   │       │       ├── repository/
│   │   │       │       └── mapper/
│   │   │       └── presentation/                  # API
│   │   │           ├── controller/
│   │   │           └── advice/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/faceattend_edu/               # Tests
├── dockerfile                                     # Image Docker
├── docker-compose.yml                             # Orquestación
├── pom.xml                                        # Dependencias
└── README.md                                      # Este archivo
```

## ⚙️ Configuración

### Variables de Entorno

Edita `application.properties` o exporta como variables:

```properties
# Base de Datos
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/faceattend_edu
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=admin123

# JPA
spring.jpa.hibernate.ddl-auto=update

# Perfiles
SPRING_PROFILES_ACTIVE=dev

# JWT (opcional)
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRATION=86400000
```

### Perfiles Disponibles

- **default** - Configuración local
- **docker** - Para contenedores
- **prod** - Producción

## 🔐 Seguridad

**Estado actual:**
- ⚠️ CORS configurado en `http://localhost:3000`, `http://localhost:3001`
- ⚠️ Seguridad parcialmente implementada
- 🔄 JWT preparado (actualmente desactivado)

**Recomendaciones para producción:**

1. Habilitar Spring Security
2. Implementar autenticación JWT
3. Agregar validación de roles
4. HTTPS obligatorio
5. Rate limiting
6. Validación de entrada rigurosa

## 📊 Modelos Principales

### User (Usuario)
```
ID | Username | Email | Password | Role | Active
```

### Course (Curso)
```
ID | Code | Name | Teacher | Period | School
```

### Attendance (Asistencia)
```
ID | Student | Course | Date | Status | Device
```

### FacialEmbedding (Embedding Facial)
```
ID | User | Vector | CreatedAt
```

### Enrollment (Inscripción)
```
ID | Student | Course | Status | EnrolledAt
```

## 🧪 Testing

Ejecutar tests:

```bash
# Todos los tests
mvn test

# Test específico
mvn test -Dtest=UserServiceImplTest

# Con cobertura
mvn test jacoco:report
```

## 📝 Validaciones

### Bean Validation en DTOs

```java
@NotBlank(message = "Campo requerido")
@Email(message = "Email inválido")
@Size(min = 3, max = 50)
@NotNull
```

### Excepciones Personalizadas

- `BusinessException` - Violación de reglas de negocio
- `NotFoundException` - Recurso no encontrado
- `UnauthorizedException` - Sin autenticación
- `ForbiddenException` - Sin permisos
- `ValidationException` - Datos inválidos

## 🔄 Flujo de Datos

```
HTTP Request
     ↓
[Presentation] Controller - Validación
     ↓
[Application] Service - Lógica
     ↓
[Domain] Modelo - Reglas de negocio
     ↓
[Infrastructure] Repository - Persistencia
     ↓
PostgreSQL
     ↓
[Retorno inverso con mapeo]
     ↓
HTTP Response
```

## 📈 Mejoras Futuras

- [ ] Autenticación OAuth 2.0
- [ ] Caché con Redis
- [ ] Eventos asíncronos con RabbitMQ
- [ ] Machine Learning para detección facial
- [ ] Reportes avanzados con BI
- [ ] Monitoreo con Prometheus/Grafana
- [ ] API versioning (v2, v3)
- [ ] Rate limiting

## 🤝 Contribución

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Sigue la estructura hexagonal
3. Escribe tests
4. Commit: `git commit -am 'Agrega nueva funcionalidad'`
5. Push: `git push origin feature/nueva-funcionalidad`
6. Pull Request

### Estándares de Código

- ✅ Nomenclatura en inglés
- ✅ Usar Lombok y MapStruct
- ✅ Documentar APIs con OpenAPI
- ✅ Validación en DTOs
- ✅ Manejo de excepciones global

## 📞 Soporte

- **Documentación:** `http://localhost:8080/swagger-ui.html`
- **Issues:** Reporta en el repositorio
- **Contacto:** [Tu email/contacto]

## 📄 Licencia

[Especifica la licencia - MIT, GPL, etc.]

## 👥 Autores

- **FACEATTEND-EDU Team**
- Desarrollado con ❤️

---

**Última actualización:** Agosto 2024
**Versión:** 0.0.1-SNAPSHOT
**Java:** 21
**Spring Boot:** 4.0.5
