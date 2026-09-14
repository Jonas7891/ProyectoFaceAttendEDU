import {useCallback, useEffect, useState} from 'react';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {request, GET} from '../api/apiClient';

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
      const usersData = await request({ method: GET, url: 'app_user', params: { _limit: 50 }, requiresAuth: false });
      const users = unwrap(usersData);

      const personIds = users.map(u => u.person_id).filter(Boolean);
      const studentsList = [];
      const teachersList = [];

      for (const userId of users.map(u => u.user_id)) {
        const rolesData = await request({ method: GET, url: 'user_role', params: { user_id: userId }, requiresAuth: false });
        const roles = unwrap(rolesData);
        const roleIds = roles.map(r => r.role_id);

        for (const user of users.filter(u => u.user_id === userId)) {
          const personData = await request({ method: GET, url: 'person', params: { person_id: user.person_id }, requiresAuth: false });
          const personArr = unwrap(personData);
          const person = personArr[0] || {};

          const entry = {
            id: user.user_id,
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

  const addStudentById = useCallback((id) => {
    const found = students.find(s => s.id === id);
    if (!found) return null;
    return found;
  }, [students]);

  const updateStudent = useCallback((student) => {
    setStudents(prev => prev.map(s => (s.id === student.id ? student : s)));
  }, []);

  const deleteStudent = useCallback((id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

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

  return {
    allStudents: students,
    students,
    teachers,
    loading,
    updateKey,
    searchStudents,
    addStudentById,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    refresh: fetchUsers,
  };
}
