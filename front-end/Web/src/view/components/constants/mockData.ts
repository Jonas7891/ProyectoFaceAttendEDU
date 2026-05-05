// ============================================================
//  FaceAttend EDU — Mock Data
//  Reemplaza estas con llamadas reales a la API cuando estés listo
// ============================================================

export const mockStudents = [
  { id: 1, name: "María García López",    email: "m.garcia@uni.edu",     code: "2021001", course: "Ingeniería de Sistemas", grade: "4to semestre", attendance: 92, status: "active",   registered: true  },
  { id: 2, name: "Carlos Rodríguez Mora", email: "c.rodriguez@uni.edu",  code: "2021002", course: "Ingeniería de Sistemas", grade: "4to semestre", attendance: 78, status: "active",   registered: true  },
  { id: 3, name: "Ana Martínez Ríos",    email: "a.martinez@uni.edu",    code: "2021003", course: "Matemáticas",            grade: "3er semestre", attendance: 95, status: "active",   registered: true  },
  { id: 4, name: "Luis Herrera Díaz",    email: "l.herrera@uni.edu",     code: "2021004", course: "Ingeniería Civil",       grade: "2do semestre", attendance: 61, status: "active",   registered: false },
  { id: 5, name: "Sofia Pérez Muñoz",    email: "s.perez@uni.edu",       code: "2021005", course: "Matemáticas",            grade: "3er semestre", attendance: 88, status: "inactive", registered: true  },
  { id: 6, name: "Andrés Vargas Castro", email: "a.vargas@uni.edu",      code: "2021006", course: "Ingeniería Civil",       grade: "5to semestre", attendance: 74, status: "active",   registered: true  },
  { id: 7, name: "Valentina Cruz Lozano",email: "v.cruz@uni.edu",        code: "2021007", course: "Ingeniería de Sistemas", grade: "4to semestre", attendance: 99, status: "active",   registered: true  },
  { id: 8, name: "Daniel Ramírez Pinto", email: "d.ramirez@uni.edu",     code: "2021008", course: "Matemáticas",            grade: "1er semestre", attendance: 55, status: "active",   registered: false },
];

export const mockCourses = [
  { id: 1, name: "Algoritmos y Estructuras de Datos", code: "AED-401", professor: "Dr. Felipe Torres",    students: 34, schedule: "Lun/Mié 8:00–10:00",       room: "Aula 301",       semester: "2024-2", avgAttendance: 87, color: "#4F6BED" },
  { id: 2, name: "Cálculo Diferencial",               code: "MAT-201", professor: "Dra. Patricia Soto",  students: 48, schedule: "Mar/Jue 10:00–12:00",      room: "Aula 105",       semester: "2024-2", avgAttendance: 79, color: "#10B981" },
  { id: 3, name: "Física I",                          code: "FIS-101", professor: "Dr. Mauricio Reyes",  students: 52, schedule: "Lun/Mié/Vie 7:00–8:00",    room: "Lab. Física",    semester: "2024-2", avgAttendance: 91, color: "#F59E0B" },
  { id: 4, name: "Programación Orientada a Objetos",  code: "POO-301", professor: "Ing. Sandra Varela",  students: 29, schedule: "Mar/Jue 14:00–16:00",      room: "Lab. Computación",semester:"2024-2", avgAttendance: 93, color: "#8B5CF6" },
  { id: 5, name: "Bases de Datos",                    code: "BD-401",  professor: "Dr. Hugo Méndez",     students: 38, schedule: "Vie 8:00–12:00",            room: "Lab. Computación",semester:"2024-2", avgAttendance: 82, color: "#EF4444" },
];

export const mockAttendanceByDay = [
  { day: "Lun", present: 145, absent: 22, late: 8  },
  { day: "Mar", present: 138, absent: 28, late: 12 },
  { day: "Mié", present: 151, absent: 18, late: 6  },
  { day: "Jue", present: 129, absent: 35, late: 14 },
  { day: "Vie", present: 142, absent: 25, late: 9  },
];

export const mockAttendanceByWeek = [
  { week: "Sem 1", rate: 88 },
  { week: "Sem 2", rate: 84 },
  { week: "Sem 3", rate: 91 },
  { week: "Sem 4", rate: 79 },
  { week: "Sem 5", rate: 87 },
  { week: "Sem 6", rate: 93 },
  { week: "Sem 7", rate: 89 },
  { week: "Sem 8", rate: 86 },
];

export const mockCourseAttendance = [
  { course: "POO-301", rate: 93 },
  { course: "FIS-101", rate: 91 },
  { course: "AED-401", rate: 87 },
  { course: "BD-401",  rate: 82 },
  { course: "MAT-201", rate: 79 },
];

export const mockRecentActivity = [
  { id: 1, student: "María García",       course: "AED-401", time: "Hace 3 min",  status: "on_time" },
  { id: 2, student: "Carlos Rodríguez",   course: "AED-401", time: "Hace 5 min",  status: "late"    },
  { id: 3, student: "Luis Herrera",       course: "MAT-201", time: "Hace 10 min", status: "absent"  },
  { id: 4, student: "Valentina Cruz",     course: "POO-301", time: "Hace 12 min", status: "on_time" },
  { id: 5, student: "Ana Martínez",       course: "MAT-201", time: "Hace 15 min", status: "on_time" },
];

export const mockUser = {
  name:   "Prof. Fernando Castro",
  email:  "f.castro@uni.edu",
  role:   "Docente",
};
