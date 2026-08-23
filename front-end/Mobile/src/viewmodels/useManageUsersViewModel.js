import {useCallback, useState} from 'react';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';

// Datos iniciales en JSON dentro del archivo (punto único de verdad para demo)
const initialData = {
  // "allStudents" representa el registro global de estudiantes en el programa
  students: [
    { id: 'stu_1', nombre: 'Juan Pérez', email: 'juan.perez@colegio.edu', grado: '1A', telefono: '3001112233' },
    { id: 'stu_2', nombre: 'María Gómez', email: 'maria.gomez@colegio.edu', grado: '2B', telefono: '3002223344' },
    { id: 'stu_3', nombre: 'Pedro Fernández', email: 'pedro.fernandez@colegio.edu', grado: '3C', telefono: '3003334455' },
  ],
  // Profesores asociados al colegio (se mantienen visibles)
  teachers: [
    { id: 'tch_1', nombre: 'Carlos Ruiz', email: 'carlos.ruiz@colegio.edu', materia: 'Matemáticas' },
    { id: 'tch_2', nombre: 'Laura Sánchez', email: 'laura.sanchez@colegio.edu', materia: 'Historia' },
  ],
};

export function useManageUsersViewModel() {
  // Registro global de estudiantes (JSON estático en este archivo)
  const [allStudents] = useState(initialData.students);

  // Lista de estudiantes asignados al colegio/administrador (vacía hasta que se agreguen)
  const [students, setStudents] = useState([]);

  // Profesores (ya existentes en el colegio)
  const [teachers, setTeachers] = useState(initialData.teachers);

  // Buscar estudiantes en el registro global
  const searchStudents = useCallback((query) => {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allStudents.filter(s => (s.nombre || '').toLowerCase().includes(q));
  }, [allStudents]);

  // Agregar estudiante desde el registro global por id
  const addStudentById = useCallback((id) => {
    const found = allStudents.find(s => s.id === id);
    if (!found) return null;
    // evitar duplicados
    setStudents(prev => {
      if (prev.some(p => p.id === id)) return prev;
      return [...prev, found];
    });
    return found;
  }, [allStudents]);

  const updateStudent = useCallback((student) => {
    setStudents(prev => prev.map(s => (s.id === student.id ? student : s)));
  }, []);

  const deleteStudent = useCallback((id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  // Mantener funciones para profesores (editar/eliminar)
  const addTeacher = useCallback((teacher) => {
    const newTeacher = { id: `tch_${Date.now()}`, ...teacher };
    setTeachers(prev => [...prev, newTeacher]);
    return newTeacher;
  }, []);

  const updateTeacher = useCallback((teacher) => {
    setTeachers(prev => prev.map(t => (t.id === teacher.id ? teacher : t)));
  }, []);

  const deleteTeacher = useCallback((id) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateKey = useLanguageRefresh();

  return {
    // datos
    allStudents,
    students,
    teachers,
    updateKey,
    // student operations
    searchStudents,
    addStudentById,
    updateStudent,
    deleteStudent,
    // teacher operations
    addTeacher,
    updateTeacher,
    deleteTeacher,
  };
}
