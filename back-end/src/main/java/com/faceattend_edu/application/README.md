# Capa de Aplicación (Application Layer)

## Descripción

La capa de aplicación coordina el flujo de la aplicación, orquestando las operaciones de negocio. Contiene la lógica de aplicación y actúa como intermediario entre el dominio y la infraestructura.

## Estructura

- **service/**: Interfaces de servicios que definen operaciones de negocio (e.g., UserService).
- **impl/**: Implementaciones de los servicios, inyectando puertos del dominio.
- **mapper/**: Clases para mapear entre modelos de dominio y DTOs.

## Responsabilidades

- Implementar lógica de aplicación (casos de uso).
- Coordinar llamadas a repositorios y otros servicios.
- Mapear datos entre dominio y presentación.
- Manejar transacciones si es necesario.

## Ejemplos

### Servicio (UserService.java)
```java
public interface UserService {
    UserResponse findById(Integer id);
    List<UserResponse> findAll();
    UserResponse save(UserRequest request);
    // ...
}
```

### Implementación (UserServiceImpl.java)
```java
@Service
public class UserServiceImpl implements UserService {
    private final UserRepositoryPort repository;
    private final UserMapper mapper;

    @Override
    public UserResponse findById(Integer id) {
        User user = repository.findById(id).orElseThrow(...);
        return mapper.toResponse(user);
    }
    // ...
}
```

### Mapper (UserMapper.java)
```java
@Component
public class UserMapper {
    public User toDomain(UserRequest request) {
        return new User(null, request.idPerson(), ...);
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), ...);
    }
}
```

## Guía para Modificaciones

- Para nuevos servicios: Crea interfaz en service/, implementación en impl/, mapper si aplica.
- Inyecta puertos del dominio, no repositorios directos.
- Usa @Service para implementaciones.
- Maneja excepciones del dominio apropiadamente.

## Dependencias

- Depende de la capa de dominio.
- No debe depender de infraestructura o presentación.
