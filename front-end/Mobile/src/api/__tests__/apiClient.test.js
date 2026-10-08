import { request, GET, POST, ApiError, onSessionExpired } from '../apiClient';

jest.mock('../../storage/TokenStorage', () => ({
  getToken: jest.fn(async () => 'session-token'),
}));

const BASE = 'http://gateway.test:8080';

function respond(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

beforeEach(async () => {
  global.fetch = jest.fn();
  // Una respuesta válida rearma el aviso de sesión caducada (flag de módulo en apiClient).
  global.fetch.mockResolvedValueOnce(respond(200, []));
  await request({ method: GET, url: 'api/v1/courses' });
  global.fetch.mockReset();
});

describe('request — comportamiento existente', () => {
  test('adjunta el Bearer y reescribe el endpoint legacy al canónico del gateway', async () => {
    global.fetch.mockResolvedValue(respond(200, [{ program_id: 1 }]));

    await request({ method: GET, url: 'program', params: { limit: 5 } });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/api/v1/programs?limit=5`);
    expect(options.headers.Authorization).toBe('Bearer session-token');
  });

  test('desenvuelve las colecciones paginadas { data, meta }', async () => {
    global.fetch.mockResolvedValue(respond(200, { data: [{ id: 1 }], meta: { total: 1 } }));

    await expect(request({ method: GET, url: 'api/v1/courses' })).resolves.toEqual([{ id: 1 }]);
  });

  test('un 401 normal notifica la sesión caducada una sola vez', async () => {
    const handler = jest.fn();
    const off = onSessionExpired(handler);
    global.fetch.mockResolvedValue(respond(401, { message: 'Invalid or expired session' }));

    await expect(request({ method: GET, url: 'api/v1/courses' })).rejects.toThrow('Invalid or expired session');
    await expect(request({ method: GET, url: 'api/v1/courses' })).rejects.toBeInstanceOf(ApiError);

    expect(handler).toHaveBeenCalledTimes(1);
    off();
  });

  test('un 401 en los flujos de credenciales no cierra la sesión', async () => {
    const handler = jest.fn();
    const off = onSessionExpired(handler);
    global.fetch.mockResolvedValue(respond(401, { message: 'Credenciales inválidas' }));

    await expect(request({ method: POST, url: 'api/v1/auth/login', data: {}, requiresAuth: false })).rejects.toThrow(
      'Credenciales inválidas',
    );

    expect(handler).not.toHaveBeenCalled();
    off();
  });
});

describe('request — respuestas del servicio de biometría (FastAPI)', () => {
  const faceUrl = `${BASE}/face-auth/api/login/face`;

  test('un 401 con { detail } es de negocio: no cierra la sesión y expone el detalle', async () => {
    const handler = jest.fn();
    const off = onSessionExpired(handler);
    global.fetch.mockResolvedValue(respond(401, { detail: 'Rostro no reconocido', code: 'forbidden' }));

    await expect(request({ method: POST, url: faceUrl, data: {} })).rejects.toMatchObject({
      status: 401,
      message: 'Rostro no reconocido',
    });

    expect(handler).not.toHaveBeenCalled();
    off();
  });

  test('un 401 del gateway (con { message }) sobre /face-auth sigue cerrando la sesión', async () => {
    const handler = jest.fn();
    const off = onSessionExpired(handler);
    global.fetch.mockResolvedValue(respond(401, { message: 'Invalid or expired session' }));

    await expect(request({ method: POST, url: faceUrl, data: {} })).rejects.toThrow('Invalid or expired session');

    expect(handler).toHaveBeenCalledTimes(1);
    off();
  });

  test('un 401 con { detail } fuera de /face-auth sigue cerrando la sesión', async () => {
    const handler = jest.fn();
    const off = onSessionExpired(handler);
    global.fetch.mockResolvedValue(respond(401, { detail: 'x' }));

    await expect(request({ method: GET, url: 'api/v1/courses' })).rejects.toBeInstanceOf(ApiError);

    expect(handler).toHaveBeenCalledTimes(1);
    off();
  });

  test('formatea los errores de validación de FastAPI ({ detail: [{ loc, msg }] })', async () => {
    global.fetch.mockResolvedValue(
      respond(422, { detail: [{ loc: ['body', 'username'], msg: 'Field required' }] }),
    );

    await expect(request({ method: POST, url: faceUrl, data: {} })).rejects.toThrow('body.username: Field required');
  });

  test('timeoutMs por petición aborta con 408 sin tocar el timeout por defecto', async () => {
    global.fetch.mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );

    await expect(request({ method: GET, url: 'api/v1/courses', timeoutMs: 20 })).rejects.toMatchObject({ status: 408 });
  });
});
