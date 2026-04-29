# FACEATTEND-EDU Backend

## Descripción del Proyecto

FACEATTEND-EDU es un backend desarrollado en Java utilizando Spring Boot para un sistema de asistencia facial en entornos educativos. El sistema permite gestionar usuarios, cursos, aulas, asistencias, y más, con integración de reconocimiento facial y dispositivos IoT.

## Tecnologías Utilizadas

- **Java**: Versión 21
- **Spring Boot**: Versión 4.0.5
  - Spring Data JPA
  - Spring Web MVC
  - Spring Security
  - Spring Validation
- **Base de Datos**: PostgreSQL
- **ORM**: Hibernate (JPA)
- **Documentación API**: SpringDoc OpenAPI (Swagger)
- **Herramientas de Desarrollo**:
  - Lombok (para reducir boilerplate)
  - Maven (gestión de dependencias)
- **Contenedorización**: Docker y Docker Compose

## Arquitectura

El proyecto sigue una arquitectura hexagonal (Clean Architecture) dividida en las siguientes capas:

- **Domain**: Contiene los modelos de dominio, DTOs, excepciones y puertos (interfaces) que definen los contratos.
- **Application**: Incluye los servicios de aplicación (interfaces y implementaciones), y mappers para conversión de datos.
- **Infrastructure**: Maneja la persistencia (entidades JPA, repositorios), configuración de seguridad y otros detalles técnicos.
- **Presentation**: Controladores REST, consejos (advice) para manejo de excepciones y configuración CORS.

Esta arquitectura promueve la separación de responsabilidades, facilitando pruebas, mantenibilidad y escalabilidad.

## Requisitos Previos

- Java 21 instalado
- Maven instalado
- PostgreSQL corriendo (o Docker para contenedorización)
- Docker y Docker Compose (opcional, para ejecución en contenedores)

## Configuración

### Base de Datos

El proyecto está configurado para usar PostgreSQL. En `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/faceattend_edu
spring.datasource.username=admin
spring.datasource.password=admin123
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

- Cambia las credenciales según tu entorno.
- `ddl-auto=update` crea/actualiza las tablas automáticamente.

Para Docker, usa variables de entorno en `docker-compose.yml`.

### Perfiles

- **Default**: Configuración local.
- **Docker**: Para ejecución en contenedores, activado con `SPRING_PROFILES_ACTIVE=docker`.

## Ejecución

### Local

1. Asegúrate de que PostgreSQL esté corriendo.
2. Ejecuta: `mvn spring-boot:run`

### Con Docker

1. Construye y ejecuta: `docker-compose up --build`
2. La aplicación estará en `http://localhost:8080`

## Documentación API

La API está documentada con Swagger. Accede a `http://localhost:8080/swagger-ui.html` para explorar los endpoints.

## Estructura del Proyecto

```
back-end/
├── src/main/java/com/faceattend_edu/
│   ├── FaceattendEduApplication.java          # Clase principal
│   ├── config/                                # Configuraciones (CORS, Security)
│   ├── domain/                                # Capa de dominio
│   │   ├── dto/                               # Data Transfer Objects
│   │   ├── exception/                         # Excepciones personalizadas
│   │   ├── model/                             # Modelos de dominio
│   │   └── port/                              # Puertos (interfaces de repositorio)
│   ├── application/                           # Capa de aplicación
│   │   ├── impl/                              # Implementaciones de servicios
│   │   ├── mapper/                            # Mappers para conversión
│   │   └── service/                           # Interfaces de servicios
│   ├── infrastructure/                        # Capa de infraestructura
│   │   ├── persistence/                       # Persistencia
│   │   │   ├── entity/                        # Entidades JPA
│   │   │   └── repository/                    # Repositorios JPA y adaptadores
│   │   └── security/                          # Configuración de seguridad
│   └── presentation/                          # Capa de presentación
│       ├── advice/                            # Consejos para excepciones
│       └── controller/                        # Controladores REST
├── src/main/resources/
│   └── application.properties                 # Configuración
├── dockerfile                                 # Dockerfile
├── docker-compose.yml                         # Docker Compose
├── pom.xml                                    # Dependencias Maven
└── README.md                                  # Este archivo
```

## Guía para Modificaciones

### Agregar una Nueva Entidad

1. **Domain**:
   - Crea el modelo en `domain/model/`.
   - Define el puerto en `domain/port/`.
   - Crea DTOs en `domain/dto/`.

2. **Application**:
   - Crea la interfaz de servicio en `application/service/`.
   - Implementa en `application/impl/`.
   - Crea mapper en `application/mapper/`.

3. **Infrastructure**:
   - Crea entidad JPA en `infrastructure/persistence/entity/`.
   - Crea JpaRepository en `infrastructure/persistence/repository/`.
   - Crea adaptador que implemente el puerto.

4. **Presentation**:
   - Crea controlador en `presentation/controller/`.

### Seguridad

- Configurada en `config/SecurityConfig.java`.
- Actualmente permite todo en `/**`, autentica `/api/auth/**`, y requiere rol USER para `/api/face/**`.
- Modifica según necesidades (JWT, OAuth, etc.).

### Validación

- Usa anotaciones de Bean Validation en DTOs de request.
- Manejo de errores en `presentation/advice/`.

### Pruebas

- Tests en `src/test/java/`.
- Usa Spring Boot Test para integración.

### Mejores Prácticas

- Mantén la separación de capas.
- Usa inyección de dependencias.
- Maneja excepciones apropiadamente.
- Documenta APIs con anotaciones OpenAPI.

## Contribución

1. Clona el repositorio.
2. Crea una rama para tu feature.
3. Sigue la estructura y arquitectura.
4. Ejecuta tests.
5. Haz pull request.

## Licencia

[Especifica la licencia si aplica]
