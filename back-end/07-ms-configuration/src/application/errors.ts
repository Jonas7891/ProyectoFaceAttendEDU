/**
 * A rule of a use case refused the request. It carries the HTTP status and the body the
 * routes have always answered with, so moving the rule out of the route changes nothing
 * for the client.
 */
export class ApplicationError extends Error {
  constructor(
    readonly statusCode: 400 | 403 | 404 | 409,
    readonly error: string,
    message?: string,
    readonly details?: unknown,
  ) {
    super(message ?? error);
    this.withMessage = message !== undefined;
  }

  private readonly withMessage: boolean;

  body(): Record<string, unknown> {
    return {
      error: this.error,
      ...(this.withMessage ? { message: this.message } : {}),
      ...(this.details !== undefined ? { details: this.details } : {}),
      timestamp: new Date().toISOString(),
    };
  }
}

export const notFound = () => new ApplicationError(404, 'NotFound');
export const forbidden = (message: string) => new ApplicationError(403, 'Forbidden', message);
export const badRequest = (message?: string, details?: unknown) => new ApplicationError(400, 'BadRequest', message, details);
export const conflict = (message: string) => new ApplicationError(409, 'Conflict', message);

/** The row, or the 404 a missing one answers with. */
export function orNotFound<T>(value: T | null | undefined): T {
  if (value == null) throw notFound();
  return value;
}
