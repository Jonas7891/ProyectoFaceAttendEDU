# Capa de Presentación (Presentation Layer)

## Descripción

La capa de presentación maneja la interacción con el usuario, exponiendo APIs REST y manejando requests/responses. Es el punto de entrada de la aplicación.

## Estructura

- **controller/**: Controladores REST que exponen endpoints (e.g., UserController).
- **advice/**: Clases para manejo global de excepciones y respuestas.

## Responsabilidades

- Recibir y validar requests HTTP.
- Llamar a servicios de aplicación.
- Formatear responses.
- Manejar errores y excepciones globalmente.

## Ejemplos

### Controlador (UserController.java)
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> save(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.save(request));
    }
    // ...
}
```

### Advice (GlobalExceptionHandler.java)
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
    }
    // ...
}
```

## Guía para Modificaciones

- Para nuevos endpoints: Crea controlador con @RestController.
- Usa @Valid en requests para validación.
- Maneja responses con ResponseEntity.
- Agrega advice para excepciones globales.

## Dependencias

- Depende de aplicación.
- Usa anotaciones de Spring Web.
