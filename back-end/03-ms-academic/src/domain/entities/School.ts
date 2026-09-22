export interface School {
  schoolId: number;
  code: string;
  name: string;
  cityId: number;
  address?: string;
  phone?: string;
  email?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
