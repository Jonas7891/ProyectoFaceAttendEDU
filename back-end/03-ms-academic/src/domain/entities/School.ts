export interface School {
  schoolId: number;
  code: string;
  name: string;
  /**
   * `academic.school.city_id` is VARCHAR(100) NULL in PostgreSQL while the API
   * contract exposes it as a number; the adapter writes text and reads a number.
   */
  cityId: number | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
