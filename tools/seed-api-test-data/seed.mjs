// Seed test data into FaceAttendEDU microservices.
// Run: npm run seed (Node >= 20, no dependencies).
// Targets direct microservice URLs (see .env.example) to bypass Kong JWT.

const U = {
  identity: process.env.IDENTITY_URL ?? "http://localhost:8081",
  authorization: process.env.AUTHORIZATION_URL ?? "http://localhost:8083",
  academic: process.env.ACADEMIC_URL ?? "http://localhost:8084",
  scheduling: process.env.SCHEDULING_URL ?? "http://localhost:8087",
  attendance: process.env.ATTENDANCE_URL ?? "http://localhost:8085",
  biometric: process.env.BIOMETRIC_URL ?? "http://localhost:8086",
  configuration: process.env.CONFIGURATION_URL ?? "http://localhost:8089",
  notification: process.env.NOTIFICATION_URL ?? "http://localhost:8090",
  quality: process.env.QUALITY_URL ?? "http://localhost:8091",
};

const results = [];
const ids = {};

// Realistic Colombian demo catalog (stable keys keep reruns idempotent).
const CITIES = [
  { name: "Bogotá", department: "Cundinamarca" },
  { name: "Medellín", department: "Antioquia" },
  { name: "Cali", department: "Valle del Cauca" },
];

const PEOPLE = [
  { documentNumber: "1014287635", name: "Valentina", lastName: "Ríos Herrera", email: "valentina.rios@example.com", documentType: "CC", actorCode: "EST-2026-001", biometricId: "est-2026-001" },
  { documentNumber: "1014298812", name: "Santiago", lastName: "Herrera Mora", email: "santiago.herrera@example.com", documentType: "CC", actorCode: "EST-2026-002", biometricId: "est-2026-002" },
  { documentNumber: "1020804451", name: "Camila", lastName: "Torres Vargas", email: "camila.torres@example.com", documentType: "CC", actorCode: "EST-2026-003", biometricId: "est-2026-003" },
  { documentNumber: "1020812398", name: "Daniel", lastName: "Vargas Castillo", email: "daniel.vargas@example.com", documentType: "CC", actorCode: "EST-2026-004", biometricId: "est-2026-004" },
  { documentNumber: "1030665124", name: "Lucía", lastName: "Fernández Rojas", email: "lucia.fernandez@example.com", documentType: "CC", actorCode: "EST-2026-005", biometricId: "est-2026-005" },
  { documentNumber: "1030678903", name: "Mateo", lastName: "Castillo Ospina", email: "mateo.castillo@example.com", documentType: "CC", actorCode: "EST-2026-006", biometricId: "est-2026-006" },
];
// Staff personas (linked to users + roles below).
const STAFF = [
  { documentNumber: "79852314", name: "Carolina", lastName: "Mendoza Ruiz", email: "carolina.mendoza@example.com", documentType: "CC", key: "admin" },
  { documentNumber: "79981245", name: "Carlos", lastName: "Restrepo Álvarez", email: "carlos.restrepo@example.com", documentType: "CC", key: "instructor" },
];
// Demo logins (local testing only, never reuse in production):
//   Administrador: Carolina Mendoza Ruiz / username carolina.mendoza / password Admin2026*
//   Docente:       Carlos Restrepo Álvarez / username carlos.restrepo / password Docente2026*
//   Estudiante:    Valentina Ríos Herrera  / username valentina.rios  / password Estudiante2026*
// Override any of them via SEED_USERNAME / SEED_PASSWORD, INSTRUCTOR_USERNAME /
// INSTRUCTOR_PASSWORD, STUDENT_USERNAME / STUDENT_PASSWORD.
const SEED_USERNAME = process.env.SEED_USERNAME ?? "carolina.mendoza";
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Admin2026*";
const INSTRUCTOR_USERNAME = process.env.INSTRUCTOR_USERNAME ?? "carlos.restrepo";
const INSTRUCTOR_PASSWORD = process.env.INSTRUCTOR_PASSWORD ?? "Docente2026*";
const STUDENT_USERNAME = process.env.STUDENT_USERNAME ?? "valentina.rios";
const STUDENT_PASSWORD = process.env.STUDENT_PASSWORD ?? "Estudiante2026*";
// Bootstrap admin from DB seeds (01-bootstrap-admin-user + 005 role assignment).
// The seed needs its session token: protected endpoints require Bearer + permissions.
const BOOTSTRAP_USERNAME = process.env.BOOTSTRAP_USERNAME ?? "admin.faceattend";
const BOOTSTRAP_PASSWORD = process.env.BOOTSTRAP_PASSWORD ?? "Admin123!ChangeMe";
let TOKEN = null;

