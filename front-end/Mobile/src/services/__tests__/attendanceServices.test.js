import { request } from '../../api/apiClient';
import { AttendanceService } from '../AttendanceService';
import { ClassSessionService } from '../ClassSessionService';
import { EnrollmentService } from '../EnrollmentService';
import { CohortService } from '../CohortService';
import AttendanceRecord from '../../models/attendance/AttendanceRecord';

jest.mock('../../api/apiClient', () => ({
  request: jest.fn(),
  GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE',
}));

const call = (i = 0) => request.mock.calls[i][0];
const urls = () => request.mock.calls.map(([c]) => `${c.method} ${c.url}`);

beforeEach(() => request.mockReset());

describe('AttendanceService', () => {
  test('getSummary deduplicates ids, drops nulls and batches by 200', async () => {
    const ids = [...Array.from({ length: 250 }, (_, i) => i + 1), 1, null, undefined];
    request.mockImplementation(async ({ params }) => Object.fromEntries(
      params.academicActorIds.split(',').map((id) => [id, { present: Number(id), total: 1 }]),
    ));

    const summary = await AttendanceService.getSummary(ids);

    expect(request).toHaveBeenCalledTimes(2);
    expect(call(0).params.academicActorIds.split(',')).toHaveLength(200);
    expect(call(1).params.academicActorIds.split(',')).toHaveLength(50);
    expect(summary.size).toBe(250);
    expect(summary.get(250)).toEqual({ present: 250, total: 1 });
  });

  test('getSummary with no ids makes no request', async () => {
    await expect(AttendanceService.getSummary()).resolves.toEqual(new Map());
    expect(request).not.toHaveBeenCalled();
  });

  test('lookups send snake filters and map the records', async () => {
    request.mockResolvedValue([{ attendance_record_id: 5, class_session_id: 9, academic_actor_id: 3, attendance_status: 'Present' }]);
    const [bySession] = await AttendanceService.getBySession(9);
    await AttendanceService.getByActor(3);
    const one = await AttendanceService.getBySessionAndActor(9, 3);
    expect(bySession).toMatchObject({ attendanceRecordId: 5, attendanceStatus: 'Present' });
    expect(one.academicActorId).toBe(3);
    expect(request.mock.calls.map(([c]) => c.params)).toEqual([
      { class_session_id: 9 }, { academic_actor_id: 3 }, { class_session_id: 9, academic_actor_id: 3 },
    ]);
  });

  test('bulkCreate posts the records one by one in order', async () => {
    request.mockImplementation(async ({ data }) => ({ ...data, attendance_record_id: data.academic_actor_id * 10 }));
    const records = [1, 2].map((id) => new AttendanceRecord({ class_session_id: 9, academic_actor_id: id }));
    const created = await AttendanceService.bulkCreate(records);
    expect(created.map((r) => r.attendanceRecordId)).toEqual([10, 20]);
    expect(urls()).toEqual(['POST attendance_record', 'POST attendance_record']);
  });

  test('getAll, getById, create, update and delete', async () => {
    request.mockResolvedValue({ attendance_record_id: 5 });
    const record = new AttendanceRecord({ academic_actor_id: 3 });
    await AttendanceService.getAll();
    await AttendanceService.getById(5);
    await AttendanceService.create(record);
    await AttendanceService.update(5, record);
    await AttendanceService.delete(5);
    expect(urls()).toEqual([
      'GET attendance_record', 'GET attendance_record/5', 'POST attendance_record', 'PUT attendance_record/5', 'DELETE attendance_record/5',
    ]);
  });
});

