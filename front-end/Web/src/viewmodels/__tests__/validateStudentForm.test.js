import { EMPTY_FORM, validateStudentForm } from "../useStudentsViewModel";

// Person sign-up form (students, teachers, admins): every role is created in the
// backend, so POST /persons and POST /users requirements are checked up front.
const student = (patch) => ({
    ...EMPTY_FORM,
    name: "Ana Ruiz", code: "1001", email: "ana@sede.edu.co", course: "2758",
    documentNumber: "1077228536", password: "Secreta2026*", privacyAccepted: true,
    ...patch,
});

test("a complete student passes", () => {
    expect(validateStudentForm(student())).toBeNull();
    expect(validateStudentForm(student({ documentType: "TI", birthDate: "2010-05-20" }))).toBeNull();
});

test.each([
    [{ name: " " }],
    [{ code: "" }],
    [{ email: "" }],
    [{ role: "" }],
    [{ documentNumber: "  " }],
    [{ course: "" }],
])("missing required data is rejected (%o)", (patch) => {
    expect(validateStudentForm(student(patch))).toBe("Completa todos los campos");
});

test("the privacy notice must be accepted (Ley 1581)", () => {
    expect(validateStudentForm(student({ privacyAccepted: undefined }))).toBe("Confirma que la persona aceptó el aviso de privacidad");
});

test("the initial password needs 8 characters", () => {
    expect(validateStudentForm(student({ password: "1234567" }))).toBe("La contraseña debe tener al menos 8 caracteres");
});

test("an invalid or future birth date is rejected", () => {
    expect(validateStudentForm(student({ birthDate: "2010-02-30" }))).toBe("La fecha de nacimiento está incompleta o no es válida");
    expect(validateStudentForm(student({ birthDate: "2999-01-01" }))).toBe("La fecha de nacimiento no puede ser futura");
});

test("staff cannot use the minors' identity card and need a school, but no course", () => {
    const teacher = student({ role: "teacher", course: "", schoolId: "7" });
    expect(validateStudentForm(teacher)).toBeNull();
    expect(validateStudentForm({ ...teacher, documentType: "TI" })).toBe("Tipo de documento no válido para este rol");
    expect(validateStudentForm({ ...teacher, role: "admin", schoolId: "" })).toBe("Selecciona la sede");
});
