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

// Credentials for the seeded login. Override in the environment; never reuse in production.
const SEED_USERNAME = process.env.SEED_USERNAME ?? "seed.admin";
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "SeedAdmin123!";

async function call(service, method, path, body) {
  const url = `${U[service]}${path}`;
  const label = `${method} ${service}${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
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

// Identity: cities, persons, users (auth surface stays testable via /me).
async function seedIdentity() {
  const city = await post("identity", "/api/v1/cities", { name: "Seed City", department: "Seed Dept" });
  ids.cityId = pick(city, "cityId", "id") ?? 1;
  ids.personId = await ensure("identity", "/api/v1/persons", {
    documentNumber: "SEED-001", name: "Seed", lastName: "Student",
    email: "seed.student@example.com", documentType: "CC", status: true,
  }, { idKey: "personId", matchKey: "documentNumber", matchValue: "SEED-001" });
  if (ids.personId) {
    // POST /api/v1/users requires personId + username + password; the password is
    // bcrypt-hashed server side (ADR-008) and never returned by any endpoint.
    await ensure("identity", "/api/v1/users", {
      personId: ids.personId, username: SEED_USERNAME, password: SEED_PASSWORD,
    }, { idKey: "userId", matchKey: "username", matchValue: SEED_USERNAME });
  } else {
    console.log("skip  - user needs a person id (identity person seed failed?)");
  }
  await get("identity", `/api/v1/auth/me?username=${SEED_USERNAME}`);
  await get("identity", "/api/v1/cities?limit=5");
}

// Authorization: roles and permissions used by web/mobile role guards.
async function seedAuthorization() {
  const admin = await post("authorization", "/api/v1/roles", { roleName: "SEED_ADMIN", description: "Seed admin role" });
  const teacher = await post("authorization", "/api/v1/roles", { roleName: "SEED_TEACHER", description: "Seed teacher role" });
  ids.roleId = pick(admin, "roleId", "id") ?? pick(teacher, "roleId", "id");
  await post("authorization", "/api/v1/permissions", { permissionName: "seed.attendance.read", description: "Read attendance" });
  await post("authorization", "/api/v1/permissions", { permissionName: "seed.attendance.write", description: "Write attendance" });
  await get("authorization", "/api/v1/roles");
}

// Academic: full chain schools -> programs -> periods -> cohorts -> courses -> actors -> enrollments.
async function seedAcademic() {
  ids.schoolId = await ensure("academic", "/api/v1/schools",
    { code: "SEED-SCH", name: "Seed School", cityId: 1 },
    { idKey: "schoolId", matchKey: "code", matchValue: "SEED-SCH" }) ?? 1;
  ids.programId = await ensure("academic", "/api/v1/programs",
    { schoolId: ids.schoolId, code: "SEED-PROG", name: "Seed Program" },
    { idKey: "programId", matchKey: "code", matchValue: "SEED-PROG" }) ?? 1;
  ids.periodId = await ensure("academic", "/api/v1/academic-periods",
    { schoolId: ids.schoolId, name: "Seed Period 2026", startsOn: "2026-01-01", endsOn: "2026-12-31", isActive: true },
    { idKey: "academicPeriodId", matchKey: "name", matchValue: "Seed Period 2026" }) ?? 1;
  ids.cohortId = await ensure("academic", "/api/v1/cohorts",
    { programId: ids.programId, academicPeriodId: ids.periodId, code: "SEED-COH-01" },
    { idKey: "cohortId", matchKey: "code", matchValue: "SEED-COH-01" }) ?? 1;
  ids.courseId = await ensure("academic", "/api/v1/courses",
    { programId: ids.programId, code: "SEED-CUR-01", name: "Seed Course", creditHours: 3 },
    { idKey: "courseId", matchKey: "code", matchValue: "SEED-CUR-01" }) ?? 1;
  ids.actorId = await ensure("academic", "/api/v1/academic-actors",
    { personId: "seed-student-01", actorTypeId: 1, schoolId: ids.schoolId, actorCode: "SEED-STU-01" },
    { idKey: "academicActorId", matchKey: "actorCode", matchValue: "SEED-STU-01" }) ?? 1;
  await post("academic", "/api/v1/enrollments", { academicActorId: ids.actorId, cohortId: ids.cohortId });
  await get("academic", "/api/v1/schools");
  await get("academic", `/api/v1/cohorts/${ids.cohortId}/enrollments`);
}

// Scheduling: environments -> blocks -> sessions -> open session.
async function seedScheduling() {
  ids.environmentId = await ensure("scheduling", "/api/v1/environments",
    { schoolId: ids.schoolId ?? 1, code: "SEED-ENV-301", name: "Seed Room 301", capacity: 30 },
    { idKey: "environmentId", matchKey: "code", matchValue: "SEED-ENV-301" }) ?? 1;
  ids.blockId = await ensure("scheduling", "/api/v1/schedule-blocks", {
    cohortId: ids.cohortId ?? 1, courseId: ids.courseId ?? 1,
    environmentId: ids.environmentId, instructorActorId: ids.actorId ?? 1,
    dayOfWeek: 1, startsAt: "08:00:00", endsAt: "10:00:00",
  }, { idKey: "scheduleBlockId", matchKey: "environmentId", matchValue: ids.environmentId });
  if (ids.blockId) {
    const session = await post("scheduling", "/api/v1/class-sessions", {
      scheduleBlockId: ids.blockId, sessionDate: "2026-09-23",
    });
    ids.sessionId = pick(session, "sessionId", "classSessionId", "id");
    // A new session already defaults to session_status 'Open' (DDL default), so POST
    // /{id}/open is a no-op the backend rejects with 400. Only open a session that
    // is not open yet, otherwise the seed reports a false failure.
    if (ids.sessionId && pick(session, "sessionStatus") !== "Open") {
      await post("scheduling", `/api/v1/class-sessions/${ids.sessionId}/open`);
    }
  }
  await get("scheduling", "/api/v1/environments");
}

// Attendance: records (bulk), justification types, justifications.
async function seedAttendance() {
  await post("attendance", "/api/v1/justification-types", {
    name: "Seed Medical", description: "Seed medical excuse", requiresAttachment: false,
  });
  ids.justificationTypeId = await ensure("attendance", "/api/v1/justification-types",
    { name: "Seed Calamity", description: "Seed domestic calamity", requiresAttachment: true },
    { idKey: "justificationTypeId", matchKey: "name", matchValue: "Seed Calamity" }) ?? 1;
  if (ids.sessionId) {
    // attendance_status is the native enum ('Present','Absent','Late','Justified') and
    // capture_method is ('FACIAL','MANUAL','IOT','IMPORT'); casing must match exactly.
    const rec = await post("attendance", "/api/v1/attendance-records", {
      classSessionId: ids.sessionId, academicActorId: ids.actorId ?? 1,
      attendanceStatus: "Present", captureMethod: "MANUAL",
    });
    ids.recordId = pick(rec, "recordId", "attendanceRecordId", "id");
    await post("attendance", "/api/v1/attendance-records/bulk", [{
      classSessionId: ids.sessionId, academicActorId: ids.actorId ?? 1,
      attendanceStatus: "Late", captureMethod: "MANUAL",
    }]);
    if (ids.recordId) {
      await post("attendance", "/api/v1/justifications", {
        attendanceRecordId: ids.recordId, justificationTypeId: ids.justificationTypeId, reason: "Seed excuse",
      });
    }
    await get("attendance", `/api/v1/class-sessions/${ids.sessionId}/attendance`);
  } else {
    console.log("skip  - attendance records need a class session (scheduling seed failed?)");
  }
}

// Biometric: facial enroll, verify, identify with synthetic encodings.
async function seedBiometric() {
  const encoding = [0.12, 0.45, 0.78, 0.23, 0.56, 0.89, 0.34, 0.67];
  await post("biometric", "/api/v1/biometric/facial/enroll", {
    person_id: "seed-student-01", encoding, model_version: "seed-v1",
  });
  await post("biometric", "/api/v1/biometric/facial/verify", { person_id: "seed-student-01", encoding });
  await post("biometric", "/api/v1/biometric/facial/identify", { encoding });
  await get("biometric", "/api/v1/biometric/facial/seed-student-01/history");
}

// Configuration: academic/security configs plus a biometric update case.
async function seedConfiguration() {
  await post("configuration", "/api/v1/configurations/academic", {
    schoolId: ids.schoolId ?? 1, configurationName: "seed.attendance.tolerance", configurationValue: "10",
  });
  await post("configuration", "/api/v1/configurations/security", {
    configurationName: "seed.jwt.ttl", configurationValue: "3600",
  });
  await post("configuration", "/api/v1/biometric-update-cases", {
    personId: "seed-student-01", biometricType: "FACIAL", reason: "Seed re-enrollment",
  });
  await get("configuration", "/api/v1/biometric-update-cases?status=Pending");
}

// Notification: alert type then alert (needs a type id first).
async function seedNotification() {
  ids.alertTypeId = await ensure("notification", "/api/v1/alert-types",
    { code: "SEED_ABSENCE", name: "Seed absence", severity: "MEDIUM", channel: "APP" },
    { idKey: "AlertTypeID", matchKey: "Code", matchValue: "SEED_ABSENCE" });
  if (ids.alertTypeId) {
    await post("notification", "/api/v1/alerts", { academic_actor_id: 1, alert_type_id: ids.alertTypeId });
  }
  await get("notification", "/api/v1/alerts?limit=5");
}

// Quality: project plus read-only instruments used by frontend forms.
async function seedQuality() {
  await post("quality", "/api/v1/quality/projects", { name: "Seed Quality Project", status: "Active" });
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
