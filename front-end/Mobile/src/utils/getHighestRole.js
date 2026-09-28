import {DEFAULT_ROLE, ROLES_HIERARCHY} from "../services/constants/rolesHierarchy";

const ROLE_MAP = {
  'ADMIN': 'Administrador',
  'SUPER_ADMIN': 'Administrador',
  'SCHOOL_ADMIN': 'Administrador',
  'RECTOR': 'Administrador',
  'COORDINATOR': 'Administrador',
  'INSTRUCTOR': 'Docente',
  'STUDENT': 'Estudiante',
};

const mapRole = (role) => ROLE_MAP[role] || role;

export const getHighestRole = (roles) => {
    if (!roles || (Array.isArray(roles) && roles.length === 0)) {
        return DEFAULT_ROLE;
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const mapped = rolesArray.map(mapRole);

    for (let i = 0; i < ROLES_HIERARCHY.length; i++) {
        const currentRole = ROLES_HIERARCHY[i];
        if (mapped.includes(currentRole)) {
            return currentRole;
        }
    }

    return DEFAULT_ROLE;
};