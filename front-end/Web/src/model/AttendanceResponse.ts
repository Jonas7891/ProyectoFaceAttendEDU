interface AttendanceApiResponse {
    studentName: string;
    courseName: string;
    iotDeviceName: string;
    date: string;
    time: string;
    status: string;
}

export default class AttendanceResponse {
    constructor(
        public studentName: string,
        public courseName: string,
        public iotDeviceName: string,
        public date: string,
        public time: string,
        public status: string
    ) {}

    static fromApi(data: AttendanceApiResponse): AttendanceResponse {
        return new AttendanceResponse(
            data.studentName,
            data.courseName,
            data.iotDeviceName,
            data.date,
            data.time,
            data.status
        );
    }
}