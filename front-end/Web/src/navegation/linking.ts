// ============================================================
//  FaceAttend EDU — Deep linking (web + móvil)
//
//  Hace el enrutado funcional en web: /, /login, /register,
//  /dashboard. React Navigation lo usa vía NavigationContainer.
//  En Docker/nginx el fallback SPA (try_files) redirige aquí.
// ============================================================

export const RouteNames = {
    landing: "FaceAttendEDU",
    login: "FaceAttendEDU-Login",
    register: "FaceAttendEDU-Register",
    dashboard: "FaceAttendEDU-Dashboard",
} as const;

export const linking = {
    prefixes: ["http://localhost:3000", "http://localhost:8082", "http://localhost"],
    config: {
        screens: {
            [RouteNames.landing]: "",
            [RouteNames.login]: "login",
            [RouteNames.register]: "register",
            [RouteNames.dashboard]: "dashboard",
        },
    },
};
