import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../view/components/common/ThemeContext";
import { getCurrentUser, getCurrentUserRole } from "../services/UserService";
import { ActorService } from "../services/ActorService";
import { getHighestRole } from "../utils/getHighestRole";
import { backendGet } from "../api/backend";
import ENV from "../config/env";

const ACAD = () => ENV.ACADEMIC_BASE_URL;
const SCHED = () => ENV.SCHEDULING_BASE_URL;

function first(data) {
  if (Array.isArray(data)) return data[0] ?? null;
  if (data && typeof data === "object") return data;
  return null;
}

function pick(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

async function safe(promise) {
  try {
    return await promise;
  } catch {
    return null;
  }
}

// Ficha + programa + cursos de una cohorte. Todo en paralelo: en serie,
// cada ficha costaba 3 viajes encadenados y la pantalla no cargaba.
async function fetchCohortBundle(cohortId) {
  const cohort = first(await safe(backendGet(ACAD(), `api/v1/cohorts/${cohortId}`)));
  if (!cohort) return null;
  const programId = pick(cohort, "program_id", "programId");
  const [programRaw, coursesRaw] = await Promise.all([
    programId ? safe(backendGet(ACAD(), `api/v1/programs/${programId}`)) : null,
    programId ? safe(backendGet(ACAD(), `api/v1/programs/${programId}/courses`)) : null,
  ]);
  const program = first(programRaw);
  const courses = (Array.isArray(coursesRaw) ? coursesRaw : []).map((c) => ({
    courseId: pick(c, "course_id", "courseId"),
    code: pick(c, "code"),
    name: pick(c, "name"),
  }));
  return {
    cohortId: pick(cohort, "cohort_id", "cohortId", "id"),
    cohortCode: pick(cohort, "code") ?? "—",
    programName: pick(program, "name") ?? "—",
    courses,
  };
}

async function fetchStudentFichas(actor) {
  const actorId = pick(actor, "academicActorId", "academic_actor_id");
  if (!actorId) return [];
  const enrollments =
    (await safe(backendGet(ACAD(), `api/v1/academic-actors/${actorId}/enrollments`))) ?? [];
  const list = (Array.isArray(enrollments) ? enrollments : []).filter((e) =>
    ["Active", "Completed"].includes(e.enrollment_status ?? e.enrollmentStatus ?? "Active")
  );
  const bundles = await Promise.all(
    list.map(async (e) => {
      const cohortId = e.cohort_id ?? e.cohortId;
      if (!cohortId) return null;
      const bundle = await fetchCohortBundle(cohortId);
      if (!bundle) return null;
      return {
        ...bundle,
        enrolledOn: e.enrolled_on ?? e.enrolledOn ?? null,
        enrollmentStatus: e.enrollment_status ?? e.enrollmentStatus ?? null,
      };
    })
  );
  return bundles.filter(Boolean);
}

function resolveRole(storedRole) {
  let canonical = storedRole;
  try {
    const parsed = JSON.parse(storedRole);
    if (Array.isArray(parsed)) canonical = getHighestRole(parsed);
  } catch {}
  const roleLower = String(canonical || "").toLowerCase();
  if (roleLower === "teacher" || roleLower === "docente" || roleLower === "instructor") return "teacher";
  return "student";
}

export function useMyCoursesViewModel() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fichas, setFichas] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storedRole = await getCurrentUserRole();
      setRole(resolveRole(storedRole));

      const user = await getCurrentUser();
      const actors = user?.personId ? await ActorService.getByPerson(user.personId) : [];
      const myActor = actors?.length > 0 ? actors[0] : null;
      if (!myActor) {
        setFichas([]);
        return;
      }
      setFichas(await fetchStudentFichas(myActor));
    } catch (e) {
      setError(t("courses.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { role, loading, error, fichas, reload: load, colors, t };
}
