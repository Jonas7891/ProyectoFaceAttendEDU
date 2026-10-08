// Peticiones que la web ya hacía y el móvil no tenía (paridad con front-end/Web/src/services/api).
// Se verifica método, URL final contra el gateway, cuerpo, Bearer y mapeo a modelos.
import {
  ProgramService,
  CourseService,
  CohortService,
  EnrollmentService,
  SessionService,
  AttendanceService,
  AuthService,
  PasswordPolicyService,
  ActorTypeService,
  UserRoleService,
  AlertTypeService,
  QualityService,
  FaceAuthService,
  ActorService,
  ClassSessionService,
  AlertService,
  BiometricCaseService,
  AcademicConfigService,
} from '../index';

jest.mock('../../storage/TokenStorage', () => ({
  getToken: jest.fn(async () => 'session-token'),
  saveToken: jest.fn(),
}));

const BASE = 'http://gateway.test:8080';

function mockResponse(body, status = 200) {
  global.fetch.mockResolvedValue({ ok: status < 400, status, json: async () => body });
}

function lastCall() {
  const [url, options] = global.fetch.mock.calls.at(-1);
  return { url, method: options.method, body: options.body ? JSON.parse(options.body) : undefined, headers: options.headers };
}

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('rutas anidadas del dominio académico', () => {
  test.each([
    ['ProgramService.listBySchool', () => ProgramService.listBySchool(3), '/api/v1/schools/3/programs', { programId: 9, schoolId: 3 }, 'programId', 9],
    ['CourseService.listByProgram', () => CourseService.listByProgram(4), '/api/v1/programs/4/courses', { courseId: 8, programId: 4 }, 'courseId', 8],
    ['CohortService.listByProgram', () => CohortService.listByProgram(4), '/api/v1/programs/4/cohorts', { cohortId: 7, programId: 4 }, 'cohortId', 7],
    ['EnrollmentService.listByCohort', () => EnrollmentService.listByCohort(5), '/api/v1/cohorts/5/enrollments', { enrollmentId: 6, cohortId: 5 }, 'enrollmentId', 6],
    ['SessionService.listByUser', () => SessionService.listByUser('u-1'), '/api/v1/sessions/user/u-1', { sessionId: 's-1', userId: 'u-1' }, 'sessionId', 's-1'],
  ])('%s', async (_name, call, path, row, key, expected) => {
    mockResponse([row]);

    const result = await call();

    const sent = lastCall();
    expect(sent.method).toBe('GET');
    expect(sent.url).toBe(`${BASE}${path}`);
    expect(sent.headers.Authorization).toBe('Bearer session-token');
    expect(result).toHaveLength(1);
    expect(result[0][key]).toBe(expected); // camelCase del backend -> modelo del móvil
  });

  test('una ruta anidada vacía devuelve []', async () => {
    mockResponse([]);
    await expect(CourseService.listByProgram(99)).resolves.toEqual([]);
  });
});

