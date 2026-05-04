export default class AuthResponse {
    constructor(studentName, courseName, iotDeviceName, date, time, status) {
        this.studentName = studentName;
        this.courseName = courseName;
        this.iotDeviceName = iotDeviceName;
        this.date = date;
        this.time = time;
        this.status = status;
    }

    static fromApi(data) {
        return new AuthResponse(
            data.studentName,
            data.courseName,
            data.iotDeviceName,
            data.date,
            data.time,
            data.status
        );
    }
}