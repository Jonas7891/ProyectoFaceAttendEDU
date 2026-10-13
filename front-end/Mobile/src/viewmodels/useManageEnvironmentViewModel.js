import {useCallback, useEffect, useState} from 'react';
import {backendGet} from '../api/backend';
import ENV from '../config/env';
import {EnvironmentService} from '../services/EnvironmentService';
import {ActorService} from '../services/ActorService';
import {SchoolService} from '../services/SchoolService';
import {getCurrentUser} from '../services/UserService';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

function toMapped(r) {
  const id = r.environment_id ?? r.environmentId ?? r.id;
  return {
    id,
    nombre: r.name || r.code || '—',
    ubicacion: r.code || '—',
    capacidad: r.capacity || 0,
    tipo: 'Aula',
    status: r.status,
    schoolId: r.school_id ?? r.schoolId ?? null,
  };
}

// Sede del administrador (decisión de producto): actor propio primero,
// sede única como respaldo; sin sede no hay alta en el backend.
async function resolveSchoolId() {
  try {
    const me = await getCurrentUser();
    if (me?.personId) {
      const actors = await ActorService.getByPerson(me.personId);
      const schoolId = actors?.[0]?.schoolId ?? null;
      if (schoolId != null) return schoolId;
    }
  } catch {}
  const schools = await SchoolService.getAll().catch(() => []);
  if (schools.length === 1 && schools[0]?.schoolId != null) return schools[0].schoolId;
  throw new Error('Sin sede: no se puede gestionar ambientes');
}

export function useManageEnvironmentViewModel(enabled = true) {
    const [ambientes, setAmbientes] = useState([]);
    const [updateKey, setUpdateKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchEnvironments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await backendGet(ENV.ACADEMIC_BASE_URL, 'api/v1/environments', {_limit: 100});
            setAmbientes(unwrap(data).map(toMapped));
        } catch (error) {
            console.error('Error fetching environments:', error);
            setError(error?.message || 'No se pudieron cargar los ambientes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Solo Administrador puede gestionar ambientes: evita la petición
        // mientras la pantalla valida el rol (o si se monta sin permiso).
        if (!enabled) {
            setLoading(false);
            return;
        }
        fetchEnvironments();
    }, [enabled, fetchEnvironments]);

    const searchAmbientes = useCallback(
        (query) => {
            const q = (query || '').trim().toLowerCase();
            if (!q) return ambientes;
            return ambientes.filter((a) => {
                const nombre = (a.nombre || '').toLowerCase();
                const ubicacion = (a.ubicacion || '').toLowerCase();
                return nombre.includes(q) || ubicacion.includes(q);
            });
        },
        [ambientes]
    );

    const addAmbiente = useCallback(async (nuevoAmbiente) => {
        setSaving(true);
        setError(null);
        try {
            const schoolId = await resolveSchoolId();
            const capacity = nuevoAmbiente.capacidad ? Number(nuevoAmbiente.capacidad) : 30;
            if (!Number.isInteger(capacity) || capacity <= 0) {
                throw new Error('Capacidad inválida');
            }
            const created = await EnvironmentService.create({
                schoolId,
                code: nuevoAmbiente.ubicacion,
                name: nuevoAmbiente.nombre,
                capacity,
                status: true,
            });
            const ambiente = toMapped({
                environment_id: created?.environmentId,
                school_id: schoolId,
                code: nuevoAmbiente.ubicacion,
                name: nuevoAmbiente.nombre,
                capacity,
                status: true,
            });
            setAmbientes((prev) => [...prev, ambiente]);
            setUpdateKey((k) => k + 1);
            return ambiente;
        } catch (e) {
            setError(e?.message || 'No se pudo crear el ambiente');
            throw e;
        } finally {
            setSaving(false);
        }
    }, []);

    const updateAmbiente = useCallback(async (ambienteActualizado) => {
        setSaving(true);
        setError(null);
        try {
            const capacity = ambienteActualizado.capacidad ? Number(ambienteActualizado.capacidad) : null;
            await EnvironmentService.update(ambienteActualizado.id, {
                code: ambienteActualizado.ubicacion,
                name: ambienteActualizado.nombre,
                capacity,
            });
            setAmbientes((prev) =>
                prev.map((a) =>
                    a.id === ambienteActualizado.id
                        ? { ...a, ...ambienteActualizado, capacidad: capacity }
                        : a
                )
            );
            setUpdateKey((k) => k + 1);
        } catch (e) {
            setError(e?.message || 'No se pudo actualizar el ambiente');
            throw e;
        } finally {
            setSaving(false);
        }
    }, []);

    const deleteAmbiente = useCallback(async (id) => {
        setSaving(true);
        setError(null);
        try {
            await EnvironmentService.delete(id);
            setAmbientes((prev) => prev.filter((a) => a.id !== id));
            setUpdateKey((k) => k + 1);
        } catch (e) {
            setError(e?.message || 'No se pudo eliminar el ambiente');
            throw e;
        } finally {
            setSaving(false);
        }
    }, []);

    return {
        ambientes, updateKey, loading, error, saving,
        searchAmbientes, addAmbiente, updateAmbiente, deleteAmbiente,
        refresh: fetchEnvironments,
    };
}