describe('AttendanceService.getSummary', () => {
  test('pide el resumen por actor y devuelve Map<actorId, conteos>', async () => {
    mockResponse({ 1: { present: 2, late: 0, absent: 1, justified: 0, total: 3 } });

    const summary = await AttendanceService.getSummary([1, 2]);

    const sent = lastCall();
    expect(sent.method).toBe('GET');
    expect(sent.url).toBe(`${BASE}/api/v1/attendance-records/summary?academicActorIds=1%2C2`);
    expect(summary.get(1)).toEqual({ present: 2, late: 0, absent: 1, justified: 0, total: 3 });
  });

  test('parte los ids en lotes de 200 y deduplica', async () => {
    mockResponse({});
    const ids = Array.from({ length: 450 }, (_, i) => i + 1);

    await AttendanceService.getSummary([...ids, 1, 2]);

    expect(global.fetch).toHaveBeenCalledTimes(3); // 200 + 200 + 50
  });

  test('sin ids no hace ninguna petición', async () => {
    await expect(AttendanceService.getSummary([])).resolves.toEqual(new Map());
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('identidad y autorización', () => {
  test('AuthService.me usa email si el identificador lo es y username si no', async () => {
    mockResponse({ userId: 'u-1', personId: 'p-1', username: 'seed.admin', status: true });

    const byUsername = await AuthService.me('seed.admin');
    expect(lastCall().url).toBe(`${BASE}/api/v1/auth/me?username=seed.admin`);
    expect(byUsername).toMatchObject({ userId: 'u-1', personId: 'p-1', username: 'seed.admin' });

    await AuthService.me('ana@sena.edu.co');
    expect(lastCall().url).toBe(`${BASE}/api/v1/auth/me?email=ana%40sena.edu.co`);
  });

  test('PasswordPolicyService.getAll desenvuelve { data } y mapea el modelo', async () => {
    mockResponse({ data: [{ policyId: 1, minLength: 10, maxLength: 30, requiresSymbols: false, expirationDays: 60 }] });

    const [policy] = await PasswordPolicyService.getAll();

    expect(lastCall()).toMatchObject({ method: 'GET', url: `${BASE}/api/v1/password-policies` });
    expect(policy).toMatchObject({ policyId: 1, minLength: 10, maxLength: 30, requiresSymbols: false, expirationDays: 60 });
  });

  test('ActorTypeService.getAll mapea STUDENT / INSTRUCTOR', async () => {
    mockResponse([
      { actorTypeId: 1, code: 'STUDENT', name: 'Estudiante' },
      { actorTypeId: 2, code: 'INSTRUCTOR', name: 'Instructor' },
    ]);

    const types = await ActorTypeService.getAll();

    expect(lastCall()).toMatchObject({ method: 'GET', url: `${BASE}/api/v1/actor-types` });
    expect(types.map((t) => t.code)).toEqual(['STUDENT', 'INSTRUCTOR']);
  });

  test('UserRoleService.assign hace POST /users/:id/roles con { roleId }', async () => {
    mockResponse({ userId: 'u-1', roleId: 2 }, 201);

    await UserRoleService.assign('u-1', 2);

    expect(lastCall()).toMatchObject({
      method: 'POST',
      url: `${BASE}/api/v1/users/u-1/roles`,
      body: { roleId: 2 },
    });
  });

  test('UserRoleService.getByUsers pide los roles de varios usuarios en una petición', async () => {
    mockResponse({ 'u-1': [{ roleId: 1, roleName: 'Administrador' }], 'u-2': [{ roleId: 4, roleName: 'Aprendiz' }] });

    const roles = await UserRoleService.getByUsers(['u-1', 'u-2', 'u-1']);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(lastCall().url).toBe(`${BASE}/api/v1/user-roles?userIds=u-1%2Cu-2`);
    expect(roles.get('u-1')[0]).toMatchObject({ roleId: 1, roleName: 'Administrador' });
    expect(roles.get('u-2')[0].roleName).toBe('Aprendiz');
    expect(roles.has('u-3')).toBe(false);
  });
});

describe('notificación y calidad', () => {
  test('AlertTypeService.create hace POST /alert-types y mapea la respuesta PascalCase del servicio Go', async () => {
    mockResponse({ AlertTypeID: 6, Code: 'CUSTOM', Name: 'Custom', Severity: 'INFO', Channel: 'EMAIL' }, 201);

    const created = await AlertTypeService.create({ code: 'CUSTOM', name: 'Custom', severity: 'INFO', channel: 'EMAIL' });

    expect(lastCall()).toMatchObject({
      method: 'POST',
      url: `${BASE}/api/v1/alert-types`,
      body: { code: 'CUSTOM', name: 'Custom', severity: 'INFO', channel: 'EMAIL' },
    });
    expect(created).toMatchObject({ alertTypeId: 6, code: 'CUSTOM', name: 'Custom' });
  });

  test('AlertTypeService.create no envía channel si no se indica (el backend usa DASHBOARD)', async () => {
    mockResponse({ AlertTypeID: 7, Code: 'X', Name: 'X' }, 201);

    await AlertTypeService.create({ code: 'X', name: 'X', severity: 'WARNING' });

    expect(lastCall().body).toEqual({ code: 'X', name: 'X', severity: 'WARNING' });
  });

  test.each([
    ['getCharacteristics', () => QualityService.getCharacteristics(), '/api/v1/quality/characteristics'],
    ['getEvaluations', () => QualityService.getEvaluations({ service: 'ms-identity' }), '/api/v1/quality/evaluations?service=ms-identity'],
    ['getServiceSummary', () => QualityService.getServiceSummary('ms identity'), '/api/v1/quality/services/ms%20identity/summary'],
    ['getProcessProfile', () => QualityService.getProcessProfile(), '/api/v1/quality/process/profile'],
    ['getProjects', () => QualityService.getProjects(), '/api/v1/quality/projects'],
    ['getIstqbCategories', () => QualityService.getIstqbCategories(), '/api/v1/quality/istqb/categories'],
  ])('QualityService.%s', async (_name, call, path) => {
    mockResponse({ total_questions: 24, totalQuestions: 24 });

    const data = await call();

    expect(lastCall()).toMatchObject({ method: 'GET', url: `${BASE}${path}` });
    expect(data.total_questions).toBe(24); // normalizado a snake_case como el resto del móvil
  });
});

describe('FaceAuthService (biometría vía /face-auth)', () => {
  const F = `${BASE}/face-auth/api`;

  test.each([
    ['health', () => FaceAuthService.health(), 'GET', '/health', undefined],
    ['getLivenessChallenge', () => FaceAuthService.getLivenessChallenge(2), 'GET', '/face/liveness-challenge?actions=2', undefined],
    ['getLivenessChallenge (3 por defecto)', () => FaceAuthService.getLivenessChallenge(), 'GET', '/face/liveness-challenge?actions=3', undefined],
    [
      'submitLivenessStep',
      () => FaceAuthService.submitLivenessStep({ challengeToken: 'tok', actionIndex: 1, images: ['a', 'b'] }),
      'POST',
      '/face/liveness-step',
      { challenge_token: 'tok', action_index: 1, images: ['a', 'b'] },
    ],
    [
      'registerFace',
      () => FaceAuthService.registerFace({ username: 'ana', image: 'img', challengeToken: 'tok' }),
      'POST',
      '/register/face',
      { username: 'ana', image: 'img', challenge_token: 'tok' },
    ],
    [
      'loginFace',
      () => FaceAuthService.loginFace({ image: 'img', challengeToken: 'tok' }),
      'POST',
      '/login/face',
      { image: 'img', challenge_token: 'tok' },
    ],
    [
      'registerFingerprint',
      () => FaceAuthService.registerFingerprint({ username: 'ana', sampleFormat: 5, data: 'b64', quality: 80 }),
      'POST',
      '/register/fingerprint-sample',
      { username: 'ana', sample_format: 5, data_base64: 'b64', quality: 80 },
    ],
    [
      'loginFingerprint',
      () => FaceAuthService.loginFingerprint({ sampleFormat: 5, data: 'b64', quality: 80 }),
      'POST',
      '/login/fingerprint-sample',
      { sample_format: 5, data_base64: 'b64', quality: 80 },
    ],
    ['userExists (codifica el usuario)', () => FaceAuthService.userExists('ana/pérez'), 'GET', '/users/ana%2Fp%C3%A9rez/exists', undefined],
    ['listUsers', () => FaceAuthService.listUsers(), 'GET', '/users', undefined],
    ['listActiveUsers', () => FaceAuthService.listActiveUsers(), 'GET', '/users/active', undefined],
    ['revokeTemplate', () => FaceAuthService.revokeTemplate('ana'), 'POST', '/templates/ana/revoke', undefined],
    ['deleteSubject', () => FaceAuthService.deleteSubject('ana'), 'DELETE', '/subjects/ana', undefined],
  ])('%s', async (_name, call, method, path, body) => {
    mockResponse({ ok: true });

    await call();

    const sent = lastCall();
    expect(sent.method).toBe(method);
    expect(sent.url).toBe(`${F}${path}`);
    expect(sent.body).toEqual(body);
    expect(sent.headers.Authorization).toBe('Bearer session-token');
  });

  test('un rostro no reconocido (401 { detail }) llega como error de negocio con su mensaje', async () => {
    mockResponse({ detail: 'Rostro no reconocido', code: 'forbidden' }, 401);

    await expect(FaceAuthService.loginFace({ image: 'img', challengeToken: 'tok' })).rejects.toMatchObject({
      status: 401,
      message: 'Rostro no reconocido',
    });
  });
});

describe('acciones dedicadas del backend', () => {
  test.each([
    ['openById', () => ClassSessionService.openById(12, 5), '/api/v1/class-sessions/12/open', { openedBy: 5 }],
    ['openById sin actor', () => ClassSessionService.openById(12), '/api/v1/class-sessions/12/open', undefined],
    ['closeById', () => ClassSessionService.closeById(12, 5), '/api/v1/class-sessions/12/close', { closedBy: 5 }],
    ['cancelById', () => ClassSessionService.cancelById(12), '/api/v1/class-sessions/12/cancel', undefined],
  ])('ClassSessionService.%s hace POST y mapea la sesión', async (_name, call, path, body) => {
    mockResponse({ classSessionId: 12, scheduleBlockId: 3, sessionStatus: 'Open' });

    const session = await call();

    const sent = lastCall();
    expect(sent.method).toBe('POST');
    expect(sent.url).toBe(`${BASE}${path}`);
    expect(sent.body).toEqual(body);
    expect(session).toMatchObject({ classSessionId: 12, scheduleBlockId: 3, sessionStatus: 'Open' });
  });

  test('AlertService.markResolved hace PATCH /alerts/:id/resolve y mapea la respuesta PascalCase', async () => {
    mockResponse({ AlertID: 4, AcademicActorID: 9, AlertTypeID: 1, RaisedAt: '2026-10-01T00:00:00Z', ResolvedAt: '2026-10-02T00:00:00Z' });

    const alert = await AlertService.markResolved(4);

    expect(lastCall()).toMatchObject({ method: 'PATCH', url: `${BASE}/api/v1/alerts/4/resolve` });
    expect(alert).toMatchObject({ alertId: 4, academicActorId: 9, alertTypeId: 1 });
  });

  test('BiometricCaseService.review hace PATCH con updateStatus y solo envía lo informado', async () => {
    mockResponse({ caseId: 'c-1', personId: 'p-1', updateStatus: 'Approved', reviewedBy: 'u-1' });

    const reviewed = await BiometricCaseService.review('c-1', {
      updateStatus: 'Approved',
      reviewedBy: 'u-1',
      resolutionNotes: 'Ok',
    });

    expect(lastCall()).toMatchObject({
      method: 'PATCH',
      url: `${BASE}/api/v1/biometric-update-cases/c-1/review`,
      body: { updateStatus: 'Approved', reviewedBy: 'u-1', resolutionNotes: 'Ok' },
    });
    expect(reviewed).toMatchObject({ caseId: 'c-1', updateStatus: 'Approved' });

    await BiometricCaseService.review('c-1', { updateStatus: 'In_Review' });
    expect(lastCall().body).toEqual({ updateStatus: 'In_Review' });
  });
});

describe('configuración y tipos de alerta', () => {
  test('AcademicConfigService.listBySchool usa la ruta anidada de la sede', async () => {
    mockResponse([{ configurationId: 2, schoolId: 3, configurationName: 'tardy_tolerance_minutes', configurationValue: '10' }]);

    const [config] = await AcademicConfigService.listBySchool(3);

    expect(lastCall()).toMatchObject({ method: 'GET', url: `${BASE}/api/v1/schools/3/configurations` });
    expect(config).toMatchObject({ configurationId: 2, schoolId: 3, configurationValue: '10' });
  });

  test('AlertTypeService.getAll desenvuelve { alert_types } del servicio Go', async () => {
    mockResponse({ alert_types: [{ AlertTypeID: 1, Code: 'ATTENDANCE_ABSENTEEISM', Name: 'Recurrent absenteeism' }] });

    const types = await AlertTypeService.getAll();

    expect(lastCall()).toMatchObject({ method: 'GET', url: `${BASE}/api/v1/alert-types` });
    expect(types).toHaveLength(1);
    expect(types[0]).toMatchObject({ alertTypeId: 1, code: 'ATTENDANCE_ABSENTEEISM' });
  });

  test('AlertTypeService.getAll con { alert_types: null } devuelve []', async () => {
    mockResponse({ alert_types: null });
    await expect(AlertTypeService.getAll()).resolves.toEqual([]);
  });
});

describe('las peticiones existentes no cambian', () => {
  test('ClassSessionService.close/cancel siguen usando PUT', async () => {
    mockResponse({ class_session_id: 1 });

    await ClassSessionService.cancel(1);
    expect(lastCall()).toMatchObject({ method: 'PUT', url: `${BASE}/api/v1/class-sessions/1` });

    await ClassSessionService.close(1, 5);
    expect(lastCall()).toMatchObject({ method: 'PUT', url: `${BASE}/api/v1/class-sessions/1` });
  });

  test('AlertService.resolve y BiometricCaseService.approve siguen usando PUT', async () => {
    mockResponse({});

    await AlertService.resolve(4);
    expect(lastCall()).toMatchObject({ method: 'PUT', url: `${BASE}/api/v1/alerts/4` });

    await BiometricCaseService.approve('c-1', 'u-1');
    expect(lastCall()).toMatchObject({ method: 'PUT', url: `${BASE}/api/v1/biometric-update-cases/c-1` });
  });

  test('CourseService.getByProgram sigue usando el filtro legacy por query', async () => {
    mockResponse([]);

    await CourseService.getByProgram(7);

    expect(lastCall()).toMatchObject({ method: 'GET', url: `${BASE}/api/v1/courses?program_id=7` });
  });

  test('ActorService.getBySchool sigue usando la ruta anidada', async () => {
    mockResponse([]);

    await ActorService.getBySchool(3);

    expect(lastCall()).toMatchObject({ method: 'GET', url: `${BASE}/api/v1/schools/3/actors` });
  });

  test('SessionService.getByUserId sigue usando el filtro legacy por query', async () => {
    mockResponse([]);

    await SessionService.getByUserId('u-1');

    expect(lastCall()).toMatchObject({ method: 'GET', url: `${BASE}/api/v1/sessions?user_id=u-1` });
  });
});
