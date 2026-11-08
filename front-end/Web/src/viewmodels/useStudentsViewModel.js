import { documentTypesForRole } from "../services/api/staffProvisioning";
import { birthDateError } from "../core/utils/validation";

// ── Tipos de formulario ───────────────────────────────────

export const EMPTY_FORM = {
    name: "",
    code: "",
    email: "",
    course: "",
    role: "student",
    documentNumber: "",
    documentType: "",
    bloodType: "",
    birthDate: "",
    address: "",
    phone: "",
    password: "",
    sendCredentials: true, // Enviar usuario y contraseña inicial por correo
    schoolId: "",
    cohortId: "",
    attendance: 0,
    hasFacial: false,      // Registro facial
    hasFingerprint: false, // Registro de huella dactilar
    status: "active",
};

export function validateStudentForm(form) {
    if (!form.name.trim()) return "Completa todos los campos";
    if (!form.code.trim()) return "Completa todos los campos";
    if (!form.email.trim()) return "Completa todos los campos";
    if (!form.role) return "Completa todos los campos";
    if (form.privacyAccepted !== true) return "Confirma que la persona aceptó el aviso de privacidad";
    // Todos los roles se crean en el backend (POST /persons exige
    // documentNumber, POST /users exige password de 8-100 chars).
    if (!String(form.documentNumber ?? "").trim()) return "Completa todos los campos";
    if (String(form.password ?? "").length < 8) return "La contraseña debe tener al menos 8 caracteres";
    const birthError = birthDateError(form.birthDate);
    if (birthError) return birthError;
    // La tarjeta de identidad es de menores: no aplica a docentes ni administradores.
    if (form.documentType && !documentTypesForRole(form.role).includes(form.documentType)) {
        return "Tipo de documento no válido para este rol";
    }
    // El programa/ficha solo aplica a estudiantes (el formulario de
    // docente/administrador ni siquiera lo muestra).
    if (form.role === "student" && !form.course.trim()) return "Completa todos los campos";
    // El docente/administrador queda vinculado a su sede (actor).
    if ((form.role === "teacher" || form.role === "admin") && !String(form.schoolId ?? "").trim()) {
        return "Selecciona la sede";
    }
    return null;
}

