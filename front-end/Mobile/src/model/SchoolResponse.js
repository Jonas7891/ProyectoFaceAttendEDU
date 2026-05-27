export default class SchoolResponse {
    constructor(generalInfo, contactInfo, academicConfig, attendanceConfig) {
        this.generalInfo = generalInfo;
        this.contactInfo = contactInfo;
        this.academicConfig = academicConfig;
        this.attendanceConfig = attendanceConfig;
    }

    static fromApi(data) {
        return new SchoolResponse(
            data.generalInfo,
            data.contactInfo,
            data.academicConfig,
            data.attendanceConfig
        );
    }
}

export class GeneralInfo {
    constructor(name, code, district) {
        this.name = name;
        this.code = code;
        this.district = district;
    }

    static fromApi(data) {
        return new GeneralInfo(
            data.name,
            data.code,
            data.district
        );
    }
}

export class ContactInfo {
    constructor(email, phone, address, city, country) {
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.country = country;
    }

    static fromApi(data) {
        return new ContactInfo(
            data.email,
            data.phone,
            data.address,
            data.city,
            data.country
        );
    }
}

export class AcademicConfig {
        constructor(academicYear, totalStudents, totalTeachers, totalCourses, startDate, endDate) {
            this.academicYear = academicYear;
            this.totalStudents = totalStudents;
            this.totalTeachers = totalTeachers;
            this.totalCourses = totalCourses;
            this.startDate = startDate;
            this.endDate = endDate;
        }

        static fromApi(data) {
            return new AcademicConfig(
                data.academicYear,
                data.totalStudents,
                data.totalTeachers,
                data.totalCourses,
                data.startDate,
                data.endDate
            );
        }
}

export class AttendanceConfig {
    constructor(biometricRequired, toleranceMinutes, maxAbsences, maxLatenesses, justificationDaysLimit, requireDocumentation, enableNotifications) {
        this.biometricRequired = biometricRequired;
        this.toleranceMinutes = toleranceMinutes;
        this.maxAbsences = maxAbsences;
        this.maxLatenesses = maxLatenesses;
        this.justificationDaysLimit = justificationDaysLimit;
        this.requireDocumentation = requireDocumentation;
        this.enableNotifications = enableNotifications;
    }

    static fromApi(data) {
        return new AttendanceConfig(
            data.biometricRequired,
            data.toleranceMinutes,
            data.maxAbsences,
            data.maxLatenesses,
            data.justificationDaysLimit,
            data.requireDocumentation,
            data.enableNotifications
        );
    }
}