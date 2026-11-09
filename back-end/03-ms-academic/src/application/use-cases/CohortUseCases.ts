import type { Cohort } from '../../domain/entities/Cohort';
import type { CohortDraft, ICohortRepository } from '../../domain/ports/out/ICohortRepository';
import type { AuditActor } from '../../domain/ports/out/ICrudRepository';
import type { CallerSchool } from '../access/CallerSchool';
import type { SchoolScopePolicy } from '../access/SchoolScopePolicy';
import { notFound, orNotFound } from '../errors';
import type { Listing } from '../Listing';

/** Cohorts have no school column: their school is their program's. */
export class CohortUseCases {
  constructor(private readonly cohorts: ICohortRepository, private readonly scope: SchoolScopePolicy) {}

  async create(caller: CallerSchool, draft: CohortDraft, audit?: AuditActor): Promise<Cohort> {
    await this.scope.requireOwnProgram(caller, draft.programId);
    return this.cohorts.create(draft, audit);
  }

  list(caller: CallerSchool): Listing<Cohort> {
    const school = this.scope.listedSchool(caller);
    if (school === null) return { list: (page) => this.cohorts.list(page), count: () => this.cohorts.count() };
    return { list: (page) => this.cohorts.findBySchool(school, page), count: () => this.cohorts.countBySchool(school) };
  }

  async listByProgram(caller: CallerSchool, programId: number): Promise<Listing<Cohort>> {
    await this.scope.requireOwnProgram(caller, programId);
    return {
      list: (page) => this.cohorts.findByProgram(programId, page),
      count: () => this.cohorts.countByProgram(programId),
    };
  }

  async get(caller: CallerSchool, id: number | null): Promise<Cohort> {
    const found = orNotFound(id ? await this.cohorts.findById(id) : null);
    await this.scope.requireVisibleProgram(caller, found.programId);
    return found;
  }

  async update(caller: CallerSchool, id: number, patch: Partial<CohortDraft>, audit?: AuditActor): Promise<Cohort> {
    await this.get(caller, id);
    if (patch.programId !== undefined) await this.scope.requireOwnProgram(caller, patch.programId);
    return orNotFound(await this.cohorts.update(id, patch, audit));
  }

  async delete(caller: CallerSchool, id: number | null, audit?: AuditActor): Promise<void> {
    const found = await this.get(caller, id);
    if (!(await this.cohorts.softDelete(found.cohortId, audit))) throw notFound();
  }
}
