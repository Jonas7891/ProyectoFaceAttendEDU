import {useCallback, useEffect, useState} from 'react';
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {backendGet} from '../api/backend';
import ENV from '../config/env';
import {PersonService} from '../services/PersonService';
import {UserService, getCurrentUser} from '../services/UserService';
import {ActorService} from '../services/ActorService';
import {SchoolService} from '../services/SchoolService';
import {StaffService} from '../services/StaffService';
import Person from '../models/identity/Person';
import AppUser from '../models/identity/AppUser';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

export function useManageUsersViewModel(enabled = true) {
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

      // Enriquecer por lotes acotados: 50 usuarios x 2 peticiones en un solo
      // Promise.all saturaban el gateway (rate-limit) y dejaban roles y
      // personas en blanco, desclasificando usuarios de ambas listas.
      const ENRICH_CHUNK_SIZE = 10;
      const entries = [];
      for (let i = 0; i < users.length; i += ENRICH_CHUNK_SIZE) {
        const chunk = await Promise.all(users.slice(i, i + ENRICH_CHUNK_SIZE).map(async (u) => {
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
          // Requerido por el PUT (documentNumber @NotBlank): sin esto el
          // guardado de edición respondía 400 siempre.
          documentNumber: person.document_number || person.documentNumber || null,
          nombre: `${person.name || ''} ${person.last_name || person.lastName || ''}`.trim(),
          email: person.email || '',
          telefono: person.phone || '',
          username: u.username,
          status: u.status,
          roleNames,
        };
        }));
        entries.push(...chunk);
      }

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
    // Solo Administrador puede listar/gestionar usuarios: evita la petición
    // mientras la pantalla valida el rol (o si se monta sin permiso).
    if (!enabled) {
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [enabled, fetchUsers]);

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

  const persistPerson = useCallback(async (item) => {
    const nameParts = String(item.nombre || '').trim().split(/\s+/);
    const person = await PersonService.update(item.personId, new Person({
      person_id: item.personId,
      document_number: item.documentNumber,
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

  // El backend no tiene DELETE físico (modelo: borrado lógico vía status,
  // AGENTS.md §2.2): desactivar cambia status=false en usuario y persona y
  // la fila sigue visible como inactiva en vez de desaparecer.
  const setActiveStatus = useCallback(async (item, status) => {
    await UserService.setStatus(item.userId || item.id, status);
    if (item.personId) {
      await PersonService.setStatus(item.personId, status).catch(() => {});
    }
    return {...item, status};
  }, []);

  const deleteStudent = useCallback(async (id) => {
    const student = students.find(item => item.id === id);
    if (!student) return;
    const next = !(student.status !== false);
    const updated = await setActiveStatus(student, next);
    setStudents(prev => prev.map(s => (s.id === id ? updated : s)));
  }, [students, setActiveStatus]);

  // Alta real de personal (docente/administrador): persona + usuario +
  // rol (+ actor si es docente). La sede sale del actor propio o de la
  // sede única como respaldo; sin sede no hay alta de docentes.
  const createStaff = useCallback(async ({nombre, documento, email, telefono, password, role}) => {
    let schoolId = null;
    try {
      const me = await getCurrentUser();
      if (me?.personId) {
        const actors = await ActorService.getByPerson(me.personId);
        schoolId = actors?.[0]?.schoolId ?? null;
      }
    } catch {}
    if (schoolId == null && role === 'teacher') {
      const schools = await SchoolService.getAll().catch(() => []);
      if (schools.length === 1) schoolId = schools[0]?.schoolId ?? null;
    }
    await StaffService.createStaff({
      name: nombre,
      code: documento,
      documentNumber: documento,
      email,
      phone: telefono || null,
      password,
      role,
      schoolId,
    });
    await fetchUsers();
  }, [fetchUsers]);

  const updateTeacher = useCallback(async (teacher) => {
    const updated = await persistPerson(teacher);
    setTeachers(prev => prev.map(t => (t.id === teacher.id ? updated : t)));
  }, [persistPerson]);

  const deleteTeacher = useCallback(async (id) => {
    const teacher = teachers.find(item => item.id === id);
    if (!teacher) return;
    const next = !(teacher.status !== false);
    const updated = await setActiveStatus(teacher, next);
    setTeachers(prev => prev.map(t => (t.id === id ? updated : t)));
  }, [teachers, setActiveStatus]);

  return {
    allStudents: students,
    students,
    teachers,
    loading,
    updateKey,
    searchStudents,
    searchTeachers,
    createStaff,
    updateStudent,
    deleteStudent,
    updateTeacher,
    deleteTeacher,
    refresh: fetchUsers,
  };
}
