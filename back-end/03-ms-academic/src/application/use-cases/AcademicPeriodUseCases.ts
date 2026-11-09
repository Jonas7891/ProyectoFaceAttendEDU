import { periodDatesError, type AcademicPeriod } from '../../domain/entities/AcademicPeriod';
import type { AcademicPeriodDraft, IAcademicPeriodRepository } from '../../domain/ports/out/IAcademicPeriodRepository';
import type { AuditActor } from '../../domain/ports/out/ICrudRepository';
import type { CallerSchool } from '../access/CallerSchool';
import type { SchoolScopePolicy } from '../access/SchoolScopePolicy';
import { badRequest, notFound, orNotFound } from '../errors';
import type { Listing } from '../Listing';

/** Academic periods of a school; the dates must be real and in order (chk_period_dates). */
export class AcademicPeriodUseCases {
  constructor(private readonly periods: IAcademicPeriodRepository, private readonly scope: SchoolScopePolicy) {}

  /** `academic_period.school_id` is a real FK: a missing school answers 400 from the adapter. */
  async create(caller: CallerSchool, draft: AcademicPeriodDraft, audit?: AuditActor): Promise<AcademicPeriod> {
    requireDates(draft.startsOn, draft.endsOn);
    this.scope.requireOwn(caller, draft.schoolId);
    return this.periods.create(draft, audit);
  }

  list(caller: CallerSchool): Listing<AcademicPeriod> {
    const school = this.scope.listedSchool(caller);
    if (school === null) return { list: (page) => this.periods.list(page), count: () => this.periods.count() };
    return this.ofSchoolUnchecked(school);
  }

  listBySchool(caller: CallerSchool, schoolId: number): Listing<AcademicPeriod> {
    this.scope.requireOwn(caller, schoolId);
    return this.ofSchoolUnchecked(schoolId);
  }

  async get(caller: CallerSchool, id: number | null): Promise<AcademicPeriod> {
    const found = await this.find(id);
    this.scope.requireVisible(caller, found.schoolId);
    return found;
  }

  async update(caller: CallerSchool, id: number, patch: Partial<AcademicPeriodDraft>, audit?: AuditActor): Promise<AcademicPeriod> {
    const found = await this.find(id);
    if (patch.startsOn !== undefined || patch.endsOn !== undefined) {
      requireDates(patch.startsOn ?? found.startsOn, patch.endsOn ?? found.endsOn);
    }
    this.scope.requireVisible(caller, found.schoolId);
    if (patch.schoolId !== undefined) this.scope.requireOwn(caller, patch.schoolId);
    return orNotFound(await this.periods.update(id, patch, audit));
  }

  async delete(caller: CallerSchool, id: number | null, audit?: AuditActor): Promise<void> {
    const found = await this.get(caller, id);
    if (!(await this.periods.softDelete(found.academicPeriodId, audit))) throw notFound();
  }

  private async find(id: number | null): Promise<AcademicPeriod> {
    return orNotFound(id ? await this.periods.findById(id) : null);
  }

  private ofSchoolUnchecked(schoolId: number): Listing<AcademicPeriod> {
    return {
      list: (page) => this.periods.findBySchool(schoolId, page),
      count: () => this.periods.countBySchool(schoolId),
    };
  }
}

function requireDates(startsOn: unknown, endsOn: unknown): void {
  const error = periodDatesError(startsOn, endsOn);
  if (error) throw badRequest(error);
}
