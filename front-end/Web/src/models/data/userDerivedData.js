// ============================================================
//  FaceAttend EDU — User Derived Data
// ============================================================
//  RESPONSABILIDAD: Calcular datos derivados desde usuarios base
//
//  Este archivo contiene funciones que generan listas derivadas
//  (estudiantes en riesgo, asistencia perfecta, etc.) desde los
//  datos base de usuarios (students, teachers, admins).
//
//  Cuando se integre un backend real, solo se necesita eliminar
//  los archivos de mocks y estas funciones usarán los datos reales.
// ============================================================

/**
 * Calcula la lista de estudiantes en riesgo desde la lista de estudiantes
 * 
 * Criterios:
 * - Asistencia < 80%
 * - Ordenados de menor a mayor asistencia (los más críticos primero)
 * 
 * @param {Array} students - Lista de estudiantes
 * @returns {Array} Lista de estudiantes en riesgo con metadata adicional
 */
export function getAtRiskStudents(students) {
    if (!students || students.length === 0) return [];
    
    return students
        .filter(student => (student.attendance || 0) < 80)
        .map(student => ({
            id: `ars_${student.id}`,
            studentId: student.id,
            name: student.name,
            code: student.code,
            ficha: student.ficha || "N/A",
            fichaName: student.course || "N/A",
            attendanceRate: student.attendance || 0,
            totalAbsences: Math.round((100 - (student.attendance || 0)) * 0.45), // Estimado
            consecutiveAbsences: (student.attendance || 0) < 70 ? 2 : 0,
            lateCount: Math.round((100 - (student.attendance || 0)) * 0.15), // Estimado
            riskLevel: (student.attendance || 0) < 70 ? "high" : "medium",
            daysUntilSanction: (student.attendance || 0) < 70 ? 5 : 10,
            lastAttendance: (student.attendance || 0) < 70 ? "Hace 2 días" : "Hoy",
        }))
        .sort((a, b) => a.attendanceRate - b.attendanceRate); // Menor a mayor
}

/**
 * Calcula la lista de estudiantes con asistencia perfecta/destacada
 * 
 * Criterios:
 * - Asistencia >= 90%
 * - Ordenados de mayor a menor asistencia (los mejores primero)
 * 
 * @param {Array} students - Lista de estudiantes
 * @returns {Array} Lista de estudiantes destacados con metadata adicional
 */
export function getPerfectAttendanceStudents(students) {
    if (!students || students.length === 0) return [];
    
    return students
        .filter(student => (student.attendance || 0) >= 90)
        .map(student => ({
            id: `pas_${student.id}`,
            studentId: student.id,
            name: student.name,
            code: student.code,
            ficha: student.ficha || "N/A",
            fichaName: student.course || "N/A",
            attendanceRate: student.attendance || 0,
            totalClasses: 45, // Estimado
            consecutivePerfect: Math.round((student.attendance || 0) * 0.45),
            streak: `${Math.round((student.attendance || 0) * 0.45)} días`,
        }))
        .sort((a, b) => b.attendanceRate - a.attendanceRate); // Mayor a menor
}

/**
 * Calcula la lista de asistencia de instructores desde la lista de profesores
 * 
 * @param {Array} teachers - Lista de profesores
 * @returns {Array} Lista de asistencia de instructores con metadata adicional
 */
export function getInstructorAttendance(teachers) {
    if (!teachers || teachers.length === 0) return [];
    
    return teachers.map(teacher => {
        const attendanceRate = teacher.attendance || 0;
        const totalClasses = 45; // Estimado
        const attendedClasses = Math.round((attendanceRate / 100) * totalClasses);
        const missedClasses = totalClasses - attendedClasses;
        const lateClasses = Math.round(missedClasses * 0.4); // 40% de las faltas son llegadas tarde
        
        // Determinar status según asistencia
        let status = "excellent";
        if (attendanceRate < 85) status = "warning";
        else if (attendanceRate < 95) status = "good";
        
        return {
            id: `ia_${teacher.id}`,
            instructorId: teacher.id,
            instructorName: teacher.name,
            department: teacher.course || teacher.department || "N/A",
            totalClasses,
            attendedClasses,
            attendanceRate,
            lateClasses,
            missedClasses,
            status,
        };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate); // Mayor a menor
}

/**
 * Obtiene todos los datos derivados de usuarios en un solo objeto
 * Útil para el dashboard que necesita múltiples listas
 * 
 * @param {Array} students - Lista de estudiantes
 * @param {Array} teachers - Lista de profesores
 * @returns {Object} Objeto con todas las listas derivadas
 */
export function getAllDerivedUserData(students, teachers) {
    return {
        atRiskStudents: getAtRiskStudents(students),
        perfectAttendanceStudents: getPerfectAttendanceStudents(students),
        instructorAttendance: getInstructorAttendance(teachers),
    };
}
