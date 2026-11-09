/**
 * The biometric update case rules (AGENTS.md §6.10) run without HTTP.
 */
import { canMoveTo, fingerFor } from '../../domain/entities/BiometricUpdateCase';
import { BiometricUpdateCaseUseCases } from '../use-cases/BiometricUpdateCaseUseCases';
import { ApplicationError } from '../errors';
import { memoryRepositories } from '../../__tests__/support/memoryRepositories';

const PERSON = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const REQUESTER = '33333333-3333-4333-8333-333333333333';
const REVIEWER = '44444444-4444-4444-8444-444444444444';
const ALL = { all: true } as const;
const NOW = new Date('2026-11-08T10:00:00Z');

let ids = 0;
function useCases() {
  const repos = memoryRepositories();
  const cases = new BiometricUpdateCaseUseCases(repos.cases as any, () => NOW, () => `aaaaaaaa-aaaa-4aaa-8aaa-${String(++ids).padStart(12, '0')}`);
  return { repos, cases };
}

async function refusal(work: Promise<unknown>): Promise<ApplicationError> {
  const err = await work.then(() => null, (e) => e);
  expect(err).toBeInstanceOf(ApplicationError);
  return err as ApplicationError;
}

describe('domain rules', () => {
  it('chk_finger_number: a finger only with FINGERPRINT, none with FACIAL', () => {
    expect(fingerFor('FACIAL', 3)).toBeNull();
    expect(fingerFor('FINGERPRINT', 3)).toBe(3);
    expect(fingerFor('FINGERPRINT', null)).toBeUndefined();
  });

  it('the review state machine only moves forward', () => {
    expect(canMoveTo('Pending', 'Approved')).toBe(true);
    expect(canMoveTo('In_Review', 'Rejected')).toBe(true);
    expect(canMoveTo('In_Review', 'In_Review')).toBe(false);
    expect(canMoveTo('Approved', 'Rejected')).toBe(false);
    expect(canMoveTo('Unknown', 'Approved')).toBe(false);
  });
});

describe('request', () => {
  it('opens a Pending case stamped with the session user, and drops the finger of a facial case', async () => {
    const { cases } = useCases();
    const created = await cases.request(ALL, { personId: PERSON, biometricType: 'FACIAL', fingerNumber: 4, reason: 'x' }, REQUESTER);
    expect(created).toMatchObject({ updateStatus: 'Pending', requestedBy: REQUESTER, requestedAt: NOW.toISOString(), fingerNumber: null });
  });

  it('refuses a fingerprint without finger, a person out of reach and a missing requester', async () => {
    const { cases } = useCases();
    expect((await refusal(cases.request(ALL, { personId: PERSON, biometricType: 'FINGERPRINT', reason: 'x' }, REQUESTER))).statusCode).toBe(400);
    const own = { all: false, personId: PERSON } as const;
    expect((await refusal(cases.request(own, { personId: OTHER, biometricType: 'FACIAL', reason: 'x' }, REQUESTER))).statusCode).toBe(403);
    expect((await refusal(cases.request(ALL, { personId: PERSON, biometricType: 'FACIAL', reason: 'x' }, undefined))).message).toBe('requestedBy is required');
  });
});

describe('review', () => {
  it('records who decided and when; a decided case cannot move again', async () => {
    const { cases } = useCases();
    const created = await cases.request(ALL, { personId: PERSON, biometricType: 'FACIAL', reason: 'x' }, REQUESTER);
    const approved = await cases.review(ALL, created.caseId, REVIEWER, { updateStatus: 'Approved', resolutionNotes: 'ok' });
    expect(approved).toMatchObject({ updateStatus: 'Approved', reviewedBy: REVIEWER, reviewedAt: NOW.toISOString(), resolutionNotes: 'ok' });
    expect((await refusal(cases.review(ALL, created.caseId, REVIEWER, { updateStatus: 'Rejected' }))).statusCode).toBe(409);
  });

  it('nobody reviews their own request, and a case out of reach looks missing', async () => {
    const { cases } = useCases();
    const created = await cases.request(ALL, { personId: PERSON, biometricType: 'FACIAL', reason: 'x' }, REQUESTER);
    expect((await refusal(cases.review(ALL, created.caseId, REQUESTER, { updateStatus: 'Approved' }))).statusCode).toBe(403);
    const elsewhere = { all: false, personIds: [OTHER] } as const;
    expect((await refusal(cases.review(elsewhere, created.caseId, REVIEWER, { updateStatus: 'Approved' }))).statusCode).toBe(404);
  });
});

describe('edit', () => {
  it('checks the finger rule on the merged case', async () => {
    const { cases } = useCases();
    const created = await cases.request(ALL, { personId: PERSON, biometricType: 'FACIAL', reason: 'x' }, REQUESTER);
    expect((await refusal(cases.edit(ALL, created.caseId, { biometricType: 'FINGERPRINT' }))).statusCode).toBe(400);
    expect(await cases.edit(ALL, created.caseId, { biometricType: 'FINGERPRINT', fingerNumber: 2 })).toMatchObject({ fingerNumber: 2 });
  });
});
