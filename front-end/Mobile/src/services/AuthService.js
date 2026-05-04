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
            return {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInN1YiI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiQWRtaW5pc3RyYWRvciJdLCJpYXQiOjE3MzMxMjQ4MDAsImV4cCI6MTczMzIxMTIwMH0.nQAHiV1Y_TPrY_R-7XFkYX3K1iV2KgnFAllmEudxCxs"
            }

        case "teacher@example.com" && "123456":
            return {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInN1YiI6InRlYWNoZXJAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJEb2NlbnRlIl0sImlhdCI6MTczMzEyNDgwMCwiZXhwIjoxNzMzMjExMjAwfQ.VhRgza0MWDNth3POaGgKojMLcwOORPZBiBPR96gn6uY"
            }

        case "student@example.com" && "123456":
            return {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInN1YiI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJFc3R1ZGlhbnRlIl0sImlhdCI6MTczMzEyNDgwMCwiZXhwIjoxNzMzMjExMjAwfQ.XKDCjiwMAIT4AbGZ6MI3Ibyj9uImRL4Ehw9vZG_RsAI"
            }
    }
}
