import {request} from "../api/apiClient";
import {DELETE, GET, POST, PUT} from "./constants/httpMethod";
import {attendancesUrl} from "./constants/urls";

export const getAttendanceById = (id) =>
    request({
        method: GET,
        url: `${attendancesUrl}/${id}`,
        requiresAuth: true // 🔐 cuando actives JWT
    });

export const getAllAttendances = () =>
    request({
        method: GET,
        url: attendancesUrl,
        requiresAuth: true
    });

export const createAttendance = (data) =>
    request({
        method: POST,
        url: attendancesUrl,
        data,
        requiresAuth: true
    });

export const updateAttendance = (id, data) =>
    request({
        method: PUT,
        url: `${attendancesUrl}/${id}`,
        data,
        requiresAuth: true
    });

export const deleteAttendance = (id) =>
    request({
        method: DELETE,
        url: `${attendancesUrl}/${id}`,
        requiresAuth: true
    });