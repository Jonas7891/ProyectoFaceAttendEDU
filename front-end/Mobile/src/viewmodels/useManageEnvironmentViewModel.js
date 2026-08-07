import {useState, useCallback} from 'react';

export function useManageEnvironmentViewModel() {
    const [ambientes, setAmbientes] = useState([]);
    const [updateKey, setUpdateKey] = useState(0);

    const searchAmbientes = useCallback(
        (query) => {
            const q = (query || '').trim().toLowerCase();
            if (!q) return ambientes;

            return ambientes.filter((a) => {
                const nombre = (a.nombre || '').toLowerCase();
                const ubicacion = (a.ubicacion || '').toLowerCase();
                const tipo = (a.tipo || '').toLowerCase();
                return (
                    nombre.includes(q) ||
                    ubicacion.includes(q) ||
                    tipo.includes(q)
                );
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
                    ? {
                        ...a,
                        ...ambienteActualizado,
                        capacidad: ambienteActualizado.capacidad
                            ? Number(ambienteActualizado.capacidad)
                            : null,
                    }
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
        ambientes,
        updateKey,
        searchAmbientes,
        addAmbiente,
        updateAmbiente,
        deleteAmbiente,
    };
}