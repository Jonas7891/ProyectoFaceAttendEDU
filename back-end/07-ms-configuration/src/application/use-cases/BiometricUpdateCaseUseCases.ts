import { randomUUID } from 'node:crypto';
import {
  canMoveTo,
  fingerFor,
  FINGER_REQUIRED,
  openCase,
  reviewCase,
  type BiometricType,
  type BiometricUpdateCase,
  type CaseRequest,
  type UpdateStatus,
} from '../../domain/entities/BiometricUpdateCase';
import type { IBiometricUpdateCaseRepository } from '../../domain/ports/out/IBiometricUpdateCaseRepository';
import { caseScopeAllows, caseScopeQuery, type CaseScope } from '../access/CaseScope';
import { badRequest, conflict, forbidden, notFound, orNotFound } from '../errors';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A query the use case allows; the route decides whether to page it. */
export interface Listing<T> {
  list(page: { limit?: number; offset?: number }): Promise<T[]>;
  count(): Promise<number>;
}

export interface CaseEdit {
  personId?: string;
  biometricType?: BiometricType;
  fingerNumber?: number | null;
  currentEmbeddingRef?: string | null;
  reason?: string;
}

export interface CaseDecision {
  updateStatus: UpdateStatus;
  resolutionNotes?: string;
}

/**
 * Biometric update cases (AGENTS.md §6.10). A case is requested for someone in the caller's
 * reach, starts Pending, and only the review moves it through the state machine; nobody
 * reviews their own request (RN-29). A case outside the caller's reach looks missing.
 */
export class BiometricUpdateCaseUseCases {
  constructor(
    private readonly cases: IBiometricUpdateCaseRepository,
    private readonly now: () => Date = () => new Date(),
    private readonly newId: () => string = randomUUID,
  ) {}

  /** `requestedBy` is always the session user; a body value is ignored (RN-29). */
  async request(scope: CaseScope, request: CaseRequest, requestedBy: string | undefined): Promise<BiometricUpdateCase> {
    if (!caseScopeAllows(scope, request.personId)) {
      throw forbidden('You can only request an update for your own biometric data');
    }
    const finger = fingerFor(request.biometricType, request.fingerNumber);
    if (finger === undefined) throw badRequest(FINGER_REQUIRED);
    if (!requestedBy || !UUID_RE.test(requestedBy)) throw badRequest('requestedBy is required');
    return this.cases.create(openCase(this.newId(), request, finger, requestedBy, this.now()));
  }

  list(scope: CaseScope, status?: string): Listing<BiometricUpdateCase> {
    const query = { status, ...caseScopeQuery(scope) };
    return { list: (page) => this.cases.search({ ...query, ...page }), count: () => this.cases.countMatching(query) };
  }

  async listOfPerson(scope: CaseScope, personId: string): Promise<Listing<BiometricUpdateCase>> {
    if (!caseScopeAllows(scope, personId)) throw forbidden('You can only list your own cases');
    return {
      list: (page) => this.cases.search({ personId, ...page }),
      count: () => this.cases.countMatching({ personId }),
    };
  }

  async get(scope: CaseScope, caseId: string): Promise<BiometricUpdateCase> {
    const found = orNotFound(UUID_RE.test(caseId) ? await this.cases.findById(caseId) : null);
    if (!caseScopeAllows(scope, found.personId)) throw notFound();
    return found;
  }

  /** Edits the request itself; status, requester and reviewer change only through `review`. */
  async edit(scope: CaseScope, caseId: string, edit: CaseEdit): Promise<BiometricUpdateCase> {
    const found = await this.get(scope, caseId);
    // Reassigning a case needs the same reach over the NEW person as creating one does.
    if (edit.personId !== undefined && edit.personId !== found.personId && !caseScopeAllows(scope, edit.personId)) {
      throw forbidden('You cannot reassign a case to a person outside your scope');
    }
    // chk_finger_number on the merged result.
    const type = edit.biometricType ?? found.biometricType;
    const finger = fingerFor(type, 'fingerNumber' in edit ? edit.fingerNumber : found.fingerNumber);
    if (finger === undefined) throw badRequest(FINGER_REQUIRED);
    const patch = { ...edit, ...(type === 'FACIAL' ? { fingerNumber: null } : {}) };
    return orNotFound(await this.cases.update(caseId, patch));
  }

  /** The reviewer is the session user; the move must be allowed by the state machine. */
  async review(scope: CaseScope, caseId: string, reviewer: string | undefined, decision: CaseDecision): Promise<BiometricUpdateCase> {
    const found = await this.get(scope, caseId);
    if (reviewer && found.requestedBy === reviewer) throw forbidden('You cannot review your own request');
    if (!canMoveTo(found.updateStatus, decision.updateStatus)) {
      throw conflict(`A case in ${found.updateStatus} cannot move to ${decision.updateStatus}`);
    }
    const change = reviewCase(decision.updateStatus, reviewer ?? null, decision.resolutionNotes, this.now());
    return orNotFound(await this.cases.update(caseId, change));
  }

  async delete(scope: CaseScope, caseId: string): Promise<void> {
    await this.get(scope, caseId);
    if (!(await this.cases.softDelete(caseId))) throw notFound();
  }
}
