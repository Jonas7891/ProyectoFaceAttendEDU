import type { AcademicActorType } from '../../entities/AcademicActorType';
import type { ICrudRepository, Draft } from './ICrudRepository';

export type AcademicActorTypeDraft = Draft<AcademicActorType, 'actorTypeId'>;

/**
 * `academic.academic_actor_type` — catálogo STUDENT / INSTRUCTOR.
 * Liquibase seeds rows 1=STUDENT and 2=INSTRUCTOR; the service must not re-seed.
 */
export interface IAcademicActorTypeRepository
  extends ICrudRepository<AcademicActorType, number, AcademicActorTypeDraft> {}
