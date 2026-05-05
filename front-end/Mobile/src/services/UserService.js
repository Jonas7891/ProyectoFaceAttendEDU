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

import { users } from "./constants/users";

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
