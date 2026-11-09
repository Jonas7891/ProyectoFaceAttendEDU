/** Permission a route needs, or null when a valid session is enough. */
export type PermissionRule = (method: string, path: string) => string | null;

/** The request fields the guard reads (a FastifyRequest has all of them). */
export interface GuardRequest {
  method: string;
  url: string;
  headers: { authorization?: string };
  routeOptions?: { url?: string };
}

export interface AuthGuardOptions {
  /** Paths that skip the guard. Default: everything outside /api/ plus the health checks. */
  isPublic?: (path: string, method: string) => boolean;
  /**
   * Path the decision is made on. Default: the URL path percent-decoded like the router
   * does, without its query string. A throw is answered with 400.
   */
  resolvePath?: (req: GuardRequest) => string;
}

/** Adds the onRequest hook; on success sets req.userId and req.authToken. */
export function registerAuthGuard(
  app: { addHook(name: 'onRequest', hook: (req: any, reply: any) => Promise<unknown>): unknown },
  requiredPermission: PermissionRule,
  options?: AuthGuardOptions,
): void;

/** GET with the caller's bearer and a 4 s timeout; body is null unless 2xx. */
export function getJson(url: string, token: string): Promise<{ status: number; body: any }>;

/** Tests only: forget cached sessions and permissions. */
export function clearAuthCache(): void;

export const PUBLIC_PREFIXES: readonly string[];

/** Role names as authorization stores them. */
export const ROLES: Readonly<{ SUPER_ADMIN: 'Super Administrador'; SCHOOL_ADMIN: 'Administrador'; INSTRUCTOR: 'Instructor'; STUDENT: 'Aprendiz' }>;

/**
 * The school a caller may manage. `isSuperAdmin: true` means unrestricted (no school of its own);
 * otherwise `schoolId` is the caller's own school, or null, which must fail secure.
 */
export interface CallerSchool {
  readonly isSuperAdmin: boolean;
  readonly schoolId: number | null;
}

/** Thrown when the scope cannot be resolved; the route answers with this status. */
export class ScopeError extends Error {
  constructor(statusCode: 403 | 503, message: string);
  readonly statusCode: 403 | 503;
}

export interface CallerSchoolDeps {
  /** The service's own getJson, so its tests can stub the identity and authorization calls. */
  getJson(url: string, token: string): Promise<{ status: number; body: any }>;
  /** Academic actors of a person; throw a ScopeError(503) when they cannot be read. */
  actorsOf(personId: string, token: string): Promise<ReadonlyArray<{ schoolId?: number | null }>>;
}

/** Resolves the school of a request the auth guard has authenticated (cached 30 s per user). */
export function createCallerSchoolResolver(deps: CallerSchoolDeps): (req: { userId?: string; authToken?: string }) => Promise<CallerSchool>;

/** Tests only: forget resolved caller schools. */
export function clearCallerSchoolCache(): void;

export const CALLER_SCHOOL_TTL_MS: number;
