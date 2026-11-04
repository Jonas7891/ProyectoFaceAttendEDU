# tools/qa — revisión automatizada

Dos capas que acompañan a `docs/revision/` (ver `00-PROTOCOLO.md` §9):

| Archivo | Qué hace |
|---|---|
| `run.mjs` | Comando único: preflight, reconstrucción opcional del front, L1, L2 y `RESUMEN.md` |
| `api-matrix.mjs` | **L1**: casos negativos de API por rol (permisos, aislamiento entre sedes, validaciones) |
| `ui-smoke.mjs` | **L2**: inicia sesión por el formulario y abre cada ruta de cada rol |
| `lib.mjs` | Cliente HTTP, login, `SELECT` de solo lectura, informes |

## Requisitos
- Stack levantado (`docker ps` con los contenedores `healthy`) y el front en `http://localhost:8090`.
- Chrome o Edge instalado (`playwright-core` no descarga navegadores).
- `docs/revision/.cuentas.local` con `usuario=contraseña` para `admin.faceattend`, `fermin`, `admin.ict`, `maria.sanchez`, `est.ict` (el archivo no se versiona).
  - Para `qa:ui`: el formulario web solo admite correos (valida el formato) y en la base el correo está cifrado en reposo (`enc:v1:…`), por lo que **no se lee por SQL**. El correo sale de la línea opcional `correo.<usuario>=<correo>` del mismo archivo o, si no está, del API (login con el usuario → `/auth/me` → `/persons/{id}`). Sin correo resoluble el rol queda BLOQUEADO con la clave que falta.
- `docs/revision/05-negativos.md` (versionado): matriz de negativos NEG-* de la parte A. `api-matrix.mjs` solo lee de ahí los identificadores `| NEG-Xnn |` (antes de `## B. Casos de interfaz`) para avisar de los casos no cubiertos; si el archivo falta aborta de inmediato con un mensaje claro.

## Uso
```bash
npm run qa                              # todo
npm run qa:rebuild                      # reconstruye el front antes
npm run qa:api                          # solo L1
npm run qa:test                         # pruebas unitarias de tools/qa (node --test, sin red)
npm run qa:ui -- --roles=EST --mobile   # solo L2, un rol, con pasada de 375 px
```
Variables: `QA_WEB_URL`, `QA_API_URL`, `QA_ACCOUNTS_FILE`, `QA_DB_CONTAINER`.

## Seguridad de los datos
- La base **solo se consulta con `SELECT`** (`lib.sql` rechaza cualquier otra sentencia).
- Las escrituras de prueba pasan por la API y llevan `QA` en su nombre; al terminar se **desactivan** (borrado lógico).
- Si una acción prohibida llegara a ejecutarse (un bug real), el script la **revierte** y la reporta como FAIL.
- Kong limita a 300 peticiones/min: ante un `429` el cliente espera y reintenta.

## Resultados
`docs/revision/resultados/` (ignorado por git): `RESUMEN.md`, `L1-api.md/.json`, `L2-ui.md/.json` y capturas en `ui/` de las rutas que no dieron PASS.
