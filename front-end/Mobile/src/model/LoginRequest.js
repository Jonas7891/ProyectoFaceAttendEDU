export default class LoginRequest {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }

    toApi() {
        return {
            email: this.email,
            password: this.password
        };
    }
}