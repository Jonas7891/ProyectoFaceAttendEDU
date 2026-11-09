/**
 * The academic rules run without HTTP: the use cases take the caller's school and the ports.
 */
import { createAcademicUseCases, type AcademicUseCases } from '../AcademicUseCases';
import { ApplicationError } from '../errors';
import { periodDatesError } from '../../domain/entities/AcademicPeriod';
import { memoryRepositories, type MemoryRepositories } from '../../__tests__/support/memoryRepositories';

const SUPER = { isSuperAdmin: true, schoolId: null };
let repos: MemoryRepositories;
let useCases: AcademicUseCases;
let s1: number;
let s2: number;

beforeEach(async () => {
  repos = memoryRepositories();
  useCases = createAcademicUseCases(repos);
  s1 = (await repos.schools.create({ code: 'S1', name: 'Sede 1', cityId: 1, status: true } as any)).schoolId;
  s2 = (await repos.schools.create({ code: 'S2', name: 'Sede 2', cityId: 1, status: true } as any)).schoolId;
});

async function refusal(work: Promise<unknown>): Promise<ApplicationError> {
  const err = await work.then(() => null, (e) => e);
  expect(err).toBeInstanceOf(ApplicationError);
  return err as ApplicationError;
}

describe('school scope', () => {
  it('hides a row of another school (404) but refuses to write into one (403)', async () => {
    const admin1 = { isSuperAdmin: false, schoolId: s1 };
    const other = await repos.programs.create({ schoolId: s2, code: 'P2', name: 'x', status: true } as any);
    expect((await refusal(useCases.programs.get(admin1, other.programId))).statusCode).toBe(404);
    const denied = await refusal(useCases.programs.create(admin1, { schoolId: s2, code: 'P9', name: 'y', status: true }));
    expect(denied.statusCode).toBe(403);
    expect(denied.message).toBe('You can only manage your own school');
  });

  it('a caller without a school lists nothing', async () => {
    await repos.programs.create({ schoolId: s1, code: 'P1', name: 'x', status: true } as any);
    expect(await useCases.programs.list({ isSuperAdmin: false, schoolId: null }).list({})).toEqual([]);
    expect(await useCases.programs.list(SUPER).list({})).toHaveLength(1);
  });

  it('only Super Administrador deletes a course', async () => {
    const program = await repos.programs.create({ schoolId: s1, code: 'P1', name: 'x', status: true } as any);
    const course = await repos.courses.create({ programId: program.programId, code: 'C', name: 'c', creditHours: 3, status: true } as any);
    const denied = await refusal(useCases.courses.delete({ isSuperAdmin: false, schoolId: s1 }, course.courseId));
    expect(denied.statusCode).toBe(403);
    await useCases.courses.delete(SUPER, course.courseId);
    expect(await repos.courses.findById(course.courseId)).toBeNull();
  });
});

describe('academic period dates', () => {
  it('mirrors chk_period_dates', () => {
    expect(periodDatesError('2026-01-01', '2026-06-30')).toBeNull();
    expect(periodDatesError('2026-06-30', '2026-01-01')).toBe('startsOn must be before endsOn');
    expect(periodDatesError('2026-02-30', '2026-06-30')).toBe('startsOn and endsOn must be valid dates');
  });

  it('refuses the period before touching the repository', async () => {
    const create = jest.spyOn(repos.periods, 'create');
    const err = await refusal(useCases.periods.create(SUPER, { schoolId: s1, name: 'x', startsOn: '2026-06-01', endsOn: '2026-01-01', isActive: false }));
    expect(err.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});

describe('enrollment', () => {
  it('re-enrolling an unenrolled actor brings the old row back', async () => {
    const program = await repos.programs.create({ schoolId: s1, code: 'P1', name: 'x', status: true } as any);
    const period = await repos.periods.create({ schoolId: s1, name: 'I', startsOn: '2026-01-01', endsOn: '2026-06-30', isActive: true } as any);
    const cohort = await repos.cohorts.create({ programId: program.programId, academicPeriodId: period.academicPeriodId, code: 'C1', status: true } as any);
    const actor = await repos.actors.create({ personId: 'p', actorTypeId: 1, schoolId: s1, actorCode: 'E1', startedOn: '2026-01-01', status: true } as any);
    const draft = { academicActorId: actor.academicActorId, cohortId: cohort.cohortId, enrolledOn: '2026-01-10', enrollmentStatus: 'Active' as const };
    const admin1 = { isSuperAdmin: false, schoolId: s1 };

    const first = await useCases.enrollments.enroll(admin1, draft);
    await useCases.enrollments.delete(admin1, first.enrollmentId);
    const again = await useCases.enrollments.enroll(admin1, draft);
    expect(again.enrollmentId).toBe(first.enrollmentId);

    const denied = await refusal(useCases.enrollments.enroll({ isSuperAdmin: false, schoolId: s2 }, draft));
    expect(denied.statusCode).toBe(403);
  });
});
