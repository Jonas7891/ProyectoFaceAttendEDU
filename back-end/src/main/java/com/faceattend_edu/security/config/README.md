# Config Layer - Configuración

## Descripción General

La carpeta de configuración centraliza todas las configuraciones técnicas y beans de Spring necesarios para que la aplicación funcione correctamente. Incluye CORS, seguridad, y otras configuraciones globales.

## Estructura

```
config/
└── CorsConfig.java          # Configuración de CORS
```

## Configuraciones Actuales

### CorsConfig.java

Permite que clientes desde diferentes orígenes accedan a la API:

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

**Parámetros:**
- `addMapping("/api/**")` - Rutas que permiten CORS
- `allowedOrigins()` - Frontend URLs permitidas
- `allowedMethods()` - Métodos HTTP permitidos
- `allowedHeaders("*")` - Headers permitidos
- `allowCredentials(true)` - Permite cookies/tokens
- `maxAge()` - Caché de preflight en segundos

## Configuraciones Recomendadas

### Agregar SecurityConfig (cuando esté activo)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/face/**").hasAnyRole("USER")
                .anyRequest().authenticated()
            )
            .httpBasic()
            .and()
            .build();
    }
}
```

### Agregar JwtConfig (para autenticación)

```java
@Configuration
public class JwtConfig {
    
    @Value("${jwt.secret:your-secret-key}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;
    
    @Bean
    public JwtTokenProvider jwtTokenProvider() {
        return new JwtTokenProvider(jwtSecret, jwtExpiration);
    }
}
```

### Agregar Jackson Config (JSON)

```java
@Configuration
public class JacksonConfig {
    
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        mapper.setDefaultPropertyInclusion(
            JsonInclude.Value.construct(Include.NON_NULL, Include.ALWAYS));
        return mapper;
    }
}
```

## Variables de Entorno

Usa `application.properties` y perfiles:

**application.properties:**
```properties
# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:3001

# Security
jwt.secret=${JWT_SECRET:default-secret-key}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Database
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
```

**application-docker.properties:**
```properties
spring.datasource.url=jdbc:postgresql://postgres:5432/faceattend_edu
spring.datasource.username=admin
spring.datasource.password=admin123
```

## Configuraciones por Perfil

```bash
# Desarrollo local
mvn spring-boot:run

# Docker
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=docker"

# Producción
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
```

## Beans Comunes

| Bean | Propósito |
|------|-----------|
| `WebMvcConfigurer` | Configuración MVC y CORS |
| `ObjectMapper` | Serialización JSON |
| `SecurityFilterChain` | Autenticación y autorización |
| `JwtTokenProvider` | Generación de tokens JWT |
| `RestTemplate` | Cliente HTTP |
| `CacheManager` | Gestión de caché |

## Mejores Prácticas

### ✅ Hacer

- Centralizar configuración en `config/`
- Usar `@Value` para propiedades
- Crear beans reutilizables
- Documentar configuraciones complejas
- Separar por perfiles (dev, docker, prod)

### ❌ No Hacer

- Hardcodear valores
- Configuraciones en controladores
- Mezclar lógica en configuración
- Crear demasiados beans innecesarios

## Herramientas Útiles

**Cambiar orígenes CORS dinámicamente:**
```java
@Component
public class DynamicCorsConfigurer implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = environment.getProperty("cors.allowed-origins")
            .split(",");
        registry.addMapping("/api/**")
            .allowedOrigins(origins)
            .allowedMethods("*");
    }
}
```

