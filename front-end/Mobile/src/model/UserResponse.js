export default class UserResponse {
    constructor(name, role, email, identification, school_id) {
        this.name = name;
        this.role = role;
        this.email = email;
        this.identification = identification;
        this.school_id = school_id;
    }

    static fromApi(data) {
        return new UserResponse(
            data.name,
            data.role,
            data.email,
            data.identification,
            data.school_id
        );
    }
}