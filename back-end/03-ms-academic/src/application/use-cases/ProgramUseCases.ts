import type { Program } from '../../domain/entities/Program';
import type { AuditActor } from '../../domain/ports/out/ICrudRepository';
import type { IProgramRepository, ProgramDraft } from '../../domain/ports/out/IProgramRepository';
import type { ISchoolRepository } from '../../domain/ports/out/ISchoolRepository';
import type { CallerSchool } from '../access/CallerSchool';
import type { SchoolScopePolicy } from '../access/SchoolScopePolicy';
import { notFound, orNotFound, schoolNotFound } from '../errors';
import type { Listing } from '../Listing';

/** Programs belong to a school; an Administrador works only inside its own. */
export class ProgramUseCases {
  constructor(
    private readonly programs: IProgramRepository,
    private readonly schools: ISchoolRepository,
    private readonly scope: SchoolScopePolicy,
  ) {}

  async create(caller: CallerSchool, draft: ProgramDraft, audit?: AuditActor): Promise<Program> {
    if (!(await this.schools.existsById(draft.schoolId))) throw schoolNotFound();
    this.scope.requireOwn(caller, draft.schoolId);
    return this.programs.create(draft, audit);
  }

  list(caller: CallerSchool): Listing<Program> {
    const school = this.scope.listedSchool(caller);
    if (school === null) return { list: (page) => this.programs.list(page), count: () => this.programs.count() };
    return this.ofSchoolUnchecked(school);
  }

  listBySchool(caller: CallerSchool, schoolId: number): Listing<Program> {
    this.scope.requireOwn(caller, schoolId);
    return this.ofSchoolUnchecked(schoolId);
  }

  async get(caller: CallerSchool, id: number | null): Promise<Program> {
    const found = id ? await this.programs.findById(id) : null;
    if (!found) throw notFound();
    this.scope.requireVisible(caller, found.schoolId);
    return found;
  }

  async update(caller: CallerSchool, id: number, patch: Partial<ProgramDraft>, audit?: AuditActor): Promise<Program> {
    const found = await this.get(caller, id);
    if (patch.schoolId !== undefined) this.scope.requireOwn(caller, patch.schoolId);
    return orNotFound(await this.programs.update(found.programId, patch, audit));
  }

  async delete(caller: CallerSchool, id: number | null, audit?: AuditActor): Promise<void> {
    const found = await this.get(caller, id);
    if (!(await this.programs.softDelete(found.programId, audit))) throw notFound();
  }

  private ofSchoolUnchecked(schoolId: number): Listing<Program> {
    return {
      list: (page) => this.programs.findBySchool(schoolId, page),
      count: () => this.programs.countBySchool(schoolId),
    };
  }
}
