// ============================================================
//  FaceAttend EDU — Academic ViewModel
// ============================================================
//  RESPONSABILIDAD: Sección académica en modo lectura
//  (nav-map /academic · mínima rol: alumno, instructor y admin)
//
//  Muestra los programas, períodos, fichas y cursos de la sede.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { academicApi } from "../services/api";
import { getActiveSchool, listCohorts, listCourses, listPrograms, optional } from "../services/api/referenceData";

export function useAcademicViewModel() {
    const { user } = useAuth();
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [courses, setCourses] = useState([]);

    const schoolId = user?.schoolId ?? getActiveSchool();

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [programList, periodList, cohortList, courseList] = await Promise.all([
                optional(listPrograms(), []),
                schoolId != null
                    ? optional(academicApi.listSchoolPeriods(schoolId), [])
                    : Promise.resolve([]),
                optional(listCohorts(), []),
                optional(listCourses(), []),
            ]);
            setPrograms(programList);
            setPeriods(periodList);
            setCohorts(cohortList);
            setCourses(courseList);
        } catch (e) {
            setError(e?.message || t("No se pudo cargar la sección académica."));
        } finally {
            setIsLoading(false);
        }
    }, [schoolId, t]);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const programName = useCallback(
        (programId) => programs.find((p) => Number(p.programId) === Number(programId))?.name || "—",
        [programs]
    );

    return {
        isLoading,
        error,
        programs,
        periods,
        cohorts,
        courses,
        programName,
        refresh: load,
    };
}
