// HU-JUS-001 AC1/AC5: solo se justifican inasistencias o retardos que aún no
// tienen justificación (relación 1:1 registro–justificación).
const JUSTIFIABLE_STATUSES = ['Absent', 'Late'];

export function eligibleRecords(records = [], justifications = []) {
    const justified = new Set(justifications.map((j) => String(j.attendanceRecordId)));
    return records
        .filter((r) => JUSTIFIABLE_STATUSES.includes(r.attendance_status))
        .filter((r) => !justified.has(String(r.attendance_record_id)))
        .sort((a, b) => String(b.captured_at || '').localeCompare(String(a.captured_at || '')));
}
