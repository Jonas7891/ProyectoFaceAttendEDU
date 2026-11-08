# Carpeta `src/models`

Propósito:
- Clases de dominio que traducen las respuestas del backend (snake_case) a objetos de la app (camelCase) y de vuelta con `toApi()`.

Organización:
- `BaseModel.js`: campos de auditoría comunes (`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`, `row_version`) y `isDeleted()`.
- Una carpeta por contexto del backend: `identity`, `authorization`, `academic`, `scheduling`, `attendance`, `configuration`, `notification`, `audit`.
- `index.js` reexporta todos los modelos: `import { Person, Course } from '../models'`.

Reglas:
- Un modelo no llama a la red ni guarda nada: eso es de `services` y `storage`.
- Todo modelo nuevo extiende `BaseModel` y se exporta en `index.js`.
