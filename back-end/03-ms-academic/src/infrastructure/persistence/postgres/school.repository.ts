import type { School } from '../../../domain/entities/School';
import type { ISchoolRepository } from '../../../domain/ports/out/ISchoolRepository';
import { PostgresCrudRepository, type FieldSpec, intToText, toInt } from './crud.repository';
import { AUDIT_FIELDS } from './audit.fields';

/**
 * PostgreSQL adapter for `academic.school`.
 *
 * Response key order matches what the in-memory store used to emit
 * (schoolId, code, name, cityId, address, phone, email, status, audit) so the
 * JSON contract is unchanged.
 *
 * `city_id` is VARCHAR(100) NULL in PostgreSQL — there is deliberately no
 * cross-context FK to `identity.city` — while the API exposes `cityId` as a
 * number. Written as text, read back as a number.
 *
 * Columns `district`, `country` and `city_name` exist in the table but have
 * never been part of the API response, so they are neither selected nor written.
 */
export class PostgresSchoolRepository extends PostgresCrudRepository<School> implements ISchoolRepository {
  protected readonly qualifiedTable = 'academic.school';
  protected readonly primaryKeyColumn = 'school_id';
  protected readonly primaryKeyField = 'schoolId';
  protected readonly fields: readonly FieldSpec[] = [
    { field: 'schoolId', column: 'school_id', writable: false },
    { field: 'code', column: 'code' },
    { field: 'name', column: 'name' },
    { field: 'cityId', column: 'city_id', toParam: intToText, fromRow: toInt },
    { field: 'address', column: 'address' },
    { field: 'phone', column: 'phone' },
    { field: 'email', column: 'email' },
    { field: 'status', column: 'status' },
    ...AUDIT_FIELDS,
  ];
}
