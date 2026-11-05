# Solicitud consolidada al área jurídica y a la institución

> Reúne en un solo envío todo lo que **solo la institución o su área jurídica pueden responder**
> (fecha de preparación: 2026-11-04). Las propuestas del equipo ya están escritas en los documentos
> enlazados; aquí se pide validarlas o corregirlas. No es asesoría jurídica. Cuando llegue cada
> respuesta, se copia al documento que la nombra y se retira su `TODO`
> (ver [DECISIONES_PENDIENTES_JURIDICA.md](DECISIONES_PENDIENTES_JURIDICA.md)).

## A. Datos que debe entregar la institución

| # | Dato | Dónde se usa | Respuesta |
|---|---|---|---|
| A1 | ¿Quién es el **responsable del tratamiento**: el SENA, el centro de formación o la sede? | Todos los documentos | |
| A2 | Razón social, NIT y domicilio | Política §1, EIB §1, formato del acudiente | |
| A3 | Correo y teléfono para consultas y reclamos (idealmente un buzón institucional) | Política §1 y §5 | |
| A4 | Persona o área que atiende a los titulares y responde los reclamos | Política §5 | |
| A5 | Fecha de entrada en vigencia de la política | Política §9 | |
| A6 | Tres nombres para los roles de incidentes, con suplente, y el correo del buzón de incidentes | INCIDENTES §1 y §2 | |
| A7 | Responsable de la revisión anual de la evaluación de impacto | EIB §8 | |
| A8 | Tamaño típico de un grupo y casos conocidos de suplantación en el registro manual (justifican la biometría) | EIB §2 | |

## B. Preguntas para jurídica

| # | Pregunta | Propuesta del equipo (a validar) | Documento |
|---|---|---|---|
| B1 | ¿Qué plazo de **archivo** (tabla de retención documental) aplica a identificación, académicos, asistencia y soportes? | Aplicar la TRD de la institución y luego anonimizar o borrar | Política §8 |
| B2 | ¿Qué plazo de prescripción debe cubrir la conservación de las **autorizaciones**? | Mientras existan los datos, más el plazo que indique jurídica | Política §8 |
| B3 | ¿Plazo para borrar las **plantillas biométricas** tras la desvinculación? | 6 meses (la revocación sigue borrando de inmediato) | Política §8 |
| B4 | ¿El borrado alcanza a los respaldos? | Sí, con retención máxima de respaldos de 30 días | Política §8 |
| B5 | Neon y AWS tratan datos en Estados Unidos (`us-east-2`). ¿Basta el acuerdo estándar de tratamiento de datos (DPA) de cada proveedor como contrato de transmisión? ¿Tiene EE. UU. nivel adecuado según la lista vigente de la SIC? | Archivar los DPA públicos de Neon, AWS, Vercel, Expo y Google; confirmar la lista de la SIC | Política §6 |
| B6 | ¿La institución está obligada a **inscribir la base de datos en el RNBD** y quién lo hace? | Sí por ser entidad pública; confirmar y preparar el inventario | Política §9 |
| B7 | Plazo y medio de **aviso a la SIC** por un incidente y contenido del aviso a los titulares | Referencia de trabajo: 15 días hábiles desde la detección, por el RNBD; confirmar la norma vigente | INCIDENTES §5 |
| B8 | ¿El uso del modelo `shape_predictor_68_face_landmarks.dat` (licencia iBUG 300-W, no comercial) es "no comercial" cuando lo opera el SENA sin venderlo? Confirmar por escrito | Aceptado como no comercial (decisión del 2026-10-28) | LICENCIAS §Decisión |
| B9 | Titularidad del software según el reglamento de propiedad intelectual del SENA y lo pactado entre los autores (L-10). Enviar el reglamento aplicable y un acuerdo entre autores | Cesión o licencia escrita entre los autores | (hallazgo L-10) |
| B10 | ¿La institución adopta además el formato de la SIC para tratamientos de alto riesgo? | Solo si jurídica lo exige | EIB, introducción |
| B11 | Validar el texto del **formato de autorización del acudiente** y el aviso de privacidad (versión 2026-11) | Ver FORMATO_AUTORIZACION_ACUDIENTE.md | EIB §3 |
| B12 | ¿El instructor que se enrole usa el mismo flujo de autorización que el aprendiz adulto? | Sí | EIB §1 |
| B13 | ¿Se acepta la regla de que la **biometría no se activa con datos reales** hasta cumplir las 7 condiciones de la EIB §7? | Sí; mientras tanto, registro manual | EIB §7 |

## C. Decisiones ya tomadas por el equipo (solo confirmar)

| Decisión | Resultado | Documento |
|---|---|---|
| Grupo sanguíneo | Se conserva como dato **facultativo**; solo verificación de identidad en la app móvil | Política §2 |
| Criterio de aceptación FAR/FRR | FAR ≤ 0,1 % y FRR ≤ 5 %, global y por grupo | EIB §6 |
| Uso exclusivo de la biometría | Prohibidos vigilancia, control disciplinario y otros usos | Política §2 |
| Roles de incidentes | Definidos por cargo; nombres pendientes | INCIDENTES §1 |

## D. Adjuntos que se necesitan de la institución

- Reglamento de propiedad intelectual del SENA aplicable al proyecto.
- Tabla de retención documental (TRD) vigente.
- Lista de los proveedores aprobados por la institución, si existe una.
