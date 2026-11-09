/**
 * A rule of a use case refused the request. It carries the HTTP status and the body the
 * routes have always answered with, so moving the rule out of the route changes nothing
 * for the client.
 */
export class ApplicationError extends Error {
  constructor(
    readonly statusCode: 400 | 403 | 404,
    readonly error: string,
    message?: string,
    readonly details?: unknown,
  ) {
    super(message ?? error);
    this.hasMessage = message !== undefined;
  }

  private readonly hasMessage: boolean;

  body(): Record<string, unknown> {
    if (!this.hasMessage) return { error: this.error };
    return { error: this.error, message: this.message, details: this.details, timestamp: new Date().toISOString() };
  }
}

export const notFound = () => new ApplicationError(404, 'NotFound');
export const schoolNotFound = () => new ApplicationError(404, 'SchoolNotFound');
export const forbidden = (message: string) => new ApplicationError(403, 'Forbidden', message);
export const badRequest = (message: string, details?: unknown) => new ApplicationError(400, 'BadRequest', message, details);

/** The row, or the 404 a missing one answers with. */
export function orNotFound<T>(value: T | null | undefined): T {
  if (value == null) throw notFound();
  return value;
}
