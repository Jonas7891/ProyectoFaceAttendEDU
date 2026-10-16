// HU-JUS-001 AC1/AC5: solo inasistencias y retardos sin justificación previa.
import { eligibleRecords } from '../justificationEligibility';

const record = (id, status, capturedAt) => ({ attendance_record_id: id, attendance_status: status, captured_at: capturedAt });

describe('eligibleRecords', () => {
  test('deja solo Absent y Late sin justificación, del más reciente al más antiguo', () => {
    const records = [
      record(1, 'Absent', '2026-10-01T08:00:00'),
      record(2, 'Present', '2026-10-02T08:00:00'),
      record(3, 'Late', '2026-10-03T08:10:00'),
      record(4, 'Justified', '2026-10-04T08:00:00'),
      record(5, 'Absent', '2026-10-05T08:00:00'),
    ];
    const justifications = [{ attendanceRecordId: 5 }];

    expect(eligibleRecords(records, justifications).map((r) => r.attendance_record_id)).toEqual([3, 1]);
  });

  test('compara ids aunque lleguen como texto', () => {
    expect(eligibleRecords([record(7, 'Late', null)], [{ attendanceRecordId: '7' }])).toEqual([]);
  });

  test('sin datos devuelve lista vacía', () => {
    expect(eligibleRecords()).toEqual([]);
  });
});