async function call(service, method, path, body) {
  const url = `${U[service]}${path}`;
  const label = `${method} ${service}${path}`;
  try {
    const headers = { "Content-Type": "application/json" };
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
    const res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    const ok = res.ok || res.status === 409; // 409: rerun, test data already exists
    results.push({ label, status: res.status, ok });
    console.log(`${ok ? "ok  " : "FAIL"} ${res.status}${res.status === 409 ? " (exists)" : ""} ${label}`);
    return ok ? data : null;
  } catch (e) {
    results.push({ label, status: 0, ok: false });
    console.log(`FAIL conn ${label} (${e.cause?.code ?? e.message})`);
    return null;
  }
}

const get = (s, p) => call(s, "GET", p);
const post = (s, p, b) => call(s, "POST", p, b);
const pick = (obj, ...keys) => { for (const k of keys) if (obj?.[k] !== undefined) return obj[k]; return null; };
const asArray = (v) => (Array.isArray(v) ? v : v?.data ?? v?.alerts ?? v?.alert_types ?? []);

// POST, or on 409 find the existing seed record so reruns keep chained ids.
async function ensure(service, path, body, { idKey, matchKey, matchValue, listPath }) {
  const created = await post(service, path, body);
  const id = created ? pick(created, idKey) : null;
  if (id) return id;
  const list = await get(service, listPath ?? path);
  const found = asArray(list).find((e) => e?.[matchKey] === matchValue);
  return found ? found[idKey] : null;
}

// Login as bootstrap admin: protected endpoints require Bearer + permissions.
// Runs before any seed step; without TOKEN the calls below fail with 401/403.
async function loginSeed() {
  const session = await post("identity", "/api/v1/auth/login", { username: BOOTSTRAP_USERNAME, password: BOOTSTRAP_PASSWORD });
  TOKEN = session ? (pick(session, "sessionId", "session_id", "id") ? String(pick(session, "sessionId", "session_id", "id")) : null) : null;
  if (!TOKEN) console.log("WARN no bootstrap session: protected calls will fail (run DB seeds first)");
}

// Identity: cities, persons, users (auth surface stays testable via /me).
async function seedIdentity() {
  // Cities have no unique constraint on name, so look up first to avoid
  // creating duplicates on every rerun (other catalogs answer 409).
  const knownCities = asArray(await get("identity", "/api/v1/cities?limit=100"));
  for (const c of CITIES) {
    if (knownCities.some((e) => e?.name === c.name)) continue;
    await post("identity", "/api/v1/cities", c);
  }
  const city = await get("identity", "/api/v1/cities?limit=5");
  ids.cityId = pick(asArray(city)[0], "cityId", "id") ?? 1;
  ids.personIds = [];
  for (const p of PEOPLE) {
    const pid = await ensure("identity", "/api/v1/persons", {
      documentNumber: p.documentNumber, name: p.name, lastName: p.lastName,
      email: p.email, documentType: p.documentType, status: true,
    }, { idKey: "personId", matchKey: "documentNumber", matchValue: p.documentNumber });
    if (pid) ids.personIds.push(pid);
  }
  ids.personId = ids.personIds[0] ?? null;
  // Staff personas: Carolina Mendoza (admin) + Carlos Restrepo (instructor).
  ids.staffPersonIds = {};
  for (const s of STAFF) {
    const pid = await ensure("identity", "/api/v1/persons", {
      documentNumber: s.documentNumber, name: s.name, lastName: s.lastName,
      email: s.email, documentType: s.documentType, status: true,
    }, { idKey: "personId", matchKey: "documentNumber", matchValue: s.documentNumber });
    if (pid) ids.staffPersonIds[s.key] = pid;
  }
  // POST /api/v1/users requires personId + username + password; the password is
  // bcrypt-hashed server side (ADR-008) and never returned by any endpoint.
  // Admin reuses SEED_USERNAME so existing smoke tests keep working.
  const logins = [
    { key: "userId", personId: ids.staffPersonIds.admin, username: SEED_USERNAME, password: SEED_PASSWORD },
    { key: "instructorUserId", personId: ids.staffPersonIds.instructor, username: INSTRUCTOR_USERNAME, password: INSTRUCTOR_PASSWORD },
    { key: "studentUserId", personId: ids.personId, username: STUDENT_USERNAME, password: STUDENT_PASSWORD },
  ];
  for (const l of logins) {
    if (!l.personId) {
      console.log(`skip  - user ${l.username} needs a person id (identity person seed failed?)`);
      continue;
    }
    ids[l.key] = await ensure("identity", "/api/v1/users", {
      personId: l.personId, username: l.username, password: l.password,
    }, { idKey: "userId", matchKey: "username", matchValue: l.username });
  }
  await get("identity", `/api/v1/auth/me?username=${SEED_USERNAME}`);
  await get("identity", `/api/v1/auth/me?username=${INSTRUCTOR_USERNAME}`);
  await get("identity", `/api/v1/auth/me?username=${STUDENT_USERNAME}`);
  await get("identity", "/api/v1/cities?limit=5");
}

