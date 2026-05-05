import { request } from "../api/apiClient";
import { GET, POST, PUT, DELETE } from "./constants/httpMethod";
import { loginUrl } from "./constants/urls";

/*
export const login = (data) =>
    request({
        method: POST,
        url: loginUrl,
        data,
        requiresAuth: true
    });
*/

import { auths } from "./constants/auths";

export const login = (data) => {
    console.log("Correo: ", data.email);
    console.log("Contraseña: ", data.password);

    const auth = auths[data.email];

    if (auth && auth.password === data.password) {
        return { token: auth.token };
    }

    throw new Error("Credenciales inválidas");
};
