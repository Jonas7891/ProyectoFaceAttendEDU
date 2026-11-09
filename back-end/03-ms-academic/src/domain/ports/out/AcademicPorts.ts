import type { ISchoolRepository } from './ISchoolRepository';
import type { IProgramRepository } from './IProgramRepository';
import type { IAcademicPeriodRepository } from './IAcademicPeriodRepository';
import type { ICohortRepository } from './ICohortRepository';
import type { ICourseRepository } from './ICourseRepository';
import type { IAcademicActorTypeRepository } from './IAcademicActorTypeRepository';
import type { IAcademicActorRepository } from './IAcademicActorRepository';
import type { IEnrollmentRepository } from './IEnrollmentRepository';

/** Every persistence port of the academic context; the use cases depend on this, never on an adapter. */
export interface AcademicPorts {
  readonly schools: ISchoolRepository;
  readonly programs: IProgramRepository;
  readonly periods: IAcademicPeriodRepository;
  readonly cohorts: ICohortRepository;
  readonly courses: ICourseRepository;
  readonly actorTypes: IAcademicActorTypeRepository;
  readonly actors: IAcademicActorRepository;
  readonly enrollments: IEnrollmentRepository;
}