// Authorization: canonical Mobile roles (Administrador, Instructor, Aprendiz).
// Each demo login gets its role so role-guarded logins resolve correctly.
async function seedAuthorization() {
  const adminRoleId = await ensure("authorization", "/api/v1/roles",
    { roleName: "Administrador", description: "Rol Mobile: acceso total" },
    { idKey: "roleId", matchKey: "roleName", matchValue: "Administrador" });
  const instructorRoleId = await ensure("authorization", "/api/v1/roles",
    { roleName: "Instructor", description: "Rol Mobile: docencia y asistencia" },
    { idKey: "roleId", matchKey: "roleName", matchValue: "Instructor" });
  const aprendizRoleId = await ensure("authorization", "/api/v1/roles",
    { roleName: "Aprendiz", description: "Rol Mobile: consulta propia" },
    { idKey: "roleId", matchKey: "roleName", matchValue: "Aprendiz" });
  ids.roleId = adminRoleId;
  await post("authorization", "/api/v1/permissions", { permissionName: "seed.attendance.read", description: "Read attendance" });
  await post("authorization", "/api/v1/permissions", { permissionName: "seed.attendance.write", description: "Write attendance" });
  const assignments = [
    { userId: ids.userId, roleId: adminRoleId },
    { userId: ids.instructorUserId, roleId: instructorRoleId },
    { userId: ids.studentUserId, roleId: aprendizRoleId },
  ];
  for (const a of assignments) {
    if (a.userId && a.roleId) {
      await post("authorization", `/api/v1/users/${a.userId}/roles`, { roleId: a.roleId });
    } else {
      console.log("skip  - role assignment needs a user id and role id");
    }
  }
  await get("authorization", "/api/v1/roles");
}

