import type { AcademicPorts } from '../domain/ports/out/AcademicPorts';
import { SchoolScopePolicy } from './access/SchoolScopePolicy';
import { AcademicActorUseCases } from './use-cases/AcademicActorUseCases';
import { AcademicPeriodUseCases } from './use-cases/AcademicPeriodUseCases';
import { ActorTypeUseCases } from './use-cases/ActorTypeUseCases';
import { CohortUseCases } from './use-cases/CohortUseCases';
import { CourseUseCases } from './use-cases/CourseUseCases';
import { EnrollmentUseCases } from './use-cases/EnrollmentUseCases';
import { ProgramUseCases } from './use-cases/ProgramUseCases';
import { SchoolUseCases } from './use-cases/SchoolUseCases';

/** The use cases of every academic aggregate, sharing one school-scope policy. */
export interface AcademicUseCases {
  readonly schools: SchoolUseCases;
  readonly programs: ProgramUseCases;
  readonly periods: AcademicPeriodUseCases;
  readonly cohorts: CohortUseCases;
  readonly courses: CourseUseCases;
  readonly actorTypes: ActorTypeUseCases;
  readonly actors: AcademicActorUseCases;
  readonly enrollments: EnrollmentUseCases;
}

export function createAcademicUseCases(ports: AcademicPorts): AcademicUseCases {
  const scope = new SchoolScopePolicy(ports);
  return {
    schools: new SchoolUseCases(ports.schools, scope),
    programs: new ProgramUseCases(ports.programs, ports.schools, scope),
    periods: new AcademicPeriodUseCases(ports.periods, scope),
    cohorts: new CohortUseCases(ports.cohorts, scope),
    courses: new CourseUseCases(ports.courses, scope),
    actorTypes: new ActorTypeUseCases(ports.actorTypes, scope),
    actors: new AcademicActorUseCases(ports.actors, scope),
    enrollments: new EnrollmentUseCases(ports.enrollments, scope),
  };
}
