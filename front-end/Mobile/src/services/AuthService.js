import { request } from "../api/apiClient";
import { GET, POST, PUT, DELETE } from "./constants/httpMethod";
import { loginUrl } from "./constants/urls";

export const login = (data) =>
    request({
        method: POST,
        url: loginUrl,
        data,
        requiresAuth: true
    });