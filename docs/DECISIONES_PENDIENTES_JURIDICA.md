# Decisiones pendientes para jurídica y la institución

Los cuatro borradores ya existen y reflejan lo que hace el código: [POLITICA_TRATAMIENTO_DATOS.md](POLITICA_TRATAMIENTO_DATOS.md), [EVALUACION_IMPACTO_BIOMETRIA.md](EVALUACION_IMPACTO_BIOMETRIA.md), [INCIDENTES.md](INCIDENTES.md) y [LICENCIAS_MODELOS_BIOMETRICOS.md](LICENCIAS_MODELOS_BIOMETRICOS.md). Lo que les falta no se puede inventar desde el código: son datos y decisiones de la institución (sus `TODO`). Esta hoja los reúne en un solo lugar, con una **propuesta técnica** donde la hay. Las propuestas no son asesoría jurídica y las debe validar el área jurídica.

Cuando se llene una fila, se copia el valor al documento que la nombra y se retira su `TODO`.

## 1. Datos del responsable (política, evaluación de impacto, aviso de privacidad)

| Dato | Documento | Hallazgo |
|---|---|---|
| Razón social, NIT, domicilio | Política §1, Evaluación §1 | L-02, N-10 |
| Correo y teléfono para consultas y reclamos | Política §1 y §5 | L-02 |
| Persona o área que atiende a los titulares y responde reclamos | Política §5 | L-02 |
| Fecha de entrada en vigencia de la política | Política §9 | L-02 |

## 2. Plazos de conservación y borrado (L-NEW-03, Política §8)

Hoy el código solo borra: los registros de verificación biométrica a los 90 días (índice TTL de MongoDB) y las plantillas cuando el titular revoca. Todo lo demás se conserva sin plazo. Propuesta para discutir; el borrado programado se implementa **después** de que jurídica fije los plazos reales.

| Datos | Propuesta técnica | Qué debe decidir la institución |
|---|---|---|
| Plantillas biométricas | Borrar a los N meses de la desvinculación del aprendiz | N, y si la revocación sigue borrando de inmediato (hoy sí) |
| Identificación, académicos y asistencia | Conservar mientras dure el vínculo y el plazo de archivo académico de la institución; después, anonimizar o borrar | Plazo de archivo que le exija la ley o su reglamento |
| Justificaciones y soportes (archivos en MinIO) | Mismo plazo que la asistencia a la que pertenecen | Plazo |
| Autorizaciones y aceptaciones | Conservar mientras existan los datos que autorizan, más el plazo de prescripción que indique jurídica | Plazo |

El modelo usa borrado lógico (`deleted_at`): el borrado definitivo al vencer cada plazo es trabajo nuevo y hay que definir si también alcanza a los respaldos.

## 3. Proveedores y transferencia internacional (L-06, Política §6)

| Proveedor | Qué guarda | Falta |
|---|---|---|
| Neon | PostgreSQL (identidad, académico, asistencia) | Región verificada el 30 de octubre de 2026: `aws-us-east-2` (Ohio, **Estados Unidos**), no Brasil. Falta firmar el contrato de transmisión y confirmar el nivel adecuado de protección para Estados Unidos |
| AWS | Servidor, MongoDB (biometría) y archivos | Región y contrato |
| Vercel | Aplicación web | Contrato; no guarda datos de la base, pero proxea las peticiones de la API (S-10) |
| Expo | Notificaciones móviles | Contrato |
| Gmail | Correo | Contrato |

Para cada uno jurídica decide: contrato de transmisión o términos del proveedor, y si el país tiene nivel adecuado según la lista de la SIC.

## 4. Biometría (evaluación de impacto, L-04)

| Decisión | Detalle |
|---|---|
| Justificar que la biometría es necesaria y proporcional | Dejarlo escrito (Evaluación §2). Si hay alternativa manual y la negativa no tiene consecuencias, lo respalda L-NEW-01 |
| Formato de autorización firmada del acudiente | Redactarlo; el sistema ya exige el archivo firmado de los menores |
| Criterio de aceptación de FAR y FRR | Propuesta inicial: FAR ≤ 0,1 % y FRR ≤ 5 %, con alternativa manual para el resto. Se mide **antes** del piloto, con consentimiento de los participantes, y se anota en Evaluación §6 |
| Sesgo del modelo (dlib) | Medir por grupos con los aprendices reales y decidir qué hacer si hay diferencia |
| Pruebas de ataque a la prueba de vida | Foto en pantalla, máscara |
| Política escrita que prohíba otros usos (vigilancia, control disciplinario) | R10 |
| Responsable y fecha de la próxima revisión | Al menos una vez al año |
| Conclusión de la evaluación | Si el tratamiento es necesario y proporcional, y qué condiciones quedan |

