/**
 * Repository composition root — 03-ms-academic.
 *
 * `main.ts` builds this bundle once at boot (after `connectDatabase()`) and hands
 * it to `registerAcademicRoutes`. The HTTP layer depends only on the domain ports
 * in `domain/ports/out`, never on `pg` or on SQL.
 */

import type { AcademicPorts } from '../../../domain/ports/out/AcademicPorts';

import { PostgresSchoolRepository } from './school.repository';
import { PostgresProgramRepository } from './program.repository';
import { PostgresAcademicPeriodRepository } from './academic-period.repository';
import { PostgresCohortRepository } from './cohort.repository';
import { PostgresCourseRepository } from './course.repository';
import { PostgresAcademicActorTypeRepository } from './academic-actor-type.repository';
import { PostgresAcademicActorRepository } from './academic-actor.repository';
import { PostgresEnrollmentRepository } from './enrollment.repository';

/** The PostgreSQL bundle implements every academic port. */
export type AcademicRepositories = AcademicPorts;

/** Instantiates the PostgreSQL adapter for every academic aggregate. */
export function createAcademicRepositories(): AcademicRepositories {
  return {
    schools: new PostgresSchoolRepository(),
    programs: new PostgresProgramRepository(),
    periods: new PostgresAcademicPeriodRepository(),
    cohorts: new PostgresCohortRepository(),
    courses: new PostgresCourseRepository(),
    actorTypes: new PostgresAcademicActorTypeRepository(),
    actors: new PostgresAcademicActorRepository(),
    enrollments: new PostgresEnrollmentRepository(),
  };
}

export {
  PostgresSchoolRepository,
  PostgresProgramRepository,
  PostgresAcademicPeriodRepository,
  PostgresCohortRepository,
  PostgresCourseRepository,
  PostgresAcademicActorTypeRepository,
  PostgresAcademicActorRepository,
  PostgresEnrollmentRepository,
};
