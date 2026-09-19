export class Enrollment {
  constructor(public readonly enrollmentId: number, public readonly academicActorId: number, public readonly cohortId: number, public status: string = 'Active') {}
  static create(academicActorId: number, cohortId: number) { return new Enrollment(0, academicActorId, cohortId); }
}
