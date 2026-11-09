import type { School } from '../../domain/entities/School';
import type { AuditActor } from '../../domain/ports/out/ICrudRepository';
import type { ISchoolRepository, SchoolDraft } from '../../domain/ports/out/ISchoolRepository';
import type { CallerSchool } from '../access/CallerSchool';
import type { SchoolScopePolicy } from '../access/SchoolScopePolicy';
import { ownSchoolEdit, type SchoolPatch } from '../access/schoolEditPolicy';
import { forbidden, notFound } from '../errors';
import { listingOf, type Listing } from '../Listing';

const ONLY_SUPER = 'Only Super Administrador manages schools';

/**
 * Creating, activating or deleting a school is platform-level (Super Administrador); a
 * school Administrador sees and edits only its own school's name and contact data.
 */
export class SchoolUseCases {
  constructor(private readonly schools: ISchoolRepository, private readonly scope: SchoolScopePolicy) {}

  async create(caller: CallerSchool, draft: SchoolDraft, audit?: AuditActor): Promise<School> {
    this.scope.requireSuperAdmin(caller, ONLY_SUPER);
    return this.schools.create(draft, audit);
  }

  /** Super Administrador lists them all; anyone else only its own school. */
  async list(caller: CallerSchool): Promise<Listing<School>> {
    if (caller.isSuperAdmin) return { list: (page) => this.schools.list(page), count: () => this.schools.count() };
    const own = caller.schoolId != null ? await this.schools.findById(caller.schoolId) : null;
    return listingOf(own ? [own] : []);
  }

  async get(caller: CallerSchool, id: number | null): Promise<School> {
    const found = id ? await this.schools.findById(id) : null;
    if (!found) throw notFound();
    this.scope.requireVisible(caller, found.schoolId);
    return found;
  }

  async update(caller: CallerSchool, id: number, patch: SchoolPatch, audit?: AuditActor): Promise<School> {
    let changes: Record<string, unknown> = patch;
    if (!caller.isSuperAdmin) {
      if (id !== caller.schoolId) throw notFound();
      const current = await this.schools.findById(id);
      if (!current) throw notFound();
      const edit = ownSchoolEdit(current, patch);
      if (!edit.allowed) throw forbidden(edit.reason);
      changes = edit.changes;
    }
    const updated = await this.schools.update(id, changes as Partial<SchoolDraft>, audit);
    if (!updated) throw notFound();
    return updated;
  }

  async setStatus(caller: CallerSchool, id: number, status: boolean, audit?: AuditActor): Promise<School> {
    this.scope.requireSuperAdmin(caller, ONLY_SUPER);
    const updated = await this.schools.update(id, { status }, audit);
    if (!updated) throw notFound();
    return updated;
  }

  /** Soft-deletes the school and everything under it. */
  async delete(caller: CallerSchool, id: number | null, audit?: AuditActor): Promise<void> {
    this.scope.requireSuperAdmin(caller, ONLY_SUPER);
    if (!id || !(await this.schools.softDeleteCascade(id, audit))) throw notFound();
  }
}
