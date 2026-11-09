export type BiometricType = 'FACIAL' | 'FINGERPRINT';
export type UpdateStatus = 'Pending' | 'In_Review' | 'Approved' | 'Rejected';

export interface BiometricUpdateCase {
  caseId: string;
  personId: string;
  biometricType: BiometricType;
  fingerNumber?: number | null;
  currentEmbeddingRef?: string | null;
  reason: string;
  updateStatus: UpdateStatus;
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Review state machine (AGENTS.md §4.6 / §6.10). Pending may be decided directly: web and mobile do so. */
const REVIEW_TRANSITIONS: Record<UpdateStatus, readonly UpdateStatus[]> = {
  Pending: ['In_Review', 'Approved', 'Rejected'],
  In_Review: ['Approved', 'Rejected'],
  Approved: [],
  Rejected: [],
};

/** Whether a case in `from` may move to `to`. */
export function canMoveTo(from: string, to: UpdateStatus): boolean {
  return (REVIEW_TRANSITIONS as Record<string, readonly UpdateStatus[]>)[from]?.includes(to) ?? false;
}

/**
 * chk_finger_number: 1..10 only with FINGERPRINT, NULL with FACIAL. Returns the finger the
 * case must store, or `undefined` when a FINGERPRINT case has none (the caller refuses it).
 */
export function fingerFor(type: BiometricType, fingerNumber: number | null | undefined): number | null | undefined {
  if (type === 'FACIAL') return null;
  return fingerNumber ? fingerNumber : undefined;
}

export const FINGER_REQUIRED = 'fingerNumber required for FINGERPRINT';

/** Fields a new case may take from its requester; the rest is owned by the server. */
export interface CaseRequest {
  personId: string;
  biometricType: BiometricType;
  fingerNumber?: number | null;
  currentEmbeddingRef?: string | null;
  reason: string;
}

/** A new case always starts Pending, stamped with who asked and when. */
export function openCase(caseId: string, request: CaseRequest, fingerNumber: number | null, requestedBy: string, now: Date) {
  return {
    caseId,
    personId: request.personId,
    biometricType: request.biometricType,
    fingerNumber,
    currentEmbeddingRef: request.currentEmbeddingRef ?? null,
    reason: request.reason,
    updateStatus: 'Pending' as UpdateStatus,
    requestedBy,
    requestedAt: now.toISOString(),
  };
}

/** The change a review makes: the new status, who decided and when. */
export function reviewCase(to: UpdateStatus, reviewer: string | null, notes: string | undefined, now: Date) {
  return {
    updateStatus: to,
    reviewedBy: reviewer,
    reviewedAt: now.toISOString(),
    ...(notes !== undefined ? { resolutionNotes: notes } : {}),
  };
}
