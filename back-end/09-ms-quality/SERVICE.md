# Quality Service (`09-ms-quality`) — TypeScript Fastify 8091

## Responsabilidad
CRUD del **instrumento de valoración ISO/IEC 25010:2011** aplicado a los CRUD del backend.
Tablas lógicas (in-memory, patrón 03/07): `quality_evaluation` (soft-delete `deletedAt`).

## Stack
TypeScript + Fastify + Zod (igual que `07-ms-configuration`). Puerto **8091**. Sin FK cross-context.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/quality/characteristics` | Instrumento: 8 características, 24 ítems Likert 1-5, pesos |
| POST | `/api/v1/quality/evaluations` | Crear evaluación (201; exige los 24 ítems) |
| GET | `/api/v1/quality/evaluations?service=&status=&limit=&offset=` | Listar paginado (máx 100) |
| GET | `/api/v1/quality/evaluations/:id` | Detalle con puntaje ponderado |
| PUT | `/api/v1/quality/evaluations/:id` | Actualizar y recalcular puntaje |
| DELETE | `/api/v1/quality/evaluations/:id` | Soft-delete (204) |
| GET | `/api/v1/quality/services/:service/summary` | Promedio agregado por servicio + nivel |
| GET | `/health`, `/api/v1/health` | Salud enriquecida (versión, uptime, timestamp) |

## Modelo de puntaje
Cada subcaracterística se califica 1-5. Promedio por característica y
**global ponderado**: Funcional 20%, Desempeño 15%, Fiabilidad 15%, Seguridad 15%,
Compatibilidad 10%, Usabilidad 10%, Mantenibilidad 10%, Portabilidad 5%.
Nivel: `<2 Deficiente`, `<3 En proceso`, `<3.75 Aceptable`, `<4.5 Bueno`, `>=4.5 Excelente`.

## Ejecución
```bash
npm install
npm run dev    # :8091
npm run build && npm start
```
Gateway: ruta `/api/v1/quality` en `99-api-gateway/kong/kong.yml` (servicio `quality-service`).
