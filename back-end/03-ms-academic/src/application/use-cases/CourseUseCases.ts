import type { Course } from '../../domain/entities/Course';
import type { CourseDraft, ICourseRepository } from '../../domain/ports/out/ICourseRepository';
import type { AuditActor } from '../../domain/ports/out/ICrudRepository';
import type { CallerSchool } from '../access/CallerSchool';
import type { SchoolScopePolicy } from '../access/SchoolScopePolicy';
import { notFound, orNotFound } from '../errors';
import type { Listing } from '../Listing';

/**
 * Courses belong to a program, and through it to a school. Deleting one is
 * platform-level: only Super Administrador (frontend: canDeleteCourse).
 */
export class CourseUseCases {
  constructor(private readonly courses: ICourseRepository, private readonly scope: SchoolScopePolicy) {}

  /** `course.program_id` is a NOT NULL FK: a missing program answers 400 from the adapter. */
  async create(caller: CallerSchool, draft: CourseDraft, audit?: AuditActor): Promise<Course> {
    await this.scope.requireOwnProgram(caller, draft.programId);
    return this.courses.create(draft, audit);
  }

  list(caller: CallerSchool): Listing<Course> {
    const school = this.scope.listedSchool(caller);
    if (school === null) return { list: (page) => this.courses.list(page), count: () => this.courses.count() };
    return { list: (page) => this.courses.findBySchool(school, page), count: () => this.courses.countBySchool(school) };
  }

  async listByProgram(caller: CallerSchool, programId: number): Promise<Listing<Course>> {
    await this.scope.requireOwnProgram(caller, programId);
    return {
      list: (page) => this.courses.findByProgram(programId, page),
      count: () => this.courses.countByProgram(programId),
    };
  }

  async get(caller: CallerSchool, id: number | null): Promise<Course> {
    const found = orNotFound(id ? await this.courses.findById(id) : null);
    await this.scope.requireVisibleProgram(caller, found.programId);
    return found;
  }

  async update(caller: CallerSchool, id: number, patch: Partial<CourseDraft>, audit?: AuditActor): Promise<Course> {
    await this.get(caller, id);
    if (patch.programId !== undefined) await this.scope.requireOwnProgram(caller, patch.programId);
    return orNotFound(await this.courses.update(id, patch, audit));
  }

  async delete(caller: CallerSchool, id: number | null, audit?: AuditActor): Promise<void> {
    this.scope.requireSuperAdmin(caller, 'Only Super Administrador deletes courses');
    const found = orNotFound(id ? await this.courses.findById(id) : null);
    if (!(await this.courses.softDelete(found.courseId, audit))) throw notFound();
  }
}