## 5. Incidentes (L-NEW-02)

| Decisión | Detalle |
|---|---|
| Coordinador, responsable técnico, responsable de tratamiento o jurídico | Tres nombres (§1 de INCIDENTES.md) |
| Canal interno de reporte | Correo o chat |
| Cuándo y cómo se avisa a la SIC y a los titulares | Plazo, medio y contenido; confirmar con jurídica |
| Restauración desde respaldo | Aún no hay una restauración probada sobre el servidor real (OPS-01) |

## 6. Trámites e inscripciones

| Trámite | Hallazgo |
|---|---|
| Inscribir la base de datos en el RNBD de la SIC | L-05 |
| Titularidad del software según el reglamento de propiedad intelectual del SENA y lo pactado entre los autores | L-10 |
| Confirmar que el uso de los modelos faciales de dlib no es "comercial" según su licencia, y la licencia de Liquibase 5 (FSL) | L-12 |
| Si la institución adopta además el formato de la SIC para tratamientos de alto riesgo | L-04 |

## 7. Grupo sanguíneo (N-11)

Hoy el dato se pide y solo sirve como pregunta de verificación de identidad en la app móvil cuando falla el rostro. Si la institución decide no pedirlo, el cambio de código es pequeño (campo opcional o eliminado, y otra pregunta de verificación). Decisión: conservarlo, hacerlo opcional o quitarlo.

**Decidido el 2026-11-04:** se conserva como dato **facultativo**, solo para la pregunta de verificación de identidad en el móvil (ver Política §2). No hay cambio de código. Falta únicamente la validación de jurídica.

## 8. Estado al 2026-11-04

Todo lo que el equipo podía cerrar por su cuenta ya está escrito. Lo que sigue abierto depende de la institución o de jurídica y está reunido, con las preguntas ya redactadas, en [SOLICITUD_A_JURIDICA.md](SOLICITUD_A_JURIDICA.md).

| Tema | Estado | Qué falta | Quién |
|---|---|---|---|
| 1. Datos del responsable | Abierto | Los 6 datos (solicitud A1-A5) | Institución |
| 2. Plazos de conservación | Propuesta escrita (plantillas 6 meses, respaldos 30 días, resto por la TRD) | Validar plazos; **implementar el borrado definitivo** (trabajo de código nuevo) | Jurídica; equipo |
| 3. Proveedores | Regiones documentadas; Vercel y Gmail sin región fija | Archivar los DPA, confirmar nivel adecuado de EE. UU. (B5) | Equipo; jurídica |
| 4. Biometría | Justificación (borrador), formato del acudiente, uso exclusivo y criterio FAR/FRR escritos | Datos de A8, validar el formato (B11), revisar menores previos al PR #309, conclusión y firma de la EIB §7 | Institución; jurídica; equipo |
| 4. Medición FAR/FRR, sesgo y ataques | Criterio fijado y herramienta lista (`measure_far_frr.py`, probada con datos sintéticos); **sin medir con personas reales** | Reunir ≥ 30 personas con consentimiento y ejecutarla (EIB §6); las pruebas de ataque (foto en pantalla, máscara) se hacen a mano | Equipo |
| 7. Respaldos | Script de producción con cifrado y retención de 30 días listo (`backup-prod.sh`); probado en seco | Instalar el cron en el servidor, definir destino externo y ensayar una restauración real (RUNBOOK §3.2) | Equipo |
| 5. Incidentes | Roles por cargo, plazos internos y contenido del aviso escritos | Nombres (A6), plazo legal de aviso a la SIC (B7), ensayo de restauración en el servidor real | Institución; jurídica; equipo |
| 6. RNBD | Abierto | B6 | Jurídica |
| 6. Titularidad del software | Abierto | B9 y el acuerdo entre autores | Equipo; institución |
| 6. Licencia dlib | Aceptada con reserva | Confirmación escrita (B8) | Jurídica |
| 7. Grupo sanguíneo | **Cerrado** (facultativo) | Validación de jurídica | Jurídica |

**Regla para la entrega:** la biometría con datos reales no se activa hasta cumplir las 7 condiciones de la EIB §7; entre tanto la asistencia se toma por el registro manual (ver EIB §7). Así la entrega no depende de las respuestas de jurídica.
