import type { AcademicActorType } from '../../domain/entities/AcademicActorType';
import type { AcademicActorTypeDraft, IAcademicActorTypeRepository } from '../../domain/ports/out/IAcademicActorTypeRepository';
import type { AuditActor } from '../../domain/ports/out/ICrudRepository';
import type { CallerSchool } from '../access/CallerSchool';
import type { SchoolScopePolicy } from '../access/SchoolScopePolicy';
import { notFound, orNotFound } from '../errors';
import type { Listing } from '../Listing';

const ONLY_SUPER = 'Only Super Administrador manages the actor-type catalogue';

/** A platform-wide catalogue (no school column): anyone reads it, only Super Administrador writes it. */
export class ActorTypeUseCases {
  constructor(private readonly types: IAcademicActorTypeRepository, private readonly scope: SchoolScopePolicy) {}

  /**
   * A retired code still holds the UNIQUE, so creating it again would answer 409 forever:
   * a deleted type with that code is brought back instead.
   */
  async create(caller: CallerSchool, draft: AcademicActorTypeDraft, audit?: AuditActor): Promise<AcademicActorType> {
    this.scope.requireSuperAdmin(caller, ONLY_SUPER);
    const revived = await this.types.restoreByCode(draft.code, draft.name, audit);
    return revived ?? this.types.create(draft, audit);
  }

  list(): Listing<AcademicActorType> {
    return { list: (page) => this.types.list(page), count: () => this.types.count() };
  }

  async get(id: number | null): Promise<AcademicActorType> {
    return orNotFound(id ? await this.types.findById(id) : null);
  }

  async update(caller: CallerSchool, id: number, patch: Partial<AcademicActorTypeDraft>, audit?: AuditActor): Promise<AcademicActorType> {
    this.scope.requireSuperAdmin(caller, ONLY_SUPER);
    return orNotFound(await this.types.update(id, patch, audit));
  }

  async delete(caller: CallerSchool, id: number | null, audit?: AuditActor): Promise<void> {
    this.scope.requireSuperAdmin(caller, ONLY_SUPER);
    if (!id || !(await this.types.softDelete(id, audit))) throw notFound();
  }
}
