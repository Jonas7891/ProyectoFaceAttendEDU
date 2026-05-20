import { request } from "../api/apiClient";
import { GET, POST, PUT, DELETE } from "./constants/httpMethod";
import { loginUrl } from "./constants/urls";

/*
export const getUserByEmail = (data) =>
    request({
        method: POST,
        url: loginUrl,
        data,
        requiresAuth: true
    });
*/

import { users } from "./constants/users";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../storage/TokenStorage";

export const getUserByEmail = (email) => {
    switch (email) {
        case "admin@example.com":
            return users.find((user) => user.identification === 1);

        case "teacher@example.com":
            return users.find((user) => user.identification === 2);

        case "student@example.com":
            return users.find((user) => user.identification === 3);
    }
}

export const getCurrentUser = async () => {
    try {
        const token = await getToken();
        if (!token) return null;

        const decoded = jwtDecode(token);

        return {
            userId: decoded.userId,
            email: decoded.sub,
            roles: decoded.roles || [],
        };
    } catch (error) {
        console.error("Error obteniendo usuario actual:", error);
        return null;
    }
};

export const getCurrentUserRole = async () => {
    const user = await getCurrentUser();
    if (!user?.roles?.length) return null;

    const { getHighestRole } = require("../utils/getHighestRole");
    return getHighestRole(user.roles);
};

export const hasRole = async (roleName) => {
    const user = await getCurrentUser();
    return user?.roles?.includes(roleName) ?? false;
};

export const isAdmin = async () => {
    return await hasRole("Administrador");
};