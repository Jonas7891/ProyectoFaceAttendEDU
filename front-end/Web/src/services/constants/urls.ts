// ============================================================
//  FaceAttend EDU — URLs del backend (gateway Kong :8080)
//
//  Configura con EXPO_PUBLIC_API_URL. Por defecto el gateway
//  local. Mantiene los nombres legacy pero apuntando a /api/v1.
//  Para endpoints nuevos usa src/api/endpoints.ts.
// ============================================================
import { getApiBaseUrl } from "../../config/env";
import { endpoints } from "../../api/endpoints";

export const urlBase = getApiBaseUrl();

// Nombres legacy → rutas canónicas (compatibilidad con imports existentes)
export const schools = endpoints.academic.schools;
export const persons = endpoints.identity.persons;
export const roles = endpoints.authorization.roles;
export const users = endpoints.identity.users;
export const userRoles = endpoints.authorization.userRoles(":userId") as string;
export const courses = endpoints.academic.courses;
export const classrooms = endpoints.scheduling.environments;
export const periods = endpoints.academic.periods;
export const schedules = endpoints.scheduling.sessions;
export const enrollments = endpoints.academic.enrollments;
export const iotDevices = "/api/v1/iot-devices";
export const attendances = endpoints.attendance.records;
export const justifications = endpoints.attendance.justifications;
export const login = endpoints.identity.login;

export const schoolsUrl = urlBase + schools;
export const personsUrl = urlBase + persons;
export const rolesUrl = urlBase + roles;
export const usersUrl = urlBase + users;
export const userRolesUrl = urlBase + "/api/v1/users/:userId/roles";
export const coursesUrl = urlBase + courses;
export const classroomsUrl = urlBase + classrooms;
export const periodsUrl = urlBase + periods;
export const schedulesUrl = urlBase + schedules;
export const enrollmentsUrl = urlBase + enrollments;
export const iotDevicesUrl = urlBase + iotDevices;
export const attendancesUrl = urlBase + attendances;
export const justificationsUrl = urlBase + justifications;
export const loginUrl = urlBase + login;