/**
 * AUD-31: the soft delete must also switch off the activity flag (`status` /
 * `is_active`) on every `academic` table that has one (AGENTS.md §6.11), and the
 * school cascade must do the same on its children. Tables without the flag
 * (enrollment, academic_actor_type) keep the plain `deleted_at` stamp.
 */
import { PostgresAcademicActorRepository } from '../academic-actor.repository';
import { PostgresAcademicActorTypeRepository } from '../academic-actor-type.repository';
import { PostgresAcademicPeriodRepository } from '../academic-period.repository';
import { PostgresCohortRepository } from '../cohort.repository';
import { PostgresCourseRepository } from '../course.repository';
import { PostgresEnrollmentRepository } from '../enrollment.repository';
import { PostgresProgramRepository } from '../program.repository';
import { PostgresSchoolRepository } from '../school.repository';

jest.mock('../../../db/database', () => ({
  runQuery: jest.fn(),
  runCommand: jest.fn(),
  withTransaction: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const database = require('../../../db/database');
const mockRunCommand = database.runCommand as jest.Mock;
const mockWithTransaction = database.withTransaction as jest.Mock;
const ACTOR = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('soft delete turns off the activity flag (AUD-31)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRunCommand.mockResolvedValue(1);
  });

  const withFlag: Array<[string, () => { softDelete(id: number): Promise<boolean> }, string, string]> = [
    ['academic.school', () => new PostgresSchoolRepository(), 'school_id', 'status'],
    ['academic.program', () => new PostgresProgramRepository(), 'program_id', 'status'],
    ['academic.academic_period', () => new PostgresAcademicPeriodRepository(), 'academic_period_id', 'is_active'],
    ['academic.cohort', () => new PostgresCohortRepository(), 'cohort_id', 'status'],
    ['academic.course', () => new PostgresCourseRepository(), 'course_id', 'status'],
    ['academic.academic_actor', () => new PostgresAcademicActorRepository(), 'academic_actor_id', 'status'],
  ];

  it.each(withFlag)('%s: UPDATE sets deleted_at and %s=false', async (table, make, pk, flag) => {
    expect(await make().softDelete(7)).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith(
      `UPDATE ${table} SET deleted_at = NOW(), ${flag} = false WHERE ${pk} = $1 AND deleted_at IS NULL`,
      [7],
    );
  });

  it.each([
    ['academic.enrollment', () => new PostgresEnrollmentRepository(), 'enrollment_id'],
    ['academic.academic_actor_type', () => new PostgresAcademicActorTypeRepository(), 'actor_type_id'],
  ] as const)('%s has no flag: only deleted_at is stamped', async (table, make, pk) => {
    await (make() as unknown as { softDelete(id: number): Promise<boolean> }).softDelete(7);
    expect(mockRunCommand).toHaveBeenCalledWith(
      `UPDATE ${table} SET deleted_at = NOW() WHERE ${pk} = $1 AND deleted_at IS NULL`,
      [7],
    );
  });

  it.each(withFlag)('%s: softDelete records deleted_by when the caller is known', async (table, make, pk, flag) => {
    const repo = make() as unknown as {
      softDelete(id: number, audit?: { userId: string }): Promise<boolean>;
    };

    expect(await repo.softDelete(7, { userId: ACTOR })).toBe(true);
    expect(mockRunCommand).toHaveBeenCalledWith(
      `UPDATE ${table} SET deleted_at = NOW(), ${flag} = false, deleted_by = $2::uuid WHERE ${pk} = $1 AND deleted_at IS NULL`,
      [7, ACTOR],
    );
  });

  it('school cascade records deleted_by on every row it deletes', async () => {
    const query = jest.fn().mockResolvedValue({ rowCount: 1 });
    mockWithTransaction.mockImplementation(async (fn: (c: unknown) => unknown) => fn({ query }));

    expect(await new PostgresSchoolRepository().softDeleteCascade(3, { userId: ACTOR })).toBe(true);

    const updates = query.mock.calls.filter((c) => String(c[0]).startsWith('UPDATE academic.'));
    expect(updates).toHaveLength(7);
    for (const [sql, params] of updates) {
      expect(sql).toContain('deleted_by = $2::uuid');
      expect(params).toEqual([3, ACTOR]);
    }
  });

  it('school cascade also turns off status / is_active on the children it deletes', async () => {
    const query = jest.fn().mockResolvedValue({ rowCount: 1 });
    mockWithTransaction.mockImplementation(async (fn: (c: unknown) => unknown) => fn({ query }));

    expect(await new PostgresSchoolRepository().softDeleteCascade(3)).toBe(true);

    const sqls = query.mock.calls.map((c) => c[0] as string);
    const update = (table: string) => sqls.find((s) => s.startsWith(`UPDATE academic.${table} `)) ?? '';
    for (const t of ['cohort', 'course', 'program', 'academic_actor', 'school']) {
      expect(update(t)).toContain('SET deleted_at = NOW(), status = false');
    }
    expect(update('academic_period')).toContain('SET deleted_at = NOW(), is_active = false');
    expect(update('enrollment')).toContain('SET deleted_at = NOW() WHERE');
  });
});
