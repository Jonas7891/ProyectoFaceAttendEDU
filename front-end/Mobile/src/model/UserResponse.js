export default class UserResponse {
    constructor(name, role, email, identification, school) {
        this.name = name;
        this.role = role;
        this.email = email;
        this.identification = identification;
        this.school = school;
    }

    static fromApi(data) {
        return new UserResponse(
            data.name,
            data.role,
            data.email,
            data.identification,
            data.school
        );
    }
}