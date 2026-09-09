/*
export const login = (data) =>
    request({
        method: POST,
        url: loginUrl,
        data,
        requiresAuth: true
    });
*/
import {auths} from "./constants/auths";

export const login = (data) => {

    const auth = auths[data.email];

    if (auth && auth.password === data.password) {
        return { token: auth.token };
    }

    throw new Error("Credenciales inválidas");
};