describe('ClassSessionService', () => {
  test('the action endpoints apply the Open/Closed/Cancelled transitions', async () => {
    request.mockResolvedValue({ classSessionId: 4, sessionStatus: 'Closed' });
    const closed = await ClassSessionService.closeById(4, 10);
    await ClassSessionService.openById(4);
    await ClassSessionService.cancelById(4);
    expect(closed.classSessionId).toBe(4);
    expect(urls()).toEqual([
      'POST api/v1/class-sessions/4/close', 'POST api/v1/class-sessions/4/open', 'POST api/v1/class-sessions/4/cancel',
    ]);
    expect(call(0).data).toEqual({ closedBy: 10 });
    expect(call(1).data).toBeNull();
  });

  test('getOpen filters by school only when one is given', async () => {
    request.mockResolvedValue([{ class_session_id: 1 }]);
    await ClassSessionService.getOpen();
    await ClassSessionService.getOpen(7);
    expect(call(0).params).toEqual({ session_status: 'Open' });
    expect(call(1).params).toEqual({ session_status: 'Open', school_id: 7 });
  });

  test('legacy open, close and cancel bodies', async () => {
    request.mockResolvedValue({ class_session_id: 4 });
    await ClassSessionService.open(2, '2026-11-08', 10);
    await ClassSessionService.close(4, 10);
    await ClassSessionService.cancel(4);
    expect(call(0).data).toEqual({ schedule_block_id: 2, session_date: '2026-11-08', opened_by: 10 });
    expect(call(1).data).toMatchObject({ closed_by: 10, session_status: 'Closed' });
    expect(new Date(call(1).data.closed_at).toString()).not.toBe('Invalid Date');
    expect(call(2).data).toEqual({ session_status: 'Cancelled' });
  });

  test('lookups by block, date and id', async () => {
    request.mockResolvedValue([{ class_session_id: 1, schedule_block_id: 2 }]);
    expect((await ClassSessionService.getByScheduleBlock(2))[0].scheduleBlockId).toBe(2);
    await ClassSessionService.getByDate('2026-11-08');
    await ClassSessionService.getAll();
    await ClassSessionService.getById(1);
    expect(call(1).params).toEqual({ session_date: '2026-11-08' });
    expect(call(3).url).toBe('class_session/1');
  });
});

describe('EnrollmentService', () => {
  test('nested routes filter on the server and normalize camelCase rows', async () => {
    request.mockResolvedValue({ value: [{ enrollmentId: 1, academicActorId: 3, cohortId: 2, enrollmentStatus: 'Active' }] });
    const [byCohort] = await EnrollmentService.listByCohort(2);
    await EnrollmentService.listByActor(3);
    expect(byCohort).toMatchObject({ enrollmentId: 1, academicActorId: 3, cohortId: 2 });
    expect(urls()).toEqual(['GET api/v1/cohorts/2/enrollments', 'GET api/v1/academic-actors/3/enrollments']);
  });

  test('listByActor without an actor makes no request', async () => {
    await expect(EnrollmentService.listByActor(null)).resolves.toEqual([]);
    expect(request).not.toHaveBeenCalled();
  });

  test('legacy filters, active enrollments and CRUD', async () => {
    request.mockResolvedValue([{ enrollment_id: 1 }]);
    const draft = { toApi: () => ({ cohort_id: 2 }) };
    await EnrollmentService.getActiveByActor(3);
    await EnrollmentService.getByActor(3);
    await EnrollmentService.getByCohort(2);
    await EnrollmentService.getAll();
    await EnrollmentService.getById(1);
    await EnrollmentService.create(draft);
    await EnrollmentService.update(1, draft);
    await EnrollmentService.delete(1);
    expect(call(0).params).toEqual({ academic_actor_id: 3, enrollment_status: 'Active' });
    expect(urls().slice(4)).toEqual(['GET enrollment/1', 'POST enrollment', 'PUT enrollment/1', 'DELETE enrollment/1']);
  });
});

describe('CohortService', () => {
  test('listByProgram uses the nested route and normalizes the rows', async () => {
    request.mockResolvedValue([{ cohortId: 2, programId: 5, code: '2758' }]);
    const [cohort] = await CohortService.listByProgram(5);
    expect(call().url).toBe('api/v1/programs/5/cohorts');
    expect(cohort).toMatchObject({ cohortId: 2, programId: 5, code: '2758' });
  });

  test('filters and CRUD', async () => {
    request.mockResolvedValue({ cohort_id: 2 });
    const draft = { toApi: () => ({ code: '2758' }) };
    await CohortService.getByProgram(5);
    await CohortService.getByPeriod(1);
    await CohortService.getAll();
    expect((await CohortService.getById(2)).cohortId).toBe(2);
    await CohortService.create(draft);
    await CohortService.update(2, draft);
    await CohortService.delete(2);
    expect(call(0).params).toEqual({ program_id: 5 });
    expect(call(1).params).toEqual({ academic_period_id: 1 });
    expect(urls().slice(3)).toEqual(['GET cohort/2', 'POST cohort', 'PUT cohort/2', 'DELETE cohort/2']);
  });
});