// Academic: full chain schools -> programs -> periods -> cohorts -> courses -> actors -> enrollments.
async function seedAcademic() {
  const SCHOOLS = [
    { code: "ANDES-01", name: "Colegio Los Andes" },
    { code: "SAM-02", name: "Colegio San Mateo" },
    { code: "ROS-03", name: "Colegio Santa Rosa de Lima" },
  ];
  ids.schoolIds = [];
  for (const s of SCHOOLS) {
    const sid = await ensure("academic", "/api/v1/schools",
      { code: s.code, name: s.name, cityId: 1 },
      { idKey: "schoolId", matchKey: "code", matchValue: s.code }) ?? null;
    if (sid) ids.schoolIds.push(sid);
  }
  ids.schoolId = ids.schoolIds[0] ?? 1;
  ids.programId = await ensure("academic", "/api/v1/programs",
    { schoolId: ids.schoolId, code: "IS-2026", name: "Ingeniería de Sistemas" },
    { idKey: "programId", matchKey: "code", matchValue: "IS-2026" }) ?? 1;
  await ensure("academic", "/api/v1/programs",
    { schoolId: ids.schoolId, code: "ADMON-2026", name: "Administración de Empresas" },
    { idKey: "programId", matchKey: "code", matchValue: "ADMON-2026" });
  ids.periodId = await ensure("academic", "/api/v1/academic-periods",
    { schoolId: ids.schoolId, name: "Periodo Académico 2026-I", startsOn: "2026-01-01", endsOn: "2026-06-30", isActive: true },
    { idKey: "academicPeriodId", matchKey: "name", matchValue: "Periodo Académico 2026-I" }) ?? 1;
  ids.cohortId = await ensure("academic", "/api/v1/cohorts",
    { programId: ids.programId, academicPeriodId: ids.periodId, code: "COH-2026-I-01" },
    { idKey: "cohortId", matchKey: "code", matchValue: "COH-2026-I-01" }) ?? 1;
  const COURSES = [
    { code: "CALC-101", name: "Cálculo Diferencial", creditHours: 3 },
    { code: "PROG-101", name: "Programación I", creditHours: 4 },
    { code: "FIS-102", name: "Física I", creditHours: 4 },
    { code: "LEN-103", name: "Lengua Castellana", creditHours: 2 },
    { code: "ING-105", name: "Inglés I", creditHours: 2 },
  ];
  ids.courseIds = [];
  for (const c of COURSES) {
    const cid = await ensure("academic", "/api/v1/courses",
      { programId: ids.programId, code: c.code, name: c.name, creditHours: c.creditHours },
      { idKey: "courseId", matchKey: "code", matchValue: c.code }) ?? null;
    if (cid) ids.courseIds.push(cid);
  }
  ids.courseId = ids.courseIds[0] ?? 1;
  // academic_actor.person_id is a native UUID column (cross-context reference to
  // identity.person, no FK): it must be the UUID from seedIdentity(), not the
  // biometric string id (which lives only in MongoDB).
  ids.actorIds = [];
  if (!ids.personIds?.length) {
    console.log("skip  - academic actors need person ids (identity person seed failed?)");
    ids.actorId = null;
  } else {
    for (let i = 0; i < PEOPLE.length && i < ids.personIds.length; i++) {
      const actorId = await ensure("academic", "/api/v1/academic-actors",
        { personId: ids.personIds[i], actorTypeId: 1, schoolId: ids.schoolId, actorCode: PEOPLE[i].actorCode },
        { idKey: "academicActorId", matchKey: "actorCode", matchValue: PEOPLE[i].actorCode }) ?? null;
      if (actorId) ids.actorIds.push(actorId);
    }
    ids.actorId = ids.actorIds[0] ?? null;
  }
  // Docente Carlos Restrepo teaches the block: actor type 2 = INSTRUCTOR.
  ids.instructorActorId = null;
  if (ids.staffPersonIds?.instructor) {
    ids.instructorActorId = await ensure("academic", "/api/v1/academic-actors",
      { personId: ids.staffPersonIds.instructor, actorTypeId: 2, schoolId: ids.schoolId, actorCode: "DOC-2026-001" },
      { idKey: "academicActorId", matchKey: "actorCode", matchValue: "DOC-2026-001" }) ?? null;
  }
  if (ids.actorIds?.length) {
    for (const actorId of ids.actorIds) {
      await post("academic", "/api/v1/enrollments", { academicActorId: actorId, cohortId: ids.cohortId });
    }
  } else {
    console.log("skip  - enrollments need academic actors (academic actor seed failed?)");
  }
  await get("academic", "/api/v1/schools");
  await get("academic", `/api/v1/cohorts/${ids.cohortId}/enrollments`);
}

// POST a session, or on 409 resolve the existing one so reruns keep the id.
// A session defaults to 'Open', so /open is only called when it is not open yet.
async function ensureSession(blockId, date) {
  const created = await post("scheduling", "/api/v1/class-sessions", {
    scheduleBlockId: blockId, sessionDate: date,
  });
  let id = pick(created, "sessionId", "classSessionId", "id");
  let resolved = created;
  if (!id) {
    const list = await get("scheduling", `/api/v1/class-sessions?scheduleBlockId=${blockId}`);
    const found = asArray(list).find((e) =>
      String(e?.sessionDate ?? e?.session_date ?? "").slice(0, 10) === date &&
      String(e?.scheduleBlockId ?? e?.schedule_block_id ?? "") === String(blockId));
    id = found ? pick(found, "sessionId", "classSessionId", "id") : null;
    resolved = found ?? null;
  }
  if (id && pick(resolved, "sessionStatus", "session_status", "status") !== "Open") {
    await post("scheduling", `/api/v1/class-sessions/${id}/open`);
  }
  return id;
}

