import type { EnrollmentRecord } from '../../domain/entities/Enrollment';
import type { EnrollmentDraft, IEnrollmentRepository } from '../../domain/ports/out/IEnrollmentRepository';
import type { AuditActor } from '../../domain/ports/out/ICrudRepository';
import type { CallerSchool } from '../access/CallerSchool';
import type { SchoolScopePolicy } from '../access/SchoolScopePolicy';
import { notFound, orNotFound } from '../errors';
import type { Listing } from '../Listing';

/** Enrollment of an actor in a cohort: both must be of the caller's school. */
export class EnrollmentUseCases {
  constructor(private readonly enrollments: IEnrollmentRepository, private readonly scope: SchoolScopePolicy) {}

  /**
   * One enrollment per actor and cohort (uq_enrollment_actor_cohort counts deleted rows):
   * re-enrolling someone who was unenrolled brings their old row back.
   */
  async enroll(caller: CallerSchool, draft: EnrollmentDraft, audit?: AuditActor): Promise<EnrollmentRecord> {
    if (!caller.isSuperAdmin) {
      const [actorSchool, cohortSchool] = await Promise.all([
        this.scope.schoolOfActor(draft.academicActorId),
        this.scope.schoolOfCohort(draft.cohortId),
      ]);
      this.scope.requireOwn(caller, actorSchool);
      this.scope.requireOwn(caller, cohortSchool);
    }
    return this.enrollments.createOrRestore(draft, audit);
  }

  list(caller: CallerSchool): Listing<EnrollmentRecord> {
    const school = this.scope.listedSchool(caller);
    if (school === null) return { list: (page) => this.enrollments.list(page), count: () => this.enrollments.count() };
    return { list: (page) => this.enrollments.findBySchool(school, page), count: () => this.enrollments.countBySchool(school) };
  }

  async listByCohort(caller: CallerSchool, cohortId: number): Promise<Listing<EnrollmentRecord>> {
    await this.scope.requireOwnCohort(caller, cohortId);
    return {
      list: (page) => this.enrollments.findByCohort(cohortId, page),
      count: () => this.enrollments.countByCohort(cohortId),
    };
  }

  async listByActor(caller: CallerSchool, actorId: number): Promise<Listing<EnrollmentRecord>> {
    await this.scope.requireOwnActor(caller, actorId);
    return {
      list: (page) => this.enrollments.findByAcademicActor(actorId, page),
      count: () => this.enrollments.countByAcademicActor(actorId),
    };
  }

  async get(caller: CallerSchool, id: number | null): Promise<EnrollmentRecord> {
    const found = orNotFound(id ? await this.enrollments.findById(id) : null);
    await this.scope.requireVisibleActor(caller, found.academicActorId);
    return found;
  }

  async update(caller: CallerSchool, id: number, patch: Partial<EnrollmentDraft>, audit?: AuditActor): Promise<EnrollmentRecord> {
    await this.get(caller, id);
    if (patch.academicActorId !== undefined) await this.scope.requireOwnActor(caller, patch.academicActorId);
    if (patch.cohortId !== undefined) await this.scope.requireOwnCohort(caller, patch.cohortId);
    return orNotFound(await this.enrollments.update(id, patch, audit));
  }

  async delete(caller: CallerSchool, id: number | null, audit?: AuditActor): Promise<void> {
    const found = await this.get(caller, id);
    if (!(await this.enrollments.softDelete(found.enrollmentId, audit))) throw notFound();
  }
}
