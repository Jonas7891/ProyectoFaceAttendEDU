export type ActorType = 'STUDENT' | 'INSTRUCTOR';
export class AcademicActor {
  constructor(public readonly academicActorId: number, public readonly personId: string, public readonly actorType: ActorType, public readonly schoolId: number) {}
  static create(personId: string, actorType: ActorType, schoolId: number) { return new AcademicActor(0, personId, actorType, schoolId); }
}
