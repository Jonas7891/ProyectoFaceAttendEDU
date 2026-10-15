import { request } from '../../api/apiClient';
import { isoWeekday, markMissingAbsent, recordFace, statusAt } from '../attendanceSession';

jest.mock('../../api/apiClient', () => ({ request: jest.fn(), GET: 'GET', POST: 'POST' }));

const block = { starts_at: '08:00:00' };
const sessionDate = '2026-10-15';
const session = { class_session_id: 5, session_status: 'Open' };
const roster = [
  { actorId: '1', personId: 'p-1', name: 'Ana' },
  { actorId: '2', personId: 'p-2', name: 'Luis' },
];
const at = (hh, mm) => new Date(2026, 9, 15, hh, mm);

beforeEach(() => request.mockReset());

test('isoWeekday maps Monday to 1 and Sunday to 7', () => {
  expect(isoWeekday(new Date(2026, 9, 12))).toBe(1);
  expect(isoWeekday(new Date(2026, 9, 18))).toBe(7);
});

test('arrivals up to 10 minutes after the start are present, later ones absent', () => {
  expect(statusAt(block, sessionDate, at(8, 10))).toBe('Present');
  expect(statusAt(block, sessionDate, at(8, 11))).toBe('Absent');
});

test('recordFace creates a record once and rejects people outside the cohort', async () => {
  request.mockResolvedValue({ attendanceRecordId: 9, academicActorId: 1, attendanceStatus: 'Present' });

  const first = await recordFace({ session, block, sessionDate, roster, records: [], personId: 'p-1', score: 0.91234, at: at(8, 5) });
  expect(first.duplicate).toBe(false);
  expect(request.mock.calls[0][0]).toMatchObject({
    url: 'api/v1/attendance-records',
    data: { classSessionId: 5, academicActorId: 1, attendanceStatus: 'Present', captureMethod: 'FACIAL', matchScore: 0.9123 },
  });

  const again = await recordFace({ session, block, sessionDate, roster, records: [{ academic_actor_id: 1 }], personId: 'p-1', at: at(8, 6) });
  expect(again.duplicate).toBe(true);
  expect(request).toHaveBeenCalledTimes(1);

  await expect(recordFace({ session, block, sessionDate, roster, records: [], personId: 'p-9' })).rejects.toThrow('not-enrolled');
});

test('missing students become absent only after the margin, without duplicating', async () => {
  await expect(markMissingAbsent({ session, block, sessionDate, roster, records: [], at: at(8, 9) })).resolves.toEqual([]);
  expect(request).not.toHaveBeenCalled();

  request.mockResolvedValue([{ academicActorId: 2, attendanceStatus: 'Absent' }]);
  const created = await markMissingAbsent({ session, block, sessionDate, roster, records: [{ academic_actor_id: 1 }], at: at(8, 30) });
  expect(request.mock.calls[0][0]).toMatchObject({
    url: 'api/v1/attendance-records/bulk',
    data: [{ classSessionId: 5, academicActorId: 2, attendanceStatus: 'Absent', captureMethod: 'MANUAL' }],
  });
  expect(created).toEqual([{ academic_actor_id: 2, attendance_status: 'Absent' }]);
});
