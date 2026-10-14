import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Session + RBAC guard for every /api/** route (same contract as the Java
 * AuthTokenFilter): the Bearer is an opaque session UUID validated against
 * identity, and the permission is evaluated by authorization.
 * Duplicated per service on purpose: the repo has no shared module.
 */
export type PermissionRule = (method: string, path: string) => string | null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PUBLIC_PREFIXES = ['/health', '/api/v1/health', '/api/health'];
const TIMEOUT_MS = 4000;

function deny(reply: FastifyReply, status: number, message: string, path: string) {
  return reply.code(status).send({
    status,
    error: status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : 'ServiceUnavailable',
    message,
    path,
  });
}

async function getJson(url: string, token: string): Promise<{ status: number; body: any }> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = res.ok ? await res.json().catch(() => null) : null;
  return { status: res.status, body };
}

export function registerAuthGuard(app: FastifyInstance, requiredPermission: PermissionRule): void {
  const identityUrl = process.env.IDENTITY_URL || 'http://localhost:8081';
  const authorizationUrl = process.env.AUTHORIZATION_URL || 'http://localhost:8082';

  app.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    const path = req.url.split('?')[0];
    if (req.method === 'OPTIONS' || !path.startsWith('/api/')) return;
    if (PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p))) return;

    const header = req.headers.authorization;
    const token = header && /^bearer\s+/i.test(header) ? header.replace(/^bearer\s+/i, '').trim() : '';
    if (!token) return deny(reply, 401, 'Missing bearer token', path);
    if (!UUID_RE.test(token)) return deny(reply, 401, 'Invalid token format', path);

    let session: { status: number; body: any };
    try {
      session = await getJson(`${identityUrl}/api/v1/sessions/${token}`, token);
    } catch {
      return deny(reply, 503, 'Cannot verify session', path);
    }
    if (session.status !== 200 || session.body?.sessionStatus !== 'Active' || !session.body?.userId) {
      return deny(reply, 401, 'Invalid or expired session', path);
    }
    const userId = String(session.body.userId);

    const permission = requiredPermission(req.method, path);
    if (permission) {
      let allowed = false;
      try {
        const url = `${authorizationUrl}/api/v1/auth/evaluate?userId=${encodeURIComponent(userId)}&permission=${encodeURIComponent(permission)}`;
        const result = await getJson(url, token);
        allowed = result.status === 200 && result.body?.allowed === true;
      } catch {
        return deny(reply, 503, 'Cannot verify permissions', path);
      }
      if (!allowed) return deny(reply, 403, `Forbidden: requires ${permission}`, path);
    }
    (req as any).userId = userId;
  });
}
