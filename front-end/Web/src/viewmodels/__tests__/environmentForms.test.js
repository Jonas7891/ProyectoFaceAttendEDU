import { validateEnvironmentForm, validateScheduleForm, getTimePlaceholders } from "../useEnvironmentsViewModel";

jest.mock("../../context/AppDataContext", () => ({ useAppData: () => ({}) }));
const mockConfig = { timeFormat24h: true };
jest.mock("../../core/config/institutionConfig", () => ({ getInstitutionConfig: () => mockConfig }));

const form = (patch) => ({
    courseCode: "2758", courseName: "ADSI", instructorId: "t1",
    days: ["Lun"], startTime: "07:00", endTime: "09:00", ...patch,
});
const existing = [{ id: "h1", courseName: "Redes", days: ["Lun", "Mié"], startTime: "08:00", endTime: "10:00" }];

describe("validateEnvironmentForm", () => {
    test("only the environment number is required", () => {
        expect(validateEnvironmentForm({ number: "  " })).toBe("El número del ambiente es requerido");
        expect(validateEnvironmentForm({ number: "A-101" })).toBeNull();
    });
});

describe("validateScheduleForm", () => {
    test.each([
        [{ courseCode: " " }, "Completa todos los campos"],
        [{ courseName: "" }, "Completa todos los campos"],
        [{ instructorId: "" }, "Selecciona un instructor"],
        [{ days: [] }, "Selecciona al menos un día"],
        [{ endTime: "" }, "Completa el horario"],
    ])("required fields %#", (patch, message) => {
        expect(validateScheduleForm(form(patch))).toBe(message);
    });

    test("rejects malformed times with an example in the configured format", () => {
        mockConfig.timeFormat24h = true;
        expect(validateScheduleForm(form({ startTime: "25:00" }))).toBe("Formato de hora inválido. Ejemplo: 14:30");
        mockConfig.timeFormat24h = false;
        expect(validateScheduleForm(form({ endTime: "9am" }))).toBe("Formato de hora inválido. Ejemplo: 02:30 PM");
    });

    test("the end must be after the start, in 24h or 12h", () => {
        expect(validateScheduleForm(form({ startTime: "09:00", endTime: "09:00" }))).toBe("La hora de fin debe ser mayor a la hora de inicio");
        expect(validateScheduleForm(form({ startTime: "12:30 PM", endTime: "12:15 AM" }))).toBe("La hora de fin debe ser mayor a la hora de inicio");
        expect(validateScheduleForm(form({ startTime: "11:00 AM", endTime: "1:00 PM" }))).toBeNull();
    });

    test("a course larger than the room is rejected", () => {
        expect(validateScheduleForm(form(), [], 30, { students: 35 }))
            .toBe("Este curso excede la capacidad maxima del ambiente de 30 personas porque tiene 35 estudiantes");
        expect(validateScheduleForm(form(), [], 40, { students: 35 })).toBeNull();
    });

    test("overlaps on a shared day are rejected with the conflicting course", () => {
        expect(validateScheduleForm(form({ days: ["Lun", "Vie"] }), existing))
            .toBe('Conflicto de horarios: El curso "Redes" ya ocupa este ambiente los días Lun de 08:00 a 10:00');
        // starts inside, ends inside, and covers the existing block
        expect(validateScheduleForm(form({ startTime: "09:00", endTime: "11:00" }), existing)).toMatch(/^Conflicto/);
        expect(validateScheduleForm(form({ startTime: "07:00", endTime: "11:00" }), existing)).toMatch(/^Conflicto/);
        // 12h existing blocks are compared in 24h
        expect(validateScheduleForm(form(), [{ ...existing[0], startTime: "08:30 AM", endTime: "10:00 AM" }])).toMatch(/^Conflicto/);
    });

    test("back-to-back blocks, other days and the block being edited are fine", () => {
        expect(validateScheduleForm(form({ startTime: "10:00", endTime: "12:00" }), existing)).toBeNull();
        expect(validateScheduleForm(form({ days: ["Mar"] }), existing)).toBeNull();
        expect(validateScheduleForm(form({ startTime: "08:00", endTime: "10:00" }), existing, 0, null, "h1")).toBeNull();
    });
});

describe("getTimePlaceholders", () => {
    test("without days it suggests the shift defaults", () => {
        expect(getTimePlaceholders("tarde", existing, [], true)).toEqual({
            startPlaceholder: "12:00", endPlaceholder: "18:00", suggestedStart: "12:00", suggestedEnd: "18:00",
        });
        expect(getTimePlaceholders("desconocida", [], [], false).suggestedStart).toBe("6:00 AM");
    });

    test("with no block on those days it keeps the shift defaults", () => {
        expect(getTimePlaceholders("noche", existing, ["Vie"], false)).toMatchObject({ suggestedStart: "6:00 PM", suggestedEnd: "10:00 PM" });
    });

    test("it suggests the first free two-hour slot from 06:00", () => {
        expect(getTimePlaceholders("mañana", existing, ["Lun"], true)).toMatchObject({ suggestedStart: "06:00", suggestedEnd: "08:00" });
        const busyMorning = [{ days: ["Lun"], startTime: "06:00", endTime: "09:00" }, { days: ["Lun"], startTime: "10:00", endTime: "13:00" }];
        expect(getTimePlaceholders("mañana", busyMorning, ["Lun"], true)).toMatchObject({ suggestedStart: "13:00", suggestedEnd: "15:00" });
        expect(getTimePlaceholders("mañana", busyMorning, ["Lun"], false)).toMatchObject({ suggestedStart: "1:00 PM", suggestedEnd: "3:00 PM" });
    });

    test("a full day falls back to the shift defaults in the same 12h/24h format", () => {
        const fullDay = [{ days: ["Lun"], startTime: "06:00", endTime: "23:00" }];
        expect(getTimePlaceholders("tarde", fullDay, ["Lun"], true)).toMatchObject({ suggestedStart: "12:00", suggestedEnd: "18:00" });
        expect(getTimePlaceholders("tarde", fullDay, ["Lun"], false)).toEqual({
            startPlaceholder: "12:00 PM", endPlaceholder: "6:00 PM", suggestedStart: "12:00 PM", suggestedEnd: "6:00 PM",
        });
    });
});
