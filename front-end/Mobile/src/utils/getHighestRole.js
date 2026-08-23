import {DEFAULT_ROLE, ROLES_HIERARCHY} from "../services/constants/rolesHierarchy";

export const getHighestRole = (roles) => {
    // Si no hay roles o es vacío, devolvemos el rol por defecto
    if (!roles || (Array.isArray(roles) && roles.length === 0)) {
        return DEFAULT_ROLE;
    }

    // Aseguramos que sea un array (si viene "Administrador" -> ["Administrador"])
    const rolesArray = Array.isArray(roles) ? roles : [roles];

    // Recorremos la jerarquía en orden: primero el más alto
    for (let i = 0; i < ROLES_HIERARCHY.length; i++) {
        const currentRole = ROLES_HIERARCHY[i];
        if (rolesArray.includes(currentRole)) {
            return currentRole; // devolvemos el primero que coincida (el más alto)
        }
    }

    // Si ningún rol del usuario coincide con la jerarquía, devolvemos el por defecto
    return DEFAULT_ROLE;
};