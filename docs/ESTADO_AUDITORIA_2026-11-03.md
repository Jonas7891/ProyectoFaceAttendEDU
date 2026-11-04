# Estado de la auditoría y madurez, 3 de noviembre de 2026

Corrige el informe de madurez del 27 de octubre (`INFORME_MADUREZ_MVP_2026-10-27.md`, fuera de este repositorio) y la auditoría funcional del 1 de noviembre (`AUD-01` a `AUD-78`) contra el estado real de `develop` en el commit `12c4ff14`.

**Método:** se cruzaron los mensajes de commit de `origin/develop` con una lectura del código de los hallazgos más graves. No se levantó el stack ni se ejecutaron las pruebas; las cifras de pruebas son las de la CI en verde. Donde solo se leyó el mensaje del commit y no el diff, se indica.

**Por qué hace falta esta corrección:** los informes se escribieron sobre una copia local que iba 32 commits por detrás de `develop`. Varios hallazgos que figuraban como abiertos ya estaban corregidos.

## Calificación

**76 / 100** como proyecto de grado. Como producto listo para datos reales de una sede, ≈ 65 / 100.

| Dimensión | Peso | Nota | Motivo |
|---|---|---|---|
| Funcionalidad | 20 | 16 | Alcance del MVP casi completo; la toma de asistencia (AUD-35/45) vuelve a funcionar. |
| Arquitectura y diseño | 15 | 12 | Hexagonal y coherente. Nueve servicios en tres lenguajes son demasiados para el equipo. |
| Calidad de código | 10 | 7 | Limpio; quedan archivos muy largos y `catch {}` vacíos. |
| Pruebas | 15 | 10 | CI en verde y E2E de seis flujos. Sin pruebas de carga ni medición de FAR/FRR. |
| Seguridad | 15 | 12 | Cerrados N-01 a N-06, S-04, S-10, AUD-20, AUD-66 y AUD-67. Quedan S-01 y AUD-65. |
| Operación | 10 | 7 | Despliegue verificado y monitoreo mínimo. Sin respaldos programados ni staging. |
| Documentación y proceso | 10 | 9 | SRS, ADR, manuales, trazabilidad, runbook y registro de riesgos. |
| Cumplimiento legal | 5 | 3 | Consentimiento versionado y autorización del acudiente. Falta jurídica. |
| **Total** | **100** | **76** | |

## Hallazgos del informe del 27 de octubre

| ID | Estado | Evidencia |
|---|---|---|
| N-01 sesiones ajenas | Cerrado | `sessionAdminOnly` en `AuthTokenFilter` (#284). Leído en el código. |
| N-02 biometría entre sedes | Cerrado | `ensure_staff_scope` en las rutas por `person_id` (#288). Leído en el código. |
| N-03 token en logs | Cerrado | Sin `oldSessionId`/`newSessionId` en identity (#287). Verificado por búsqueda. |
| N-04 token en claro | Cerrado | Solo se guarda la huella SHA-256 (#296, #298). |
| N-05 Kong Admin abierta | Cerrado | `KONG_ADMIN_LISTEN: 127.0.0.1:8001`. |
| N-06 `xlsx` | Cerrado | Ya no está en el `package.json` de Web. |
| S-04 puertos expuestos | Cerrado | #313, verificado en producción el 30 de octubre. |
| S-10 token en `sessionStorage` | Cerrado | Cookie HttpOnly con CSRF (#330 a #333). |
| S-01 secretos en disco | Abierto, solo local | Los archivos `.env*` están ignorados por git. No hay secretos versionados. |

## Hallazgos de la auditoría funcional

Cerrados (AUD-01 ya figuraba resuelto; el resto, según los commits de `develop`, leídos por mensaje y no por diff): AUD-01, 03, 04, 05, 06, 08, 13, 14, 15, 18, 19, 20, 22, 23, 27, 30, 31, 33, 35, 36, 37, 38, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 54, 55, 57, 58, 59, 60, 61, 63, 66, 67, 68, 69, 72, 73, 77.

Parciales: AUD-43, AUD-62 (falta Java y las rutas de configuración y notificación), AUD-70 y AUD-74 (falta el borrado de persona).

Abiertos y sin evidencia de corrección: AUD-02, 07, 09, 10, 11, 12, 16, 17, 21, 24, 25, 26, 28, 29, 32, 34, 39, 53 (PR #379 en borrador), 56, 64, 65, 71, 75, 76, 78.

Total: 78 hallazgos, 49 cerrados, 4 parciales y 25 abiertos.

## Solo existe en la máquina local

- Los archivos `.env`, `.env.bak`, `.env.prod`, `.env.prod.bak` y `.env.prod.bak2`. Su riesgo es del disco, no del repositorio.
- El valor `BIND_IP=0.0.0.0` de `.env.prod`. Desde S-04 ya no importa en producción.
- Los informes de auditoría de la raíz del workspace, que no es un repositorio git.

## Siguiente

1. Subir a `develop` el PR #379 (AUD-53).
2. Confirmar en el código AUD-65, AUD-75, AUD-76, AUD-78 y AUD-10.
3. Medir FAR/FRR con personas reales y repetir el E2E sobre el stack completo.
4. Resolver con jurídica las decisiones de `DECISIONES_PENDIENTES_JURIDICA.md`.
