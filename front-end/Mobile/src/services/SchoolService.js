import { request } from "../api/apiClient";
import { GET, POST, PUT, DELETE } from "./constants/httpMethod";
import { schoolsUrl } from "./constants/urls";

/*
export const getUserByEmail = (data) =>
    request({
        method: POST,
        url: loginUrl,
        data,
        requiresAuth: true
    });
*/

import { schools } from "./constants/schools";
// import { jwtDecode } from "jwt-decode";
// import { getToken } from "../storage/TokenStorage";

export const getSchoolById = (id) => {
    switch (id) {
        case 1:
            return schools.find((school) => school.identification === 1);

        case 2:
            return schools.find((school) => school.identification === 2);

        case 3:
            return schools.find((school) => school.identification === 3);
    }
}