//
//
// Lógica verdadera
//
//

import { auths } from "./constants/auths";

export const login = (data) => {
    const auth = auths[data.email];

    if (auth && auth.password === data.password) {
        return { token: auth.token };
    }

    throw new Error ("Credenciales invalidas");
};

export const register = (data) => {
    // Simular registro - en producción esto iría al backend
    const { username, email, password } = data;

    // Validar que el email no exista ya
    if (auths[email]) {
        throw new Error("El correo electrónico ya está registrado");
    }

    // Validar formato básico
    if (!email.includes("@") || !email.includes(".")) {
        throw new Error("Correo electrónico inválido");
    }

    if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    // Simular creación de usuario - en producción el backend retornaría el token
    // Para demo, retornamos un token genérico de "Estudiante" para nuevos usuarios
    const newUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMCwic3ViIjoi" + btoa(email) + "Iiwicm9sZXMiOlsiRXN0dWRpYW50ZSJdLCJpYXQiOjE3MzMxMjQ4MDAsImV4cCI6MTczMzIxMTIwMH0.newUserToken";

    return { token: newUserToken };
};
