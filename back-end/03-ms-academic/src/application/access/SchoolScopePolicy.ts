import type { AcademicPorts } from '../../domain/ports/out/AcademicPorts';
import type { CallerSchool } from './CallerSchool';
import { forbidden, notFound } from '../errors';

/**
 * School isolation. Every role resolves its own school and reads/writes stay inside it;
 * Super Administrador (no school of its own) is the only unrestricted caller.
 *
 * Two answers on purpose: a row of another school is hidden (404), while asking to put
 * something in another school is refused (403).
 */
export class SchoolScopePolicy {
  constructor(private readonly ports: Pick<AcademicPorts, 'programs' | 'cohorts' | 'actors'>) {}

  /** The school a non-super caller lists; -1 matches nothing for a caller without one. */
  listedSchool(caller: CallerSchool): number | null {
    return caller.isSuperAdmin ? null : caller.schoolId ?? -1;
  }

  /** Hides a row that belongs to another school. */
  requireVisible(caller: CallerSchool, schoolId: number | null): void {
    if (!caller.isSuperAdmin && schoolId !== caller.schoolId) throw notFound();
  }

  /** Refuses to act on another school. */
  requireOwn(caller: CallerSchool, schoolId: number | null): void {
    if (!caller.isSuperAdmin && schoolId !== caller.schoolId) throw forbidden('You can only manage your own school');
  }

  requireSuperAdmin(caller: CallerSchool, message: string): void {
    if (!caller.isSuperAdmin) throw forbidden(message);
  }

  /** 404 unless the program is of the caller's school (no lookup for Super Administrador). */
  async requireVisibleProgram(caller: CallerSchool, programId: number): Promise<void> {
    if (!caller.isSuperAdmin) this.requireVisible(caller, await this.schoolOfProgram(programId));
  }

  /** 403 unless the program is of the caller's school. */
  async requireOwnProgram(caller: CallerSchool, programId: number): Promise<void> {
    if (!caller.isSuperAdmin) this.requireOwn(caller, await this.schoolOfProgram(programId));
  }

  async requireOwnCohort(caller: CallerSchool, cohortId: number): Promise<void> {
    if (!caller.isSuperAdmin) this.requireOwn(caller, await this.schoolOfCohort(cohortId));
  }

  async requireVisibleActor(caller: CallerSchool, actorId: number): Promise<void> {
    if (!caller.isSuperAdmin) this.requireVisible(caller, await this.schoolOfActor(actorId));
  }

  async requireOwnActor(caller: CallerSchool, actorId: number): Promise<void> {
    if (!caller.isSuperAdmin) this.requireOwn(caller, await this.schoolOfActor(actorId));
  }

  /** Programs carry their school directly. */
  async schoolOfProgram(programId: number | null | undefined): Promise<number | null> {
    if (programId == null) return null;
    return (await this.ports.programs.findById(programId))?.schoolId ?? null;
  }

  /** Cohorts carry programId, programs carry schoolId. */
  async schoolOfCohort(cohortId: number | null | undefined): Promise<number | null> {
    if (cohortId == null) return null;
    return this.schoolOfProgram((await this.ports.cohorts.findById(cohortId))?.programId);
  }

  /** Academic actors carry their school directly. */
  async schoolOfActor(actorId: number | null | undefined): Promise<number | null> {
    if (actorId == null) return null;
    return (await this.ports.actors.findById(actorId))?.schoolId ?? null;
  }
}
