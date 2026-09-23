# Biometric Service — `06-ms-biometric`

## 1. Responsabilidad

Gestionar plantillas biometricas (facial y dactilar). Servicio **hibrido SQL + NoSQL** que maneja el enrollment, verificacion e identificacion biométrica, asi como el flujo de aprobacion de actualizaciones.

## 2. Tablas y Colecciones

### SQL (schema `biometric`)

| Tabla | Descripcion | PK |
|-------|-------------|-----|
| *(schema vacio)* | Solo el esquema, tablas en Configuration | - |

**Nota:** `biometric_update_case` vive en el schema `configuration`, gestionada por `08-ms-configuration`.

### NoSQL (MongoDB)

| Coleccion | Descripcion |
|-----------|-------------|
| `facial_embedding` | Plantillas faciales (encoding, modelo, version) |
| `fingerprint_embedding` | Plantillas dactilares (dedo, encoding, modelo, version) |

**Cross-paradigm:** `biometric_update_case.current_embedding_ref` referencia documentos en MongoDB (sin FK real).

## 3. Stack Tecnologico

### 3.1 Lenguaje y Framework

| Componente | Tecnologia | Justificacion |
|------------|-----------|---------------|
| Lenguaje | **Java 21** | Consistencia con el proyecto |
| Framework | **Spring Boot 4.1.1** | Ecosistema unificado |
| Arquitectura | **Hexagonal** | Misma estructura |
| ML Runtime | **ONNX Runtime** | Inferencia de modelos de ML optimizada |

### 3.2 Dependencias Principales

```xml
<!-- Core -->
spring-boot-starter-webmvc
spring-boot-starter-data-jpa
spring-boot-starter-security
spring-boot-starter-validation
spring-boot-starter-actuator
spring-boot-starter-kafka
spring-boot-starter-liquibase

<!-- NoSQL -->
spring-boot-starter-data-mongodb   <!-- MongoDB para embeddings -->

<!-- Computer Vision -->
opencv-java                        <!-- OpenCV para procesamiento de imagen -->

<!-- Machine Learning -->
onnxruntime                        <!-- Inferencia ONNX (face recognition) -->
dlib-java                          <!-- Dlib face detection (alternativa) -->

<!-- Persistencia SQL -->
postgresql

<!-- API Documentation -->
springdoc-openapi-starter-webmvc-ui

<!-- Utilidades -->
lombok
mapstruct
mapstruct-processor
```

### 3.3 Librerias Recomendadas Adicionales

| Libreria | Uso | Por que |
|----------|-----|---------|
| **OpenCV Java** | Procesamiento de imagen facial | Deteccion de rostros, preprocesamiento |
| **ONNX Runtime** | Inferencia de modelos de ML | Ejecutar modelos FaceNet/ArcFace de forma eficiente |
| **DeepJavaLibrary (DJL)** | Framework de ML para Java | Alternativa a ONNX, soporta PyTorch/TF |
| **dlib-java** | Face detection | HOG/CNN face detector alternativo |
| **Spring Data MongoDB** | Persistencia NoSQL | Para colecciones de embeddings |
| **MongoDB Java Driver** | Driver nativo MongoDB | Control fino sobre operaciones |
| **Testcontainers** | Tests de integracion | PostgreSQL + MongoDB en tests |
| **Apache Commons Math** | Calculo de distancias euclidianas/coseno | Comparacion de embeddings |
| **Redis** | Cache de embeddings activos | Cache en memoria para verificacion rapida |
| **Caffeine** | Cache local | Cache de embeddings calientes |

### 3.4 Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Maven** | Build tool |
| **Docker** | Containerizacion |
| **IntelliJ IDEA** | IDE |
| **DBeaver** | Cliente PostgreSQL |
| **MongoDB Compass** | Cliente grafico para MongoDB |
| **Postman / Bruno** | Testing REST |
| **Python (opcional)** | Entrenamiento de modelos, conversion ONNX |

---

## 4. Endpoints

### 4.1 Enrollment Facial

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/biometric/facial/enroll` | Registrar plantilla facial |
| GET | `/api/v1/biometric/facial/{personId}` | Obtener plantilla activa |
| DELETE | `/api/v1/biometric/facial/{personId}` | Eliminar plantilla facial |
| GET | `/api/v1/biometric/facial/{personId}/history` | Historial de versiones |

### 4.2 Enrollment Dactilar

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/biometric/fingerprint/enroll` | Registrar plantilla dactilar |
| GET | `/api/v1/biometric/fingerprint/{personId}` | Obtener plantillas activas |
| GET | `/api/v1/biometric/fingerprint/{personId}/{finger}` | Plantilla de dedo especifico |
| DELETE | `/api/v1/biometric/fingerprint/{personId}/{finger}` | Eliminar plantilla dactilar |

### 4.3 Verificacion/Identificacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/biometric/facial/verify` | Verificar 1:1 (persona + imagen) |
| POST | `/api/v1/biometric/facial/identify` | Identificar 1:N (imagen contra todos) |
| POST | `/api/v1/biometric/fingerprint/verify` | Verificar 1:1 dactilar |

### 4.4 Actualizaciones (via Configuration)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/biometric/update-request` | Solicitar actualizacion de plantilla |
| GET | `/api/v1/biometric/update-requests/{personId}` | Solicitudes de una persona |

---

## 5. Domain Events

| Evento | Trigger | Consumidores tipicos |
|--------|---------|---------------------|
| `FacialEnrolled` | Plantilla facial registrada | Audit |
| `FingerprintEnrolled` | Plantilla dactilar registrada | Audit |
| `FacialVerificationSucceeded` | Verificacion 1:1 exitosa | Attendance (registrar asistencia) |
| `FacialVerificationFailed` | Verificacion 1:1 fallida | Audit, Notification |
| `BiometricUpdateRequested` | Solicitud de actualizacion | Configuration, Notification |

---

## 6. Arquitectura Hibrida

```
┌─────────────────────────────────────────────────┐
│                BIOMETRIC SERVICE                 │
├────────────────────┬────────────────────────────┤
│   SQL (PostgreSQL) │   NoSQL (MongoDB)          │
│                    │                            │
│   biometric schema │   facial_embedding         │
│   (schema vacio)   │   fingerprint_embedding    │
│                    │                            │
├────────────────────┴────────────────────────────┤
│              INFERENCIA ML                      │
│                                                 │
│   OpenCV → Preprocesamiento de imagen           │
│   ONNX Runtime → FaceNet/ArcFace embedding      │
│   Distancia coseno → Comparacion de embeddings  │
└─────────────────────────────────────────────────┘
```

### Estructura de un embedding facial

```json
{
  "person_id": "uuid",
  "template_version": 2,
  "encoding": [0.012, -0.034, ...],
  "model_version": "facenet-v1",
  "enrolled_at": "2026-01-15T10:30:00Z",
  "is_active": true
}
```

### Estructura de un embedding dactilar

```json
{
  "person_id": "uuid",
  "finger_number": 1,
  "template_version": 1,
  "encoding": [0.123, 0.456, ...],
  "model_version": "fingerprint-v1",
  "enrolled_at": "2026-01-15T10:35:00Z",
  "is_active": true
}
```

---

## 7. Modelos de ML Recomendados

| Modelo | Tipo | Precision | Uso |
|--------|------|-----------|-----|
| **FaceNet** | Facial | 99.63% (LFW) | Generacion de embeddings faciales |
| **ArcFace** | Facial | 99.83% (LFW) | Generacion de embeddings faciales (state-of-art) |
| **MobileFaceNet** | Facial | 99.55% | Optimizado para movil/edge |
| **OpenFace** | Facial | 99.35% | Open source, ligero |
| **DeepPrint** | Dactilar | 98%+ | Embeddings dactilares |

---

## 8. Configuracion

### application.yml (ejemplo)

```yaml
server:
  port: 8086

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/faceattend_db
    username: postgres
    password: postgres
    hikari:
      schema: biometric
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.default_schema: biometric
  data:
    mongodb:
      uri: mongodb://localhost:27017/faceattend_biometric
  kafka:
    bootstrap-servers: localhost:9092
    group-id: biometric-service

# Configuracion ML
biometric:
  facial:
    model-path: models/facenet.onnx
    embedding-size: 128
    confidence-threshold: 0.85
    similarity-threshold: 0.90
  fingerprint:
    model-path: models/fingerprint.onnx
    embedding-size: 256
    similarity-threshold: 0.85
  cache:
    enabled: true
    ttl-minutes: 60
    max-entries: 10000
```

---

## 9. Puertos del Servidor

| Puerto | Servicio |
|--------|----------|
| 8086 | REST API |
| 9092 | Kafka (externo) |
| 5432 | PostgreSQL (externo) |
| 27017 | MongoDB (externo) |
| 6379 | Redis (externo, cache) |

---

## 10. Analisis de Lenguaje

### Candidatos evaluados

| # | Lenguaje | Framework | ML/CV Ecosistema | OpenCV | dlib | TensorFlow | Rendimiento |
|---|----------|-----------|:-----------------:|:------:|:----:|:----------:|:-----------:|
| 1 | **Python 3.12** | FastAPI | Nativo | cv2 nativo | pip install | Nativo | Bueno (I/O) |
| 2 | Java 21 | Spring Boot + DJL | Moderado | OpenCV Java | JNI wrapper | DJL backend | Excelente |
| 3 | C++ | OpenCV nativo | Nativo | Nativo | Nativo | Nativo | Maximo |

### Por que Python gana

- **OpenCV**: `pip install opencv-python` — listo. En Java/C++ requiere compilation manual.
- **dlib**: `pip install dlib` — face detection, 68-point landmarks, 128D embeddings. En Java no existe binding oficial.
- **face_recognition**: Libreria de alto nivel sobre dlib con 99.38% precision. Una linea de codigo para enroll/verify.
- **TensorFlow/PyTorch**: Entrenamiento y fine-tuning de modelos FaceNet/ArcFace nativo.
- **FastAPI**: Auto-generacion de OpenAPI docs, validacion con Pydantic, async nativo.
- **Rapidez de desarrollo**: Un pipeline de enrollment facial se implementa en ~200 lineas vs ~800+ en Java/C++.
- **Hugging Face**: Modelos pre-entrenados de face recognition listos para usar.

### Por que no Java

- DeepJavaLibrary (DJL) es una capa sobre PyTorch/TF pero menos madura que el ecosistema Python nativo.
- OpenCV Java binding es funcional pero no tiene todas las funciones del original C++.
- dlib no tiene binding Java oficial — requiere JNI manual.
- Para ML/CV, Python es el estandar de la industria.

### Por que no C++

- Maximo rendimiento pero desarrollo 5x mas lento.
- Gestion manual de memoria, compilacion compleja, dependencias del sistema.
- Para el volumen de FaceAttend-Edu (institucion educativa, no millones de RPS), Python es suficiente.
- OpenCV C++ es rapido pero la diferencia de latencia (ms vs sub-ms) no impacta al usuario final.

### Decision: Python 3.12 (FastAPI)

Biometric es el servicio de **ML/vision artificial** del sistema. Python es el lenguaje natural para OpenCV, dlib, TensorFlow/PyTorch. FastAPI提供了async I/O performance comparable a Go para I/O-bound workloads, con el ecosistema de ML mas rico del mundo.
