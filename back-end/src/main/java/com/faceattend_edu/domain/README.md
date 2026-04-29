# Capa de Dominio (Domain Layer)

## Descripción

La capa de dominio contiene la lógica de negocio central y las reglas del sistema FACEATTEND-EDU. Es independiente de frameworks externos y define los contratos para el resto de la aplicación.

## Estructura

- **model/**: Modelos de dominio que representan las entidades del negocio (e.g., User, Course).
- **dto/**: Data Transfer Objects para requests y responses (e.g., UserRequest, UserResponse).
- **exception/**: Excepciones personalizadas (e.g., NotFoundException).
- **port/**: Interfaces (puertos) que definen contratos para repositorios y otros servicios externos.

## Responsabilidades

- Definir entidades y reglas de negocio.
- Especificar contratos para acceso a datos (repositorios).
- Manejar validaciones de negocio.
- Ser agnóstica a tecnologías (no depende de JPA, Spring, etc.).

## Ejemplos

### Modelo (User.java)
```java
public class User {
    private Integer id;
    private Person idPerson;
    private Language idLanguage;
    private String username;
    private String password;
    // ... getters/setters
}
```

### Puerto (UserRepositoryPort.java)
```java
public interface UserRepositoryPort {
    User save(User user);
    Optional<User> findById(Integer id);
    // ...
}
```

### DTO (UserRequest.java)
```java
public record UserRequest(
    Integer idPerson,
    Integer idLanguage,
    String username,
    String password,
    // ... con validaciones
) {}
```

## Guía para Modificaciones

- Al agregar una nueva entidad: Crea el modelo, puerto, DTOs y excepciones si aplica.
- Mantén los modelos simples, sin anotaciones técnicas.
- Usa records para DTOs inmutables.
- Define puertos para inyección de dependencias.

## Dependencias

Esta capa no debe depender de otras capas ni de frameworks externos.
