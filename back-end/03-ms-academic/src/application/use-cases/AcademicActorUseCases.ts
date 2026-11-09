import type { AcademicActorRecord } from '../../domain/entities/AcademicActor';
import type { AcademicActorDraft, IAcademicActorRepository } from '../../domain/ports/out/IAcademicActorRepository';
import type { AuditActor } from '../../domain/ports/out/ICrudRepository';
import type { CallerSchool } from '../access/CallerSchool';
import type { SchoolScopePolicy } from '../access/SchoolScopePolicy';
import { notFound, orNotFound } from '../errors';
import { listingOf, type Listing } from '../Listing';

/** Students and instructors of a school; an Administrador manages only its own school's. */
export class AcademicActorUseCases {
  constructor(private readonly actors: IAcademicActorRepository, private readonly scope: SchoolScopePolicy) {}

  async create(caller: CallerSchool, draft: AcademicActorDraft, audit?: AuditActor): Promise<AcademicActorRecord> {
    this.scope.requireOwn(caller, draft.schoolId);
    return this.actors.create(draft, audit);
  }

  list(caller: CallerSchool): Listing<AcademicActorRecord> {
    const school = this.scope.listedSchool(caller);
    if (school === null) return { list: (page) => this.actors.list(page), count: () => this.actors.count() };
    return this.ofSchoolUnchecked(school);
  }

  /** Which school a person acts in (the caller's own or a third party's), inside the caller's scope. */
  async listByPerson(caller: CallerSchool, personId: string): Promise<Listing<AcademicActorRecord>> {
    const all = await this.actors.findByPerson(personId);
    return listingOf(caller.isSuperAdmin ? all : all.filter((a) => a.schoolId === caller.schoolId));
  }

  listBySchool(caller: CallerSchool, schoolId: number): Listing<AcademicActorRecord> {
    this.scope.requireOwn(caller, schoolId);
    return this.ofSchoolUnchecked(schoolId);
  }

  async get(caller: CallerSchool, id: number | null): Promise<AcademicActorRecord> {
    const found = orNotFound(id ? await this.actors.findById(id) : null);
    this.scope.requireVisible(caller, found.schoolId);
    return found;
  }

  async update(caller: CallerSchool, id: number, patch: Partial<AcademicActorDraft>, audit?: AuditActor): Promise<AcademicActorRecord> {
    await this.get(caller, id);
    if (patch.schoolId !== undefined) this.scope.requireOwn(caller, patch.schoolId);
    return orNotFound(await this.actors.update(id, patch, audit));
  }

  async delete(caller: CallerSchool, id: number | null, audit?: AuditActor): Promise<void> {
    const found = await this.get(caller, id);
    if (!(await this.actors.softDelete(found.academicActorId, audit))) throw notFound();
  }

  private ofSchoolUnchecked(schoolId: number): Listing<AcademicActorRecord> {
    return {
      list: (page) => this.actors.findBySchool(schoolId, page),
      count: () => this.actors.countBySchool(schoolId),
    };
  }
}
