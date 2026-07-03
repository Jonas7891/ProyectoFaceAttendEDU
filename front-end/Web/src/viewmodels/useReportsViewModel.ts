// ============================================================
//  FaceAttend EDU — Reports ViewModel
// ============================================================

import { useState, useMemo } from "react";
import { useTheme } from "../view/components/hooks/useTheme";
import { useTranslation } from "../i18n/hooks/useTranslation";
import {
    mockStudents, mockCourses,
    mockAttendanceByDay, mockAttendanceByWeek, mockCourseAttendance,
} from "../models/data/mockData";
import type { Period, DailyAttendance, WeeklyAttendance } from "../models/types";

export interface PeriodOption {
    value: Period;
    label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
    { value: "week",     label: "Esta semana" },
    { value: "month",    label: "Este mes"    },
    { value: "semester", label: "Semestre"    },
];

export interface ReportStat {
    label:        string;
    value:        string | number;
    change?:      number;
    changeLabel?: string;
    color:        string;
    icon:         string;
}

export interface DistributionItem {
    name:  string;
    value: number;
    color: string;
}

export interface CourseRankingItem {
    code:       string;
    courseName: string;
    rate:       number;
    barColor:   string;
    rank:       number;
}

export interface ReportsViewModel {
    period:          Period;
    setPeriod:       (p: Period) => void;
    stats:           ReportStat[];
    distribution:    DistributionItem[];
    attendanceByDay: DailyAttendance[];
    attendanceByWeek: WeeklyAttendance[];
    courseRanking:   CourseRankingItem[];
    atRiskStudents:  typeof mockStudents;
}

export function useReportsViewModel(): ReportsViewModel {
    const [period, setPeriod] = useState<Period>("semester");
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c = theme.colors;

    const atRiskStudents = useMemo(
        () => mockStudents.filter(s => s.attendance < 75),
        []
    );

    const stats: ReportStat[] = useMemo(() => [
        { label: t("Asistencia global"), value: "85.4%", change: 1.2,  changeLabel: t("vs período ant."), color: c.brand.primary,  icon: "trending-up"  },
        { label: t("Total registros"),   value: "2,847", change: 5.8,  changeLabel: t("vs período ant."), color: c.states.success, icon: "users"         },
        { label: t("Tardanzas"),         value: "324",   change: -3.1, changeLabel: t("vs período ant."), color: c.states.warning, icon: "calendar"      },
        { label: t("En riesgo"),         value: atRiskStudents.length,  color: c.states.danger, icon: "alert-circle" },
    ], [c, t, atRiskStudents.length]);

    const distribution: DistributionItem[] = useMemo(() => [
        { name: t("A tiempo"),  value: 72, color: c.states.success },
        { name: t("Tardanzas"), value: 13, color: c.states.warning },
        { name: t("Ausentes"),  value: 15, color: c.states.danger  },
    ], [c, t]);

    const courseRanking: CourseRankingItem[] = useMemo(() =>
        mockCourseAttendance.map((item, rank) => {
            const course   = mockCourses.find(x => x.code === item.course);
            const barColor = item.rate >= 85 ? c.states.success : c.states.warning;
            return {
                code:       item.course,
                courseName: course?.name ?? item.course,
                rate:       item.rate,
                barColor,
                rank:       rank + 1,
            };
        }),
        [c]
    );

    return {
        period,
        setPeriod,
        stats,
        distribution,
        attendanceByDay:  mockAttendanceByDay,
        attendanceByWeek: mockAttendanceByWeek,
        courseRanking,
        atRiskStudents,
    };
}
