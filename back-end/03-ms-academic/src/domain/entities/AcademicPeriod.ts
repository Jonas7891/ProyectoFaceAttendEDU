export interface AcademicPeriod {
  academicPeriodId: number;
  schoolId: number;
  name: string;
  startsOn: string;
  endsOn: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Calendar day of a `YYYY-MM-DD` value, or null when it is not a real date. */
function dayOf(value: unknown): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  if (!m) return null;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(t);
  return d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]) ? t : null;
}

/**
 * Mirrors chk_period_dates (starts_on < ends_on) so the client gets a clear 400. The period
 * type (anual/semestral/trimestral) is not stored, so no per-type maximum duration is checked.
 */
export function periodDatesError(startsOn: unknown, endsOn: unknown): string | null {
  const s = dayOf(startsOn);
  const e = dayOf(endsOn);
  if (s === null || e === null) return 'startsOn and endsOn must be valid dates';
  return s < e ? null : 'startsOn must be before endsOn';
}
