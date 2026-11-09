/**
 * The school a caller may manage. `isSuperAdmin: true` means unrestricted
 * (Super Administrador, no school of its own). Otherwise `schoolId` is the
 * caller's own school (via their academic_actor), or `null` for a caller
 * without one — which must fail secure (own nothing), never fall back to
 * "manage everything".
 */
export interface CallerSchool {
  readonly isSuperAdmin: boolean;
  readonly schoolId: number | null;
}
