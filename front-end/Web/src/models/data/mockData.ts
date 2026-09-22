// ============================================================
//  FaceAttend EDU — Mock Data (Model Layer)
//  Reemplaza cada export con una llamada real a tu API.
//  Las ViewModels importan desde aquí, nunca las Views directamente.
// ============================================================

import type {
    Student, Course, AttendanceRecord,
    DailyAttendance, WeeklyAttendance, CourseAttendance, User,
    AppUser, Environment,
} from "../types";

export const mockStudents: Student[] = [
    { id: "1", name: "María García López",    email: "m.garcia@uni.edu",    code: "2021001", course: "Ingeniería de Sistemas", grade: "4to semestre", attendance: 92, status: "active",   registered: true  },
    { id: "2", name: "Carlos Rodríguez Mora", email: "c.rodriguez@uni.edu", code: "2021002", course: "Ingeniería de Sistemas", grade: "4to semestre", attendance: 78, status: "active",   registered: true  },
    { id: "3", name: "Ana Martínez Ríos",     email: "a.martinez@uni.edu",  code: "2021003", course: "Matemáticas",            grade: "3er semestre", attendance: 95, status: "active",   registered: true  },
    { id: "4", name: "Luis Herrera Díaz",     email: "l.herrera@uni.edu",   code: "2021004", course: "Ingeniería Civil",       grade: "2do semestre", attendance: 61, status: "active",   registered: false },
    { id: "5", name: "Sofia Pérez Muñoz",     email: "s.perez@uni.edu",     code: "2021005", course: "Matemáticas",            grade: "3er semestre", attendance: 88, status: "inactive", registered: true  },
    { id: "6", name: "Andrés Vargas Castro",  email: "a.vargas@uni.edu",    code: "2021006", course: "Ingeniería Civil",       grade: "5to semestre", attendance: 74, status: "active",   registered: true  },
    { id: "7", name: "Valentina Cruz Lozano", email: "v.cruz@uni.edu",      code: "2021007", course: "Ingeniería de Sistemas", grade: "4to semestre", attendance: 99, status: "active",   registered: true  },
    { id: "8", name: "Daniel Ramírez Pinto",  email: "d.ramirez@uni.edu",   code: "2021008", course: "Matemáticas",            grade: "1er semestre", attendance: 55, status: "active",   registered: false },
];

export const mockCourses: Course[] = [
    { id: "1", name: "Algoritmos y Estructuras de Datos", code: "AED-401", professor: "Dr. Felipe Torres",   students: 34, schedule: "Lun/Mié 8:00–10:00",      room: "Aula 301",        semester: "2024-2", avgAttendance: 87, color: "#4F6BED" },
    { id: "2", name: "Cálculo Diferencial",               code: "MAT-201", professor: "Dra. Patricia Soto", students: 48, schedule: "Mar/Jue 10:00–12:00",     room: "Aula 105",        semester: "2024-2", avgAttendance: 79, color: "#10B981" },
    { id: "3", name: "Física I",                          code: "FIS-101", professor: "Dr. Mauricio Reyes", students: 52, schedule: "Lun/Mié/Vie 7:00–8:00",   room: "Lab. Física",     semester: "2024-2", avgAttendance: 91, color: "#F59E0B" },
    { id: "4", name: "Programación Orientada a Objetos",  code: "POO-301", professor: "Ing. Sandra Varela", students: 29, schedule: "Mar/Jue 14:00–16:00",     room: "Lab. Computación",semester: "2024-2", avgAttendance: 93, color: "#8B5CF6" },
    { id: "5", name: "Bases de Datos",                    code: "BD-401",  professor: "Dr. Hugo Méndez",    students: 38, schedule: "Vie 8:00–12:00",           room: "Lab. Computación",semester: "2024-2", avgAttendance: 82, color: "#EF4444" },
    { id: "6", name: "Pizzas de Datos",                   code: "PD-101",  professor: "Dr. Hugo Verdosa",   students: 15, schedule: "Lun 8:00–12:00",           room: "Aula 301",        semester: "2024-2", avgAttendance: 82, color: "#EF4444" },
];

export const mockAttendanceByDay: DailyAttendance[] = [
    { day: "Lun", present: 145, absent: 22, late: 8  },
    { day: "Mar", present: 138, absent: 28, late: 12 },
    { day: "Mié", present: 151, absent: 18, late: 6  },
    { day: "Jue", present: 129, absent: 35, late: 14 },
    { day: "Vie", present: 142, absent: 25, late: 9  },
];

export const mockAttendanceByWeek: WeeklyAttendance[] = [
    { week: "Sem 1", rate: 88 },
    { week: "Sem 2", rate: 84 },
    { week: "Sem 3", rate: 91 },
    { week: "Sem 4", rate: 79 },
    { week: "Sem 5", rate: 87 },
    { week: "Sem 6", rate: 93 },
    { week: "Sem 7", rate: 89 },
    { week: "Sem 8", rate: 86 },
];

export const mockCourseAttendance: CourseAttendance[] = [
    { course: "POO-301", rate: 93 },
    { course: "FIS-101", rate: 91 },
    { course: "AED-401", rate: 87 },
    { course: "BD-401",  rate: 82 },
    { course: "MAT-201", rate: 79 },
];

export const mockRecentActivity: AttendanceRecord[] = [
    { id: "1", student: "María García",     course: "AED-401", time: "Hace 3 min",  status: "on_time" },
    { id: "2", student: "Carlos Rodríguez", course: "AED-401", time: "Hace 5 min",  status: "late"    },
    { id: "3", student: "Luis Herrera",     course: "MAT-201", time: "Hace 10 min", status: "absent"  },
    { id: "4", student: "Valentina Cruz",   course: "POO-301", time: "Hace 12 min", status: "on_time" },
    { id: "5", student: "Ana Martínez",     course: "MAT-201", time: "Hace 15 min", status: "on_time" },
];

export const mockUser: User = {
    id:    "u1",
    name:  "Prof. Fernando Castro",
    email: "f.castro@uni.edu",
    role:  "teacher",
};

// ── AppUsers mock ────────────────────────────────────────────

export const mockAppUsers: AppUser[] = [
    { id: "au1", name: "Dr. Felipe Torres",   email: "f.torres@uni.edu",   role: "teacher", code: "DOC001", department: "Ingeniería de Sistemas", status: "active"   },
    { id: "au2", name: "Dra. Patricia Soto",  email: "p.soto@uni.edu",     role: "teacher", code: "DOC002", department: "Matemáticas",            status: "active"   },
    { id: "au3", name: "Dr. Mauricio Reyes",  email: "m.reyes@uni.edu",    role: "teacher", code: "DOC003", department: "Física",                  status: "active"   },
    { id: "au4", name: "Ing. Sandra Varela",  email: "s.varela@uni.edu",   role: "teacher", code: "DOC004", department: "Programación",            status: "active"   },
    { id: "au5", name: "Dr. Hugo Méndez",     email: "h.mendez@uni.edu",   role: "teacher", code: "DOC005", department: "Bases de Datos",          status: "active"   },
    { id: "au6", name: "Prof. Fernando Castro", email: "f.castro@uni.edu", role: "teacher", code: "DOC006", department: "Administración",          status: "active"   },
    { id: "au7", name: "Admin. General",      email: "admin@uni.edu",      role: "admin",   code: "ADM001", department: "TI",                      status: "active"   },
    { id: "au8", name: "María García López",  email: "m.garcia@uni.edu",   role: "student", code: "2021001",                                        status: "active"   },
    { id: "au9", name: "Carlos Rodríguez",    email: "c.rodriguez@uni.edu",role: "student", code: "2021002",                                        status: "inactive" },
];

// ── Environments mock ────────────────────────────────────────

export const mockEnvironments: Environment[] = [
    {
        id: "env1",
        number: "301",
        description: "Bloque A, piso 3 — Aula de teoría con capacidad para 40 estudiantes. Dotada de videobeam y aire acondicionado.",
        capacity: 40,
        schedules: [
            { id: "sch1", courseCode: "2240001", courseName: "Algoritmos y Estructuras de Datos", instructor: "au1", instructorName: "Dr. Felipe Torres",  startTime: "08:00", endTime: "10:00", days: ["Lun", "Mié"] },
            { id: "sch2", courseCode: "2240006", courseName: "Bases de Datos",                    instructor: "au5", instructorName: "Dr. Hugo Méndez",    startTime: "14:00", endTime: "18:00", days: ["Vie"]         },
        ],
    },
    {
        id: "env2",
        number: "105",
        description: "Bloque B, piso 1 — Aula de matemáticas con tablero de vidrio y sistema de audio.",
        capacity: 50,
        schedules: [
            { id: "sch3", courseCode: "2240002", courseName: "Cálculo Diferencial", instructor: "au2", instructorName: "Dra. Patricia Soto", startTime: "10:00", endTime: "12:00", days: ["Mar", "Jue"] },
        ],
    },
    {
        id: "env3",
        number: "Lab. Física",
        description: "Bloque C, piso 1 — Laboratorio de física con equipos de medición. Requiere bata de laboratorio.",
        capacity: 30,
        schedules: [
            { id: "sch4", courseCode: "2240003", courseName: "Física I", instructor: "au3", instructorName: "Dr. Mauricio Reyes", startTime: "07:00", endTime: "08:00", days: ["Lun", "Mié", "Vie"] },
        ],
    },
    {
        id: "env4",
        number: "Lab. Computación",
        description: "Bloque A, piso 2 — Laboratorio de cómputo con 30 equipos. Acceso con carné estudiantil.",
        capacity: 30,
        schedules: [
            { id: "sch5", courseCode: "2240004", courseName: "Programación Orientada a Objetos", instructor: "au4", instructorName: "Ing. Sandra Varela", startTime: "14:00", endTime: "16:00", days: ["Mar", "Jue"] },
        ],
    },
];
