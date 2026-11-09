import type { BiometricUpdateCase } from '../../entities/BiometricUpdateCase';

/** Which cases a query may return: by status, and one person or a set of persons. */
export interface CaseQuery {
  status?: string;
  personId?: string;
  personIds?: readonly string[];
}

/** `configuration.biometric_update_case` (logical owner Biometric, hosted in this schema). */
export interface IBiometricUpdateCaseRepository {
  findById(caseId: string): Promise<BiometricUpdateCase | null>;
  create(draft: Record<string, unknown>): Promise<BiometricUpdateCase>;
  update(caseId: string, patch: Record<string, unknown>): Promise<BiometricUpdateCase | null>;
  softDelete(caseId: string): Promise<boolean>;
  search(query: CaseQuery & { limit?: number; offset?: number }): Promise<BiometricUpdateCase[]>;
  countMatching(query: CaseQuery): Promise<number>;
}
