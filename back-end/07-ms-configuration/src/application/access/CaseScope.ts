/**
 * Whose biometric update cases a caller may see.
 *  - `all`: Super Administrador (no school of its own) sees every case.
 *  - `personIds`: reviewers (permission `biometric.case:review` — Administrador,
 *    Instructor) see the cases of persons in their own school, never other
 *    institutions'.
 *  - `personId`: anyone else sees only their own cases.
 */
export type CaseScope =
  | { readonly all: true }
  | { readonly all: false; readonly personId: string }
  | { readonly all: false; readonly personIds: readonly string[] };

/** Whether `scope` includes `personId`, across all three scope shapes. */
export function caseScopeAllows(scope: CaseScope, personId: string): boolean {
  if (scope.all) return true;
  if ('personIds' in scope) return scope.personIds.includes(personId);
  return scope.personId === personId;
}

/** The repository filter that keeps a query inside the scope. */
export function caseScopeQuery(scope: CaseScope): { personId?: string; personIds?: readonly string[] } {
  if (scope.all) return {};
  return 'personIds' in scope ? { personIds: scope.personIds } : { personId: scope.personId };
}
