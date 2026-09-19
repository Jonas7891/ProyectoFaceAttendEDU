import { Enrollment } from '../../entities/Enrollment';
export interface IEnrollmentRepository { save(e: Enrollment): Promise<void>; findById(id: number): Promise<Enrollment | null>; }
