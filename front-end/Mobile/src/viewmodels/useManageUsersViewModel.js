import {useCallback, useEffect, useState} from 'react';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {backendGet, ENV} from '../api/backend';
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
      const usersData = await backendGet(ENV.API_BASE_URL, 'api/v1/app-users', {_limit: 50});
      const users = unwrap(usersData);

      const personIds = users.map(u => u.person_id).filter(Boolean);
      const studentsList = [];
      const teachersList = [];

      for (const userId of users.map(u => u.user_id)) {
        const rolesData = await backendGet(ENV.AUTHZ_BASE_URL, 'api/v1/user-roles', {user_id: userId});
        const roles = unwrap(rolesData);
        const roleIds = roles.map(r => r.role_id);

        for (const user of users.filter(u => u.user_id === userId)) {
          const personData = await backendGet(ENV.API_BASE_URL, 'api/v1/persons', {person_id: user.person_id});
          const personArr = unwrap(personData);
          const person = personArr[0] || {};

          const entry = {
            id: user.user_id,
            userId: user.user_id,
            personId: user.person_id,
            nombre: `${person.name || ''} ${person.last_name || ''}`.trim(),
            email: person.email || '',
            telefono: person.phone || '',
            username: user.username,
            status: user.status,
          };

          if (roleIds.includes(5)) {
            studentsList.push({ ...entry, grado: '—' });
          } else if (roleIds.includes(4) || roleIds.includes(1)) {
            teachersList.push({ ...entry, materia: '—' });
          }
        }
      }

      setStudents(studentsList);
      setTeachers(teachersList);
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
