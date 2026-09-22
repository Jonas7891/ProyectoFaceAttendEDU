import {useCallback, useEffect, useState} from 'react';
import {request, GET} from '../api/apiClient';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

export function useManageEnvironmentViewModel() {
    const [ambientes, setAmbientes] = useState([]);
    const [updateKey, setUpdateKey] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchEnvironments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await request({ method: GET, url: 'environment', params: { _limit: 100 }, requiresAuth: false });
            const records = unwrap(data);
            const mapped = records.map(r => ({
                id: r.environment_id || r.id,
                nombre: r.name || r.code || '—',
                ubicacion: r.code || '—',
                capacidad: r.capacity || 0,
                tipo: 'Aula',
                status: r.status,
            }));
            setAmbientes(mapped);
        } catch (error) {
            console.error('Error fetching environments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEnvironments();
    }, []);

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

    const addAmbiente = useCallback((nuevoAmbiente) => {
        const ambiente = {
            id: Date.now().toString(),
            nombre: nuevoAmbiente.nombre,
            ubicacion: nuevoAmbiente.ubicacion,
            capacidad: nuevoAmbiente.capacidad ? Number(nuevoAmbiente.capacidad) : null,
            tipo: nuevoAmbiente.tipo,
        };
        setAmbientes((prev) => [...prev, ambiente]);
        setUpdateKey((k) => k + 1);
        return ambiente;
    }, []);

    const updateAmbiente = useCallback((ambienteActualizado) => {
        setAmbientes((prev) =>
            prev.map((a) =>
                a.id === ambienteActualizado.id
                    ? { ...a, ...ambienteActualizado, capacidad: ambienteActualizado.capacidad ? Number(ambienteActualizado.capacidad) : null }
                    : a
            )
        );
        setUpdateKey((k) => k + 1);
    }, []);

    const deleteAmbiente = useCallback((id) => {
        setAmbientes((prev) => prev.filter((a) => a.id !== id));
        setUpdateKey((k) => k + 1);
    }, []);

    return {
        ambientes, updateKey, loading,
        searchAmbientes, addAmbiente, updateAmbiente, deleteAmbiente,
        refresh: fetchEnvironments,
    };
}
