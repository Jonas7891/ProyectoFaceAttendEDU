# Capa de Infraestructura (Infrastructure Layer)

## Descripción

La capa de infraestructura maneja los detalles técnicos y externos, como persistencia, seguridad y comunicaciones. Implementa los puertos definidos en el dominio.

## Estructura

- **persistence/**: Manejo de datos.
  - **entity/**: Entidades JPA que mapean a tablas de BD (e.g., UserEntity).
  - **repository/**: Repositorios JPA y adaptadores que implementan puertos (e.g., UserRepositoryAdapter).
- **security/**: Configuraciones de seguridad (e.g., autenticación, autorización).

## Responsabilidades

- Implementar persistencia con JPA/Hibernate.
- Configurar conexiones a BD.
- Manejar seguridad (Spring Security).
- Adaptar tecnologías externas a contratos del dominio.

## Ejemplos

### Entidad (UserEntity.java)
```java
@Entity
@Table(name = "\"user\"")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    private PersonEntity idPerson;
    // ... campos con anotaciones JPA
}
```

### Adaptador (UserRepositoryAdapter.java)
```java
@Component
public class UserRepositoryAdapter implements UserRepositoryPort {
    private final UserJpaRepository jpaRepository;

    @Override
    public User save(User user) {
        UserEntity entity = toEntity(user);
        UserEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }
    // ... métodos de conversión
}
```

## Guía para Modificaciones

- Para nuevas entidades: Crea entidad JPA, JpaRepository, y adaptador que implemente el puerto.
- Usa anotaciones JPA en entidades.
- Los adaptadores convierten entre domain y entity.
- Configura seguridad en clases de configuración.

## Dependencias

- Depende de dominio y aplicación.
- Contiene detalles técnicos (Spring, JPA, etc.).
