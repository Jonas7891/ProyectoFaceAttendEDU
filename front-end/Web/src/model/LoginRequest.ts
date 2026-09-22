export interface LoginApiRequest {
    email: string;
    password: string;
}

export default class LoginRequest {
    constructor(
        public email: string,
        public password: string
    ) {}

    toApi(): LoginApiRequest {
        return {
            email: this.email,
            password: this.password
        };
    }
}