'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ConflictError,
  DatabaseUnavailableError,
  InvalidReferenceError,
  InvalidValueError,
  NotFoundError,
  RepositoryError,
  RetryableError,
  translateDbError,
} = require('./errors');

// A database failure must become a client-safe status, never a raw driver message.
const CASES = [
  ['23505', 409, ConflictError],
  ['23P01', 409, ConflictError],
  ['23503', 400, InvalidReferenceError],
  ['23502', 400, InvalidValueError],
  ['23514', 400, InvalidValueError],
  ['22001', 400, InvalidValueError],
  ['22003', 400, InvalidValueError],
  ['22007', 400, InvalidValueError],
  ['22008', 400, InvalidValueError],
  ['22P02', 400, InvalidValueError],
  ['22023', 400, InvalidValueError],
  ['22025', 400, InvalidValueError],
  ['40P01', 503, RetryableError],
  ['40001', 503, RetryableError],
  ['08003', 503, DatabaseUnavailableError],
  ['08006', 503, DatabaseUnavailableError],
  ['08001', 503, DatabaseUnavailableError],
];

for (const [code, status, type] of CASES) {
  test(`SQLSTATE ${code} -> ${status}`, () => {
    const err = translateDbError({ code, constraint: 'uq_school_code', column: 'code', detail: 'Key (code)=(S1) exists' }, 'academic.school');
    assert.ok(err instanceof type);
    assert.equal(err.statusCode, status);
  });
}

test('the driver detail and message never reach the client-facing details', () => {
  const driver = {
    code: '23505',
    constraint: 'uq_person_email',
    detail: 'Key (email)=(victim@example.com) already exists.',
    message: 'duplicate key value violates unique constraint',
  };
  const conflict = translateDbError(driver, 'identity.person');
  assert.equal(conflict.message, 'person already exists (uq_person_email)');
  assert.deepEqual(conflict.details, { entity: 'person', constraint: 'uq_person_email' });
  assert.equal(conflict.cause, driver); // kept for the server log only
  assert.doesNotMatch(JSON.stringify(conflict.details), /victim@example\.com/);

  const unreachable = translateDbError({ code: '08006', message: 'connect ECONNREFUSED 10.0.0.5:5432' });
  assert.equal(unreachable.details, undefined);
  assert.doesNotMatch(unreachable.message, /10\.0\.0\.5/);

  // An out-of-range id once answered SQLSTATE 22003 and "academic.academic_actor".
  const badValue = translateDbError({ code: '22003', message: 'value "99999999999999999999" is out of range' }, 'academic.academic_actor');
  assert.equal(badValue.statusCode, 400);
  assert.equal(badValue.message, 'Invalid value supplied for academic actor');
  assert.equal(badValue.details, undefined);
  assert.equal(badValue.cause.code, '22003'); // still in the server log
});

test('a missing reference names the constraint, defaulting when the driver omits it', () => {
  assert.deepEqual(translateDbError({ code: '23503' }, 'academic.cohort').details, {
    entity: 'cohort',
    constraint: 'unknown constraint',
  });
});

test('missing or too long values name the column', () => {
  assert.match(translateDbError({ code: '23502', column: 'name' }, 'academic.program').message, /'name' on program$/);
  assert.match(translateDbError({ code: '22001' }, 'academic.program').message, /too long for column 'unknown constraint'/);
});

test('schema drift and unknown errors are 500 without the driver message', () => {
  const drift = translateDbError({ code: '42P01', message: 'relation "x" does not exist' }, 'academic.course');
  assert.equal(drift.statusCode, 500);
  assert.equal(drift.message, 'Database schema mismatch for course');
  assert.equal(drift.details, undefined);
  const unknown = translateDbError(new Error('boom'));
  assert.equal(unknown.statusCode, 500);
  assert.equal(unknown.message, 'Unexpected database error');
  assert.equal(translateDbError(null).statusCode, 500);
});

test('repository errors pass through and keep their identity', () => {
  const notFound = new NotFoundError('academic.school', 7);
  assert.equal(translateDbError(notFound), notFound);
  assert.equal(notFound.statusCode, 404);
  assert.deepEqual(notFound.details, { entity: 'school', id: '7' });
  assert.equal(notFound.message, "school '7' was not found");
  assert.ok(notFound instanceof RepositoryError && notFound instanceof Error);
  assert.equal(new RetryableError('retry').statusCode, 503);
});
