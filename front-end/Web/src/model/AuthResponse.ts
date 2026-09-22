import { jwtDecode } from "jwt-decode";

interface AuthApiResponse {
    token: string;
    user?: string;
}

interface DecodedToken {
    roles?: string[];
    sub?: string;
    userId?: string;
}

interface UserData {
    roles: string[];
    email?: string;
    userId?: string;
}

export default class AuthResponse {
    constructor(
        public token: string,
        public user: UserData[]  // ✅ Ahora es un arreglo
    ) {}

    static fromApi(data: AuthApiResponse): AuthResponse {
        const token = data.token;
        let user: UserData[] = [];  // ✅ Inicializar como arreglo vacío

        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);

                user = [{
                    roles: decoded.roles || [],
                    email: decoded.sub || "",
                    userId: decoded.userId
                }];  // ✅ Envolver en un arreglo
            } catch (e) {
                console.warn("Error decodificando token", e);
            }
        }

        return new AuthResponse(
            token,
            user
        );
    }
}