// ============================================================
//  FaceAttend EDU — Dashboard ViewModel
// ============================================================

import { useMemo } from "react";
import { useTheme } from "../view/components/hooks/useTheme";
import { useTranslation } from "../i18n/hooks/useTranslation";
import {
    mockStudents, mockCourses,
    mockAttendanceByDay, mockAttendanceByWeek,
    mockCourseAttendance, mockRecentActivity,
} from "../models/data/mockData";
import type { DailyAttendance, WeeklyAttendance, CourseAttendance, AttendanceRecord } from "../models/types";

export interface DashboardStat {
    label:       string;
    value:       string | number;
    change?:     number;
    changeLabel?: string;
    color:       string;
    icon:        string;   // feather icon name
}

export interface DashboardViewModel {
    todayLabel:      string;
    stats:           DashboardStat[];
    attendanceByDay: DailyAttendance[];
    attendanceByWeek: WeeklyAttendance[];
    courseAttendance: (CourseAttendance & { courseName: string; barColor: string })[];
    recentActivity:  AttendanceRecord[];
}

export function useDashboardViewModel(): DashboardViewModel {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c = theme.colors;

    const todayLabel = useMemo(() => {
        const d = new Date().toLocaleDateString("es-CO", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
        });
        return d.charAt(0).toUpperCase() + d.slice(1);
    }, []);

    const stats: DashboardStat[] = useMemo(() => [
        {
            label: t("Total estudiantes"),
            value: mockStudents.length,
            change: 2.4, changeLabel: t("este mes"),
            color: c.brand.primary,
            icon:  "users",
        },
        {
            label: t("Cursos activos"),
            value: mockCourses.length,
            color: c.states.success,
            icon:  "book-open",
        },
        {
            label: t("Asistencia prom."),
            value: "85.4%",
            change: 1.2, changeLabel: t("vs sem. ant."),
            color: "#8B5CF6",
            icon:  "trending-up",
        },
        {
            label: t("Alertas"),
            value: "3",
            change: -8, changeLabel: t("vs sem. ant."),
            color: c.states.warning,
            icon:  "alert-circle",
        },
    ], [c, t]);

    const courseAttendance = useMemo(() =>
        mockCourseAttendance.map(item => {
            const course = mockCourses.find(x => x.code === item.course);
            const barColor = item.rate >= 85 ? c.states.success
                : item.rate >= 75 ? c.states.warning
                : c.states.danger;
            return { ...item, courseName: course?.name ?? item.course, barColor };
        }),
        [c]
    );

    return {
        todayLabel,
        stats,
        attendanceByDay:  mockAttendanceByDay,
        attendanceByWeek: mockAttendanceByWeek,
        courseAttendance,
        recentActivity:   mockRecentActivity,
    };
}