// Scheduling: environments -> blocks -> sessions -> open sessions.
async function seedScheduling() {
  const ENVS = [
    { schoolIdx: 0, code: "AULA-301-B", name: "Aula 301 - Bloque B", capacity: 30 },
    { schoolIdx: 0, code: "LAB-201-A", name: "Laboratorio 201 - Bloque A", capacity: 24 },
    { schoolIdx: 1, code: "AULA-102-SM", name: "Aula 102 - Sede San Mateo", capacity: 28 },
  ];
  ids.environmentIds = {};
  for (const e of ENVS) {
    const eid = await ensure("scheduling", "/api/v1/environments",
      { schoolId: ids.schoolIds?.[e.schoolIdx] ?? ids.schoolId ?? 1, code: e.code, name: e.name, capacity: e.capacity },
      { idKey: "environmentId", matchKey: "code", matchValue: e.code }) ?? null;
    if (eid) ids.environmentIds[e.code] = eid;
  }
  ids.environmentId = ids.environmentIds["AULA-301-B"] ?? 1;
  // One block per environment keeps the rerun lookup (by environmentId) unambiguous.
  const BLOCKS = [
    { courseIdx: 0, envCode: "AULA-301-B", dayOfWeek: 1, startsAt: "08:00:00", endsAt: "10:00:00" },
    { courseIdx: 1, envCode: "LAB-201-A", dayOfWeek: 3, startsAt: "10:00:00", endsAt: "12:00:00" },
  ];
  ids.blockIds = [];
  for (const b of BLOCKS) {
    const environmentId = ids.environmentIds[b.envCode] ?? 1;
    const bid = await ensure("scheduling", "/api/v1/schedule-blocks", {
      cohortId: ids.cohortId ?? 1, courseId: ids.courseIds?.[b.courseIdx] ?? ids.courseId ?? 1,
      environmentId, instructorActorId: ids.instructorActorId ?? ids.actorId ?? 1,
      dayOfWeek: b.dayOfWeek, startsAt: b.startsAt, endsAt: b.endsAt,
    }, { idKey: "scheduleBlockId", matchKey: "environmentId", matchValue: environmentId }) ?? null;
    if (bid) ids.blockIds.push(bid);
  }
  ids.blockId = ids.blockIds[0] ?? null;
  ids.sessionIds = [];
  if (ids.blockIds.length) {
    const SESSION_DATES = ["2026-09-21", "2026-09-23", "2026-09-28"];
    for (const bid of ids.blockIds) {
      for (const date of SESSION_DATES) {
        const sid = await ensureSession(bid, date);
        if (sid) ids.sessionIds.push(sid);
      }
    }
    ids.sessionId = ids.sessionIds[0] ?? null;
  }
  await get("scheduling", "/api/v1/environments");
}

// Attendance: records (bulk), justification types, justifications.
async function seedAttendance() {
  await post("attendance", "/api/v1/justification-types", {
    name: "Incapacidad médica EPS", description: "Excusa médica certificada por la EPS", requiresAttachment: true,
  });
  ids.justificationTypeId = await ensure("attendance", "/api/v1/justification-types",
    { name: "Calamidad doméstica", description: "Calamidad doméstica debidamente soportada", requiresAttachment: true },
    { idKey: "justificationTypeId", matchKey: "name", matchValue: "Calamidad doméstica" }) ?? 1;
  await ensure("attendance", "/api/v1/justification-types",
    { name: "Compromiso deportivo institucional", description: "Representación institucional en eventos deportivos", requiresAttachment: false },
    { idKey: "justificationTypeId", matchKey: "name", matchValue: "Compromiso deportivo institucional" });
  const sessionIds = ids.sessionIds?.length ? ids.sessionIds : (ids.sessionId ? [ids.sessionId] : []);
  if (sessionIds.length) {
    // attendance_status is the native enum ('Present','Absent','Late','Justified') and
    // capture_method is ('FACIAL','MANUAL','IOT','IMPORT'); casing must match exactly.
    const actors = ids.actorIds?.length ? ids.actorIds : [ids.actorId ?? 1];
    const statuses = ["Present", "Present", "Late", "Absent", "Present", "Late"];
    const rec = await post("attendance", "/api/v1/attendance-records", {
      classSessionId: sessionIds[0], academicActorId: actors[0],
      attendanceStatus: "Present", captureMethod: "MANUAL",
    });
    ids.recordId = pick(rec, "recordId", "attendanceRecordId", "id");
    // Each session gets its own roll call, rotated so no two lists look alike.
    for (let s = 0; s < sessionIds.length; s++) {
      await post("attendance", "/api/v1/attendance-records/bulk", actors.map((academicActorId, i) => ({
        classSessionId: sessionIds[s], academicActorId,
        attendanceStatus: statuses[(i + s) % statuses.length],
        captureMethod: (i + s) % 4 === 0 ? "FACIAL" : "MANUAL",
      })));
    }
    if (ids.recordId) {
      await post("attendance", "/api/v1/justifications", {
        attendanceRecordId: ids.recordId, justificationTypeId: ids.justificationTypeId, reason: "Cita médica prioritaria",
      });
    }
    for (const sid of sessionIds) {
      await get("attendance", `/api/v1/class-sessions/${sid}/attendance`);
    }
  } else {
    console.log("skip  - attendance records need a class session (scheduling seed failed?)");
  }
}

