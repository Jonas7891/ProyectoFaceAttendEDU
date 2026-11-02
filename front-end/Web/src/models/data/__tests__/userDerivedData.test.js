// AUD-36 / AUD-46: Dashboard y Reportes inventaban "45 faltas", "45 días" y marcaban "en riesgo"
// a alumnos sin ningún registro de asistencia. Aquí solo cuentan los datos reales del alumno.
import { getAtRiskStudents, getPerfectAttendanceStudents } from "../userDerivedData";

const student = (id, extra) => ({
    id: String(id),
    name: `Alumno ${id}`,
    code: `C${id}`,
    status: "active",
    ficha: "F1",
    course: "QBD",
    ...extra,
});

describe("getAtRiskStudents", () => {
    it("no marca en riesgo a quien no tiene ningún registro de asistencia", () => {
        const rows = getAtRiskStudents([student(1, { attendance: null, attendanceRecords: 0, absences: 0 })], 80);
        expect(rows).toEqual([]);
    });

    it("usa las faltas reales del alumno, no una estimación sobre 45 clases", () => {
        const [row] = getAtRiskStudents(
            [student(2, { attendance: 60, attendanceRecords: 10, absences: 4, lateCount: 1 })],
            80
        );
        expect(row.totalAbsences).toBe(4);
        expect(row.lateCount).toBe(1);
    });

    it("sin conteo de faltas disponible no inventa una cifra", () => {
        const [row] = getAtRiskStudents([student(3, { attendance: 50 })], 80);
        expect(row.totalAbsences).toBeNull();
        expect(row.lateCount).toBeNull();
    });
});

describe("getPerfectAttendanceStudents", () => {
    it("excluye a quien no tiene registros", () => {
        const rows = getPerfectAttendanceStudents([student(4, { attendance: null, attendanceRecords: 0 })], 80);
        expect(rows).toEqual([]);
    });

    it("muestra las sesiones registradas reales, no 45 días estimados", () => {
        const [row] = getPerfectAttendanceStudents([student(5, { attendance: 100, attendanceRecords: 1 })], 80);
        expect(row.totalClasses).toBe(1);
        expect(row.streak).toBe("1 sesión");
    });

    it("sin conteo de sesiones no muestra racha", () => {
        const [row] = getPerfectAttendanceStudents([student(6, { attendance: 100 })], 80);
        expect(row.totalClasses).toBeNull();
        expect(row.streak).toBeNull();
    });
});
