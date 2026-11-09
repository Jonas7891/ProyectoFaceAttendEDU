/**
 * Calendar date (YYYY-MM-DD) of `now` in the institution's time zone.
 *
 * Containers run in UTC, so `toISOString().slice(0, 10)` turns into the next day after
 * 19:00 in Colombia. The zone comes from APP_TIME_ZONE (IANA name), America/Bogota by default.
 */
export function todayIso(now: Date = new Date(), timeZone: string = process.env.APP_TIME_ZONE || 'America/Bogota'): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
