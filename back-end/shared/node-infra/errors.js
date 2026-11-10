'use strict';

/**
 * Persistence error model shared by the Node services.
 *
 * Translates driver failures into `RepositoryError`s that carry an HTTP status, so
 * a database problem never surfaces as an opaque 500. The client-facing `details`
 * never carry the driver's own `detail` or message: those can hold other rows' key
 * values or connection information. They stay on `cause` for the server log.
 *
 * Referential-integrity violations are **400**: pointing at a row that does not
 * exist is a bad request.
 */

/**
 * The name a client sees for a table: no schema and no underscores
 * ("academic.academic_actor" -> "academic actor"). The qualified name stays in the
 * server log through `cause`; the response does not reveal the database layout.
 */
function publicName(entity) {
  const name = String(entity ?? 'record');
  return name.slice(name.lastIndexOf('.') + 1).replace(/_/g, ' ');
}

class RepositoryError extends Error {
  constructor(statusCode, errorCode, message, details, cause) {
    super(message);
    this.name = 'RepositoryError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    if (cause !== undefined) this.cause = cause;
  }
}

/** Requested row is absent (or soft-deleted). */
class NotFoundError extends RepositoryError {
  constructor(entity, id) {
    super(404, 'NotFound', `${publicName(entity)} '${String(id)}' was not found`, { entity: publicName(entity), id: String(id) });
    this.name = 'NotFoundError';
  }
}

/** A UNIQUE constraint already holds the value the client sent. */
class ConflictError extends RepositoryError {
  constructor(entity, constraint, cause) {
    super(409, 'Conflict', `${publicName(entity)} already exists (${constraint})`, { entity: publicName(entity), constraint }, cause);
    this.name = 'ConflictError';
  }
}

/** A referenced parent row does not exist. 4xx by design, never a 500. */
class InvalidReferenceError extends RepositoryError {
  constructor(entity, constraint, cause) {
    super(400, 'BadRequest', `Referenced record for ${publicName(entity)} does not exist (${constraint})`, { entity: publicName(entity), constraint }, cause);
    this.name = 'InvalidReferenceError';
  }
}

/** Client value rejected by the database (NOT NULL, CHECK, type, length, enum). */
class InvalidValueError extends RepositoryError {
  constructor(message, details, cause) {
    super(400, 'BadRequest', message, details, cause);
    this.name = 'InvalidValueError';
  }
}

/** Pool closed / database unreachable. */
class DatabaseUnavailableError extends RepositoryError {
  constructor(cause) {
    super(503, 'ServiceUnavailable', 'Database is unavailable', undefined, cause);
    this.name = 'DatabaseUnavailableError';
  }
}

/** Serialisation conflict: safe for the client to retry. */
class RetryableError extends RepositoryError {
  constructor(message) {
    super(503, 'ServiceUnavailable', message);
    this.name = 'RetryableError';
  }
}

// PostgreSQL SQLSTATE codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
const SQLSTATE = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  EXCLUSION_VIOLATION: '23P01',
  STRING_DATA_RIGHT_TRUNCATION: '22001',
  NUMERIC_VALUE_OUT_OF_RANGE: '22003',
  INVALID_DATETIME_FORMAT: '22007',
  DATETIME_FIELD_OVERFLOW: '22008',
  INVALID_TEXT_REPRESENTATION: '22P02',
  INVALID_PARAMETER_VALUE: '22023',
  INVALID_REGULAR_EXPRESSION: '22025',
  DEADLOCK_DETECTED: '40P01',
  SERIALIZATION_FAILURE: '40001',
  CONNECTION_DOES_NOT_EXIST: '08003',
  CONNECTION_FAILURE: '08006',
  SQLCLIENT_UNABLE_TO_ESTABLISH: '08001',
  UNDEFINED_COLUMN: '42703',
  UNDEFINED_TABLE: '42P01',
};

/**
 * Maps a driver error onto a `RepositoryError` with the right HTTP status. `entity`
 * is the schema-qualified table the statement targeted; it only builds a message.
 */
function translateDbError(err, entity = 'record') {
  if (err instanceof RepositoryError) return err;

  const pgErr = err ?? {};
  const label = publicName(entity);
  const code = pgErr.code ?? '';
  const constraint = pgErr.constraint ?? 'unknown constraint';

  switch (code) {
    case SQLSTATE.UNIQUE_VIOLATION:
    case SQLSTATE.EXCLUSION_VIOLATION:
      return new ConflictError(entity, constraint, err);

    case SQLSTATE.FOREIGN_KEY_VIOLATION:
      return new InvalidReferenceError(entity, constraint, err);

    case SQLSTATE.NOT_NULL_VIOLATION:
      return new InvalidValueError(
        `Missing required value for '${pgErr.column ?? constraint}' on ${label}`,
        { constraint, column: pgErr.column },
        err,
      );

    case SQLSTATE.CHECK_VIOLATION:
      return new InvalidValueError(`Value rejected by check constraint '${constraint}' on ${label}`, { constraint }, err);

    case SQLSTATE.STRING_DATA_RIGHT_TRUNCATION:
      return new InvalidValueError(
        `Value too long for column '${pgErr.column ?? constraint}' on ${label}`,
        { column: pgErr.column },
        err,
      );

    case SQLSTATE.NUMERIC_VALUE_OUT_OF_RANGE:
    case SQLSTATE.INVALID_DATETIME_FORMAT:
    case SQLSTATE.DATETIME_FIELD_OVERFLOW:
    case SQLSTATE.INVALID_TEXT_REPRESENTATION:
    case SQLSTATE.INVALID_PARAMETER_VALUE:
    case SQLSTATE.INVALID_REGULAR_EXPRESSION:
      // The SQLSTATE stays in the log (cause); the client only learns the value was invalid.
      return new InvalidValueError(`Invalid value supplied for ${label}`, undefined, err);

    case SQLSTATE.DEADLOCK_DETECTED:
    case SQLSTATE.SERIALIZATION_FAILURE:
      return new RetryableError('Concurrent write conflict, please retry');

    case SQLSTATE.CONNECTION_DOES_NOT_EXIST:
    case SQLSTATE.CONNECTION_FAILURE:
    case SQLSTATE.SQLCLIENT_UNABLE_TO_ESTABLISH:
      return new DatabaseUnavailableError(err);

    case SQLSTATE.UNDEFINED_COLUMN:
    case SQLSTATE.UNDEFINED_TABLE:
      // Schema drift between the service and Liquibase: an operator problem.
      return new RepositoryError(500, 'InternalError', `Database schema mismatch for ${label}`, undefined, err);

    default:
      return new RepositoryError(500, 'InternalError', 'Unexpected database error', undefined, err);
  }
}

module.exports = {
  RepositoryError,
  NotFoundError,
  ConflictError,
  InvalidReferenceError,
  InvalidValueError,
  DatabaseUnavailableError,
  RetryableError,
  translateDbError,
  publicName,
};
