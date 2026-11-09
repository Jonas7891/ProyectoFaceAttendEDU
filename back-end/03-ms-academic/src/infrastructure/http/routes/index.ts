import type { FastifyInstance } from 'fastify';
import { createAcademicUseCases } from '../../../application/AcademicUseCases';
import type { AcademicPorts } from '../../../domain/ports/out/AcademicPorts';
import { createCallerSchoolResolver } from '../callerSchool';
import { registerActorRoutes, registerActorTypeRoutes } from './actors';
import { registerCohortRoutes } from './cohorts';
import { registerCourseRoutes } from './courses';
import { registerEnrollmentRoutes } from './enrollments';
import { registerPeriodRoutes } from './periods';
import { registerProgramRoutes } from './programs';
import { registerSchoolRoutes } from './schools';
import type { RouteContext } from './support';

/**
 * HTTP adapters — 03-ms-academic. The routes only translate HTTP: they parse the request,
 * resolve who is calling and hand both to a use case, where the school-isolation and
 * business rules live (`application/`).
 *
 * Error contract: a refused rule answers with its own status (see `handle`); repositories
 * throw `RepositoryError`s (409 unique violation, 400 dangling FK / bad value, 503 database
 * down) that `main.ts`'s Fastify error handler renders, so no database error leaks as a 500.
 */
export async function registerAcademicRoutes(app: FastifyInstance, ports: AcademicPorts) {
  const resolveCallerSchool = createCallerSchoolResolver(ports);
  const ctx: RouteContext = {
    app,
    useCases: createAcademicUseCases(ports),
    callerOf: (req) => resolveCallerSchool(req as any),
  };
  registerSchoolRoutes(ctx);
  registerProgramRoutes(ctx);
  registerPeriodRoutes(ctx);
  registerCohortRoutes(ctx);
  registerCourseRoutes(ctx);
  registerActorTypeRoutes(ctx);
  registerActorRoutes(ctx);
  registerEnrollmentRoutes(ctx);
}
