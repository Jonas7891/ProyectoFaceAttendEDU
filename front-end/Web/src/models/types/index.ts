// ============================================================
//  FaceAttend EDU — Domain Types (Model Layer)
//  Toda entidad de negocio vive aquí. Las Views y ViewModels
//  importan desde aquí, nunca desde mockData directamente.
// ============================================================

export type UserRole = "admin" | "teacher" | "student";

export interface User {
    id:     string;
    name:   string;
    email:  string;
    role:   UserRole;
    avatar?: string;
}

// ── AppUser — usuarios registrados del sistema ────────────────

export type AppUserRole = "admin" | "teacher" | "student";
export type AppUserStatus = "active" | "inactive";

export interface AppUser {
    id:          string;
    name:        string;
    email:       string;
    role:        AppUserRole;
    code?:       string;   // código institucional (estudiantes/docentes)
    department?: string;   // área/departamento (docentes)
    status:      AppUserStatus;
}

// ── Environment — ambientes/salones ─────────────────────────

export interface EnvironmentSchedule {
    id:         string;
    courseCode: string;     // número de ficha/curso
    courseName: string;     // nombre del programa/formación
    instructor: string;     // ID del usuario instructor
    instructorName: string; // nombre en texto para display
    startTime:  string;     // "08:00"
    endTime:    string;     // "10:00"
    days:       string[];   // ["Lun", "Mié"]
}

export interface Environment {
    id:          string;
    number:      string;     // número del salón, ej: "301"
    description: string;     // descripción / ubicación del ambiente
    capacity?:   number;     // capacidad del ambiente
    schedules:   EnvironmentSchedule[];
}

export type StudentStatus = "active" | "inactive";

export interface Student {
    id:         string;
    name:       string;
    code:       string;
    email:      string;
    course:     string;
    grade:      string;
    attendance: number;   // 0–100
    registered: boolean;  // facial recognition registered
    status:     StudentStatus;
}

export interface Course {
    id:             string;
    code:           string;
    name:           string;
    professor:      string;
    semester:       string;
    schedule:       string;
    room:           string;
    students:       number;
    avgAttendance:  number;
    color:          string;
}

export type AttendanceStatus = "on_time" | "late" | "absent";

export interface AttendanceRecord {
    id:      string;
    student: string;
    course:  string;
    time:    string;
    status:  AttendanceStatus;
}

export interface DailyAttendance {
    day:     string;
    present: number;
    late:    number;
    absent:  number;
}

export interface WeeklyAttendance {
    week: string;
    rate: number;
}

export interface CourseAttendance {
    course: string;
    rate:   number;
}

export type Period = "week" | "month" | "semester";

export interface Tab {
    key:   string;
    label: string;
    icon:  string;
}
