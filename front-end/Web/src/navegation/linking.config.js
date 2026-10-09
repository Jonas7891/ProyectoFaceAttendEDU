// ============================================================
//  FaceAttend EDU — Deep Linking Configuration
// ============================================================
//  RESPONSABILIDAD: Configuración de URLs y deep linking
//
//  Este archivo mapea URLs a screens de la aplicación.
//  Permite navegación directa por URL y compartir links.
//
//  Estructura de URLs:
//  / → Landing
//  /login → Login
//  /register → Signup
//  /app → Dashboard (autenticado)
//  /app/students → Students
//  /app/courses → Courses
//  /app/environments → Environments
//  /app/reports → Reports
//  /app/settings/:section? → Settings con sección opcional
// ============================================================

/**
 * Configuración de linking para React Navigation
 * 
 * @see https://reactnavigation.org/docs/configuring-links
 */
export const linkingConfig = {
    // Prefixes para deep linking (web, app schemes)
    prefixes: [
        'http://localhost:8081',
        'http://localhost:19006',
        'https://faceattend.edu',
        'faceattend://',
    ],
    
    // Configuración de rutas
    config: {
        screens: {
            // ── Rutas públicas ────────────────────────────────
            FaceAttendEDU: '',  // Landing page en /
            'FaceAttendEDU-Login': 'login',
            'FaceAttendEDU-Register': 'register',
            
            // ── Rutas autenticadas ────────────────────────────
            // Nested navigator para rutas protegidas bajo /app
            'FaceAttendEDU-Dashboard': {
                path: 'app',
                screens: {
                    Dashboard: '',  // /app → Dashboard por defecto
                    Users: {
                        path: 'users/:section?',  // /app/users o /app/users/teachers
                        parse: {
                            // Parsear el parámetro section desde la URL
                            section: (section) => section || null,
                        },
                        stringify: {
                            // Convertir el parámetro section a string para la URL
                            section: (section) => section || '',
                        },
                    },
                    Courses: 'courses',  // /app/courses
                    Environments: 'environments',  // /app/environments
                    Reports: 'reports',  // /app/reports
                    History: 'history',  // /app/history
                    Justifications: 'justifications',  // /app/justifications
                    SchoolInfo: 'school-info',  // /app/school-info
                    Academic: 'academic',  // /app/academic
                    Contacts: 'contacts',  // /app/contacts
                    Biometrics: {
                        // /app/biometrics, /app/biometrics/face-login, /app/biometrics/fingerprint
                        path: 'biometrics/:section?',
                        parse: {
                            section: (section) => section || null,
                        },
                        stringify: {
                            section: (section) => section || '',
                        },
                    },
                    Settings: {
                        path: 'settings/:section?',  // /app/settings o /app/settings/general
                        parse: {
                            // Parsear el parámetro section desde la URL
                            section: (section) => section || null,
                        },
                        stringify: {
                            // Convertir el parámetro section a string para la URL
                            section: (section) => section || '',
                        },
                    },
                },
            },
        },
    },
    
    // Configuración adicional
    /**
     * getStateFromPath - Personaliza cómo se parsea la URL a estado de navegación
     * Útil para transformaciones complejas o validaciones
     */
    // getStateFromPath: (path, options) => {
    //     // Custom logic aquí si es necesario
    //     return defaultGetStateFromPath(path, options);
    // },
    
    /**
     * getPathFromState - Personaliza cómo se genera la URL desde el estado
     * Útil para generar URLs más limpias o con query params
     */
    // getPathFromState: (state, options) => {
    //     // Custom logic aquí si es necesario
    //     return defaultGetPathFromState(state, options);
    // },
};

/**
 * Hook para obtener la URL actual
 * Útil para compartir links o copiar URLs
 */
export function useCurrentUrl() {
    const [url, setUrl] = React.useState('');
    
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setUrl(window.location.href);
        }
    }, []);
    
    return url;
}

/**
 * Función helper para construir URLs programáticamente
 * 
 * @param {string} screen - Nombre del screen
 * @param {object} params - Parámetros opcionales
 * @returns {string} URL completa
 * 
 * @example
 * buildUrl('Settings', { section: 'general' })
 * // → /app/settings/general
 */
export function buildUrl(screen, params = {}) {
    const routes = {
        'FaceAttendEDU': '/',
        'FaceAttendEDU-Login': '/login',
        'FaceAttendEDU-Register': '/register',
        'Dashboard': '/app',
        'Users': params.section ? `/app/users/${params.section}` : '/app/users',
        'Courses': '/app/courses',
        'Environments': '/app/environments',
        'Reports': '/app/reports',
        'History': '/app/history',
        'Justifications': '/app/justifications',
        'SchoolInfo': '/app/school-info',
        'Academic': '/app/academic',
        'Contacts': '/app/contacts',
        'Biometrics': params.section ? `/app/biometrics/${params.section}` : '/app/biometrics',
        'Settings': params.section ? `/app/settings/${params.section}` : '/app/settings',
    };
    
    return routes[screen] || '/';
}
