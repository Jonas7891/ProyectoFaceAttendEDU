import {useCallback, useEffect, useState} from 'react';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {backendGet} from '../api/backend';
import ENV from '../config/env';
import {PersonService} from '../services/PersonService';
import {UserService} from '../services/UserService';
import Person from '../models/identity/Person';
import AppUser from '../models/identity/AppUser';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

export function useManageUsersViewModel() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const updateKey = useLanguageRefresh();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Contratos gateway Kong: GET /api/v1/users?page=&limit=, GET
      // /api/v1/users/{id}/roles -> [{roleId, roleName}], GET /api/v1/persons/{id}.
      const usersData = await backendGet(ENV.API_BASE_URL, 'api/v1/users', {page: 1, limit: 50});
      const users = unwrap(usersData);

      const entries = await Promise.all(users.map(async (u) => {
        const uid = u.user_id || u.userId;
        const pid = u.person_id || u.personId;
        let roleNames = [];
        try {
          const roles = unwrap(await backendGet(ENV.API_BASE_URL, `api/v1/users/${uid}/roles`));
          roleNames = roles.map(r => r.roleName || r.role_name).filter(Boolean);
        } catch {
          roleNames = [];
        }
        let person = {};
        if (pid) {
          try {
            const personArr = unwrap(await backendGet(ENV.API_BASE_URL, `api/v1/persons/${pid}`));
            person = personArr[0] || {};
          } catch {
            person = {};
          }
        }
        return {
          id: uid,
          userId: uid,
          personId: pid,
          nombre: `${person.name || ''} ${person.last_name || person.lastName || ''}`.trim(),
          email: person.email || '',
          telefono: person.phone || '',
          username: u.username,
          status: u.status,
          roleNames,
        };
      }));

      const isStudent = (e) => e.roleNames.some(n => String(n).toLowerCase() === 'aprendiz');
      const isTeacher = (e) => e.roleNames.some(n => ['instructor', 'administrador'].includes(String(n).toLowerCase()));
      setStudents(entries.filter(isStudent).map(e => ({...e, grado: '—'})));
      setTeachers(entries.filter(e => !isStudent(e) && isTeacher(e)).map(e => ({...e, materia: '—'})));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const searchStudents = useCallback((query) => {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return students.filter(s => (s.nombre || '').toLowerCase().includes(q));
  }, [students]);

  const searchTeachers = useCallback((query) => {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return teachers.filter(teacher => (teacher.nombre || '').toLowerCase().includes(q));
  }, [teachers]);

  const addStudentById = useCallback((id) => {
    const found = students.find(s => s.id === id);
    if (!found) return null;
    return found;
  }, [students]);

  const persistPerson = useCallback(async (item) => {
    const nameParts = String(item.nombre || '').trim().split(/\s+/);
    const person = await PersonService.update(item.personId, new Person({
      person_id: item.personId,
      name: nameParts.shift() || '',
      last_name: nameParts.join(' '),
      email: item.email || null,
      phone: item.telefono || null,
    }));
    await UserService.update(item.userId || item.id, new AppUser({
      user_id: item.userId || item.id,
      person_id: item.personId,
      status: item.status,
    }));
    return {...item, nombre: person?.fullName || item.nombre};
  }, []);

  const updateStudent = useCallback(async (student) => {
    const updated = await persistPerson(student);
    setStudents(prev => prev.map(s => (s.id === student.id ? updated : s)));
  }, [persistPerson]);

  const deleteStudent = useCallback(async (id) => {
    const student = students.find(item => item.id === id);
    if (student) {
      await UserService.delete(student.userId || id);
      if (student.personId) await PersonService.delete(student.personId);
    }
    setStudents(prev => prev.filter(s => s.id !== id));
  }, [students]);

  const addTeacher = useCallback((teacher) => {
    setTeachers(prev => prev.some(item => item.id === teacher.id) ? prev : [...prev, teacher]);
    return teacher;
  }, []);

  const updateTeacher = useCallback(async (teacher) => {
    const updated = await persistPerson(teacher);
    setTeachers(prev => prev.map(t => (t.id === teacher.id ? updated : t)));
  }, [persistPerson]);

  const deleteTeacher = useCallback(async (id) => {
    const teacher = teachers.find(item => item.id === id);
    if (teacher) {
      await UserService.delete(teacher.userId || id);
      if (teacher.personId) await PersonService.delete(teacher.personId);
    }
    setTeachers(prev => prev.filter(t => t.id !== id));
  }, [teachers]);

  return {
    allStudents: students,
    students,
    teachers,
    loading,
    updateKey,
    searchStudents,
    searchTeachers,
    addStudentById,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    refresh: fetchUsers,
  };
}
