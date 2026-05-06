# Carpeta `src/model`

Propósito:
- Definir las estructuras de datos, DTOs (Data Transfer Objects) y adaptadores que representan las respuestas y peticiones del backend en la aplicación.

Archivos representativos en este proyecto:
- `AttendanceResponse.js`, `AuthResponse.js`, `LoginRequest.js`, `UserResponse.js` — clases/objetos que formalizan la forma de los datos.

Qué incluir aquí:
- Clases o funciones para mapear la respuesta cruda del backend a objetos más convenientes para la UI.
- Validaciones ligeras (por ejemplo, verificar campos obligatorios o transformar fechas a objetos Date).

Por qué es útil:
- Centraliza las transformaciones y evita duplicar parsing en `viewmodels` o `view`.

Recomendaciones prácticas:
- Mantener los modelos pequeños y enfocados en la representación de datos.
- Si es posible, migrar a TypeScript para tener tipos fuertes (interfaces/types) y autocompletado.
- Añadir helpers de serialización/deserialización si la API cambia con frecuencia.

Interacciones:
- `services` retornan datos que luego pueden ser convertidos a modelos si hace falta.
- `viewmodels` consumen `model` para exponer datos listos para la UI.
