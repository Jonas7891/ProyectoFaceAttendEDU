// ============================================================
//  FaceAttend EDU — Deep linking (web + móvil)
//
//  Hace el enrutado funcional en web: /, /login, /register,
//  /recovery, /dashboard. React Navigation lo usa vía NavigationContainer.
//  En Docker/nginx el fallback SPA (try_files) redirige aquí.
// ============================================================

export const RouteNames = {
    landing: "FaceAttendEDU",
    login: "FaceAttendEDU-Login",
    register: "FaceAttendEDU-Register",
    recovery: "FaceAttendEDU-Recovery",
    dashboard: "FaceAttendEDU-Dashboard",
} as const;

export const linking = {
    prefixes: ["http://localhost:3000", "http://localhost:8090", "http://localhost"],
    config: {
        screens: {
            [RouteNames.landing]: "",
            [RouteNames.login]: "login",
            [RouteNames.register]: "register",
            [RouteNames.recovery]: "recovery",
            [RouteNames.dashboard]: "dashboard",
        },
    },
};
