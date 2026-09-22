export interface SignupApiRequest {
    username: string;
    email: string;
    password: string;
}

export default class SignupRequest {
    constructor(
        public username: string,
        public email: string,
        public password: string
    ) {}

    toApi(): SignupApiRequest {
        return {
            username: this.username,
            email: this.email,
            password: this.password
        };
    }
}
