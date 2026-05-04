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

export const login = (data) => {
    switch (data.email && data.password) {
        case "admin@example.com" && "123456":
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJBZG1pbmlzdHJhZG9yIl0sImlhdCI6MTczMzEyNDgwMCwiZXhwIjoxNzMzMjExMjAwfQ.OLC4YfSyhFuqgWfAVXEEE9d7JWlQ6_2E4qd9w4aeBe4"
        case "teacher@example.com" && "123456":
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVhY2hlckBleGFtcGxlLmNvbSIsInJvbGVzIjpbIkRvY2VudGUiXSwiaWF0IjoxNzMzMTI0ODAwLCJleHAiOjE3MzMyMTEyMDB9.6wDEzMGdUZ1yZ-8P73GCETKIQ0Jmtl96xG5yphRGG4E"
        case "student@example.com" && "123456":
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoic3R1ZGVudEBleGFtcGxlLmNvbSIsInJvbGVzIjpbIkVzdHVkaWFudGUiXSwiaWF0IjoxNzMzMTI0ODAwLCJleHAiOjE3MzMyMTEyMDB9.gG4Z1YwvLi8vkGVl08QFDXeGIwjkX78C1gL6VIp7NWk"
    }
}