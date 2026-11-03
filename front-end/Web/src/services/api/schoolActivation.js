// ============================================================
//  FaceAttend EDU — Activación coordinada de sede y administrador
//
//  AUD-22: el alta pública crea la sede (ms-academic) y su Administrador
//  (ms-identity) inactivos. Son dos servicios y no hay endpoint que los
//  active juntos; activar solo uno deja al administrador sin poder entrar
//  o entrando a una sede inactiva. Aquí se encadenan las dos llamadas:
//
//    activar    : sede (PATCH /schools/{id}/status) -> usuario (PATCH /users/{id}/status)
//    desactivar : usuario -> sede (orden inverso)
//
//  Si una llamada falla, las ya hechas se deshacen (mejor esfuerzo) y el
//  error indica si la reversión se completó.
//
//  El administrador se ubica con GET /schools/{id}/actors (actorTypeId 3)
//  -> personId -> GET /users. Ningún cambio se hace si esa búsqueda falla.
// ============================================================

import { fetchAllPages } from "../../api/apiClient";
import { endpoints } from "../../api/endpoints";
import { academicApi } from "./academicApi";
import { authApi } from "./authApi";

const ADMIN_ACTOR_TYPE_ID = 3;
// Tolerancia entre created_at y updated_at para considerar una sede intacta desde el alta.
const UNTOUCHED_MS = 2000;

/** "active" | "pending" (inactiva y sin tocar desde el alta) | "inactive". */
export function schoolStatusKind(school) {
    if (school?.status) return "active";
    const created = Date.parse(school?.createdAt);
    const updated = Date.parse(school?.updatedAt);
    if (Number.isFinite(created) && Number.isFinite(updated) && updated - created <= UNTOUCHED_MS) {
        return "pending";
    }
    return "inactive";
}

function failure(code, cause, reverted) {
    const error = new Error(cause?.message || code);
    error.code = code;
    error.reverted = reverted;
    error.cause = cause;
    return error;
}

/** Usuarios (app_user) de los administradores de la sede, con su estado actual. */
async function findAdminUsers(schoolId) {
    const actors = await fetchAllPages(endpoints.academic.schoolActors(schoolId));
    const personIds = new Set(
        (actors ?? [])
            .filter((a) => Number(a?.actorTypeId ?? a?.actor_type_id) === ADMIN_ACTOR_TYPE_ID)
            .map((a) => a?.personId ?? a?.person_id)
            .filter(Boolean)
    );
    if (personIds.size === 0) return [];
    const users = await fetchAllPages(endpoints.identity.users, {}, { by: "page" });
    return (users ?? []).filter((u) => personIds.has(u?.personId ?? u?.person_id));
}

/**
 * Activa o desactiva la sede junto con sus administradores.
 * @returns {Promise<{ adminCount: number }>}
 * @throws Error con `code` (ADMIN_LOOKUP_FAILED | SCHOOL_FAILED | ADMIN_FAILED) y `reverted`.
 */
export async function changeSchoolAccess(school, next) {
    let admins;
    try {
        admins = await findAdminUsers(school.schoolId);
    } catch (e) {
        throw failure("ADMIN_LOOKUP_FAILED", e, true);
    }

    const schoolStep = {
        code: "SCHOOL_FAILED",
        run: () => academicApi.updateSchoolStatus(school.schoolId, next),
        undo: () => academicApi.updateSchoolStatus(school.schoolId, !next),
    };
    const adminSteps = admins
        .filter((u) => Boolean(u.status) !== next)
        .map((u) => {
            const userId = u.userId ?? u.user_id;
            return {
                code: "ADMIN_FAILED",
                run: () => authApi.setUserStatus(userId, next),
                undo: () => authApi.setUserStatus(userId, !next),
            };
        });
    const steps = next ? [schoolStep, ...adminSteps] : [...adminSteps, schoolStep];

    const done = [];
    for (const step of steps) {
        try {
            await step.run();
            done.push(step);
        } catch (e) {
            let reverted = true;
            for (const prev of done.reverse()) {
                try {
                    await prev.undo();
                } catch {
                    reverted = false;
                }
            }
            throw failure(step.code, e, reverted);
        }
    }
    return { adminCount: admins.length };
}
