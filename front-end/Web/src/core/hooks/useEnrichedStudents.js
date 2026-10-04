// ============================================================
//  Hook: useEnrichedStudents
// ============================================================
//  RESPONSABILIDAD: Enriquecer estudiantes con datos calculados
//  dinámicamente, como el período académico vigente
//
//  Este hook:
//  ✓ Calcula el período actual de cada estudiante basándose en su curso
//  ✓ Mantiene el rendimiento usando useMemo
//  ✓ Se integra transparentemente con el contexto AppData
// ============================================================

import { useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { getStudentPeriodFromData } from '../utils/studentPeriodCalculator';
import { getConfiguredAcademicPeriodType } from '../constants/academicPeriods';

/**
 * Hook que enriquece los estudiantes con información calculada dinámicamente
 * 
 * Añade el campo `grade` calculado automáticamente basándose en:
 * - Las fechas de inicio/fin del curso asociado
 * - El tipo de período académico configurado
 * - La fecha actual
 * 
 * @returns {Object} Objeto con estudiantes enriquecidos y estado de carga
 * 
 * @example
 * const { students, isLoading, courses } = useEnrichedStudents();
 * 
 * // Cada estudiante ahora tiene:
 * // - grade: "4to semestre" (calculado dinámicamente)
 * // - periodInfo: { periodNumber, totalPeriods, isLastPeriod, ... }
 */
export function useEnrichedStudents() {
    const { students: rawStudents, courses, isLoading } = useAppData();
    
    // Obtener el tipo de período académico configurado
    const periodType = useMemo(() => getConfiguredAcademicPeriodType(), []);
    
    // Enriquecer estudiantes con información de período calculada
    const enrichedStudents = useMemo(() => {
        if (!rawStudents || !courses || rawStudents.length === 0 || courses.length === 0) {
            return rawStudents || [];
        }
        
        return rawStudents.map(student => {
            // Calcular el período actual del estudiante
            const periodInfo = getStudentPeriodFromData(
                student,
                courses,
                periodType
            );
            
            // Retornar estudiante enriquecido con el campo grade calculado
            return {
                ...student,
                grade: periodInfo.label || student.grade || '—', // Usar valor calculado, fallback al original
                periodInfo, // Info adicional para debugging o detalles
            };
        });
    }, [rawStudents, courses, periodType]);
    
    return {
        students: enrichedStudents,
        courses,
        isLoading,
        periodType,
    };
}

/**
 * Hook simplificado que solo retorna los estudiantes enriquecidos
 * Útil cuando no necesitas el contexto completo
 * 
 * @returns {Array} Array de estudiantes con grade calculado
 * 
 * @example
 * const students = useEnrichedStudentsOnly();
 * console.log(students[0].grade); // "4to semestre"
 */
export function useEnrichedStudentsOnly() {
    const { students } = useEnrichedStudents();
    return students;
}

export default useEnrichedStudents;