// Biometric: facial enroll, verify, identify with synthetic encodings.
async function seedBiometric() {
  const base = [0.12, 0.45, 0.78, 0.23, 0.56, 0.89, 0.34, 0.67];
  const encodingFor = (i) => base.map((v, j) => +(v + i * 0.01 + j * 0.001).toFixed(4));
  // Legacy id kept for backward compatibility with existing frontends/dashboards.
  await post("biometric", "/api/v1/biometric/facial/enroll", {
    person_id: "seed-student-01", encoding: base, model_version: "seed-v1",
  });
  for (let i = 0; i < PEOPLE.length; i++) {
    await post("biometric", "/api/v1/biometric/facial/enroll", {
      person_id: PEOPLE[i].biometricId, encoding: encodingFor(i), model_version: "seed-v1",
    });
  }
  const first = PEOPLE[0].biometricId;
  await post("biometric", "/api/v1/biometric/facial/verify", { person_id: first, encoding: encodingFor(0) });
  await post("biometric", "/api/v1/biometric/facial/identify", { encoding: encodingFor(0) });
  await get("biometric", `/api/v1/biometric/facial/${first}/history`);
}

// Configuration: academic/security configs plus a biometric update case.
async function seedConfiguration() {
  await post("configuration", "/api/v1/configurations/academic", {
    schoolId: ids.schoolId ?? 1, configurationName: "attendance.tolerance.minutes", configurationValue: "10",
  });
  await post("configuration", "/api/v1/configurations/security", {
    configurationName: "jwt.ttl.seconds", configurationValue: "3600",
  });
  await post("configuration", "/api/v1/biometric-update-cases", {
    personId: PEOPLE[0].biometricId, biometricType: "FACIAL", reason: "Re-enrolamiento por actualización de documento",
  });
  await get("configuration", "/api/v1/biometric-update-cases?status=Pending");
}

// Notification: alert type then alert (needs a type id first).
async function seedNotification() {
  ids.alertTypeId = await ensure("notification", "/api/v1/alert-types",
    { code: "ABSENTEEISM", name: "Inasistencia recurrente", severity: "MEDIUM", channel: "APP" },
    { idKey: "AlertTypeID", matchKey: "Code", matchValue: "ABSENTEEISM" });
  if (ids.alertTypeId) {
    const actors = ids.actorIds?.length ? ids.actorIds.slice(0, 2) : [1];
    for (const academicActorId of actors) {
      await post("notification", "/api/v1/alerts", { academic_actor_id: academicActorId, alert_type_id: ids.alertTypeId });
    }
  }
  await get("notification", "/api/v1/alerts?limit=5");
}

// Quality: project plus read-only instruments used by frontend forms.
async function seedQuality() {
  await post("quality", "/api/v1/quality/projects", { name: "Evaluación institucional 2026-I", status: "Active" });
  await get("quality", "/api/v1/quality/characteristics");
  await get("quality", "/api/v1/quality/process/profile");
  await get("quality", "/api/v1/quality/istqb/categories");
  await get("quality", "/api/v1/quality/projects");
}

// Endpoints with confirmed, still-unfixed backend defects (see README "known issues").
// They run normally but never fail the seed. Keep this empty: an entry here hides a real
// regression, so only add one with a comment naming the defect and where it is tracked.
const KNOWN_ISSUES = new Set([]);

async function main() {
  console.log(`seed start (${new Date().toISOString()})`);
  await loginSeed();
  await seedIdentity();
  await seedAuthorization();
  await seedAcademic();
  await seedScheduling();
  await seedAttendance();
  await seedBiometric();
  await seedConfiguration();
  await seedNotification();
  await seedQuality();
  const failed = results.filter((r) => !r.ok && !KNOWN_ISSUES.has(r.label));
  const known = results.filter((r) => !r.ok && KNOWN_ISSUES.has(r.label));
  console.log(`\nseed done: ${results.length - failed.length - known.length}/${results.length} requests ok${known.length ? `, ${known.length} known backend bugs (see README)` : ""}`);
  if (known.length) {
    console.log("known backend bugs (warn, exit code unaffected):");
    for (const f of known) console.log(`  WARN ${f.status} ${f.label}`);
  }
  if (failed.length) {
    console.log("failures:");
    for (const f of failed) console.log(`  ${f.status} ${f.label}`);
    process.exitCode = 1;
  }
}

await main();
