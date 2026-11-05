# Procedimiento de respuesta a incidentes de seguridad

> **Borrador técnico.** Los plazos legales, los responsables y el canal de aviso a la
> Superintendencia de Industria y Comercio (SIC) **no están definidos**: están marcados
> con `TODO` y deben confirmarse con el área jurídica y el responsable del tratamiento
> antes de dar este documento por vigente. No inventar plazos ni contactos.

Aplica a cualquier sospecha de acceso no autorizado, fuga o pérdida de datos personales
o biométricos (rostro, huella), compromiso de credenciales o de un servicio. La Ley 1581
de 2012 (art. 17) obliga al responsable a informar a la SIC las violaciones a los
códigos de seguridad y los riesgos en la administración de la información de los
titulares. Contexto de datos y derechos: [PROTECCION_DATOS_LEY_1581.md](PROTECCION_DATOS_LEY_1581.md).

## 1. Roles

| Rol | Persona | Función |
|---|---|---|
| Coordinador del incidente | Cargo propuesto: líder del proyecto. Nombre y suplente: `TODO` | Decide contención, comunica y cierra |
| Responsable técnico | Cargo propuesto: responsable de infraestructura y backend del equipo. Nombre y suplente: `TODO` | Ejecuta contención y recolecta evidencia |
| Responsable del tratamiento / jurídico | Cargo propuesto: la persona que la institución designe como responsable del tratamiento. Nombre: `TODO` | Decide si hay que avisar a la SIC y a los titulares |

Regla: ningún rol puede quedar vacío ni en la misma persona que el coordinador; con tres
aprendices en el equipo, el tercer rol lo cubre quien designe la institución (instructor o jurídica).

## 2. Detección y reporte

- Cualquier persona que sospeche un incidente avisa de inmediato al coordinador por el
  canal interno: **chat del equipo (mensaje directo al coordinador) más correo al buzón
  institucional de incidentes**; dirección del buzón: `TODO`. Los reportes externos llegan según
  [SECURITY.md](../SECURITY.md).
- No pegar credenciales, imágenes de rostros/huellas ni datos personales en el chat, el
  correo ni los tickets: describir el hecho y dónde está la evidencia.
- Anotar desde el primer momento una cronología (hora de detección, qué se vio, quién
  actuó). La hora de detección es la que puede contar para los plazos legales.

## 3. Contención (primeras acciones)

Elegir según el tipo de incidente. Los accesos administrativos van por túnel SSH
(ver [DESPLIEGUE.md](../DESPLIEGUE.md) §9).

| Situación | Acción |
|---|---|
| Sesión o cuenta comprometida | Cerrar la sesión con `DELETE /api/v1/sessions/{id}` (solo Super Administrador; `GET /api/v1/sessions/user/{userId}` lista las de un usuario). Forzar el cambio de contraseña de la cuenta. |
| Secreto de producción expuesto | Generar uno nuevo (`openssl rand -base64 32`), actualizar `ENV_PROD_FILE` y `.env.prod` y recrear los servicios afectados (DESPLIEGUE.md §3). Para MongoDB, usar `database/scripts/rotate-mongo-password.sh` (§6). |
| Claves de cifrado (`PII_ENCRYPTION_KEY`, `PII_HASH_KEY`, `BIOMETRIC_ENCRYPTION_KEY`) | **No cambiarlas sin plan**: cambiarlas exige volver a cifrar y sin ellas los datos no se leen (DESPLIEGUE.md §3). Decidir con el coordinador antes de actuar. |
| Servicio comprometido | Aislarlo (parar el contenedor) conservando los logs; revisar Kong y el servicio con `docker logs faceattend-kong` y `docker logs faceattend-<servicio>` (DESPLIEGUE.md §9). |
| Datos biométricos de un titular expuestos | Borrado definitivo de plantillas y revocación del consentimiento según PROTECCION_DATOS_LEY_1581.md §3, previa decisión del responsable del tratamiento: se pierde la evidencia de las plantillas, así que primero preservar lo necesario para la investigación. |

Los puertos de los servicios solo deben escuchar en `127.0.0.1` (`BIND_IP`) y la API de
administración de Kong también; si un incidente muestra lo contrario, corregirlo es
parte de la contención.

## 4. Evidencia

Antes de reiniciar o recrear contenedores, copiar los logs (`docker logs … > archivo`)
y los registros relevantes a un lugar de acceso restringido. Los logs no deben contener
identificadores de sesión ni correos completos; si los contienen, tratarlos como datos
sensibles. Registrar qué datos y cuántos titulares pudieron verse afectados.

## 5. Evaluación y aviso

1. El responsable del tratamiento determina si el incidente afecta datos personales y
   si debe informarse a la SIC. Plazos internos propuestos: reporte al coordinador de inmediato;
   evaluación inicial (¿hay datos personales afectados?) dentro de las 24 horas siguientes a
   la detección; la contención no espera a esta evaluación. Plazo y medio de aviso a la SIC:
   referencia de trabajo, a **confirmar con jurídica** contra la norma y la guía vigentes de la
   SIC (que hoy se entiende como reporte del incidente en el RNBD dentro de los 15 días hábiles
   siguientes a su detección): `TODO`.
2. Decidir si hay que informar a los titulares afectados y, si son menores de edad, a
   sus representantes legales. Contenido mínimo propuesto: qué ocurrió y cuándo, qué datos
   se vieron afectados, qué hizo la institución, qué puede hacer el titular y a quién escribir
   (buzón del §5 de la política). Canal: correo registrado del titular o, para menores, del
   acudiente. Aprobación del texto: responsable del tratamiento.
3. Si el incidente involucra proveedores (Neon, AWS, Vercel, Expo, correo), avisarles
   según sus procedimientos.

## 6. Erradicación y recuperación

- Corregir la causa (parche, configuración, credencial) y desplegar por el flujo normal
  (PR a `develop`, CI en verde).
- Rotar todo secreto que haya podido estar expuesto, aunque no haya evidencia de uso.
- Restaurar desde respaldo solo si hay una restauración probada. Los scripts `backup.sh`,
  `restore.sh` y `verify-restore.sh` existen y se probaron en local; **falta ensayarlos en el
  servidor real y respaldar PostgreSQL en Neon** (RUNBOOK_OPERACION §3.2, riesgos O-01 y O-02).
  Mientras no se ensaye y se registre la fecha del ensayo aquí, no asumir que se puede restaurar:
  `TODO` (registrar fecha y resultado del ensayo).

## 7. Cierre

Dentro de un plazo razonable tras la recuperación, escribir un informe corto: cronología,
causa raíz, datos y titulares afectados, avisos hechos, acciones correctivas y dueño de
cada una. Actualizar este documento con lo aprendido.
