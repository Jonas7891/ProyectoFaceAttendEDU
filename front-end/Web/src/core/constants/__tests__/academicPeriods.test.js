import periods, {
    ACADEMIC_PERIOD_TYPES as T,
    normalizeAcademicPeriodType,
    getConfiguredAcademicPeriodType,
    validatePeriodDates,
    calendarPeriodDates,
    describePeriod,
    calculateCurrentPeriodByYear,
    getYearAcademicPeriodsByMonth,
    getCurrentPeriod,
    getCurrentAcademicWeek,
    formatPeriodDateRange,
    getFullPeriodLabel,
    getAcademicPeriodConfig,
} from "../academicPeriods";

const mockConfig = {};
jest.mock("../../config/institutionConfig", () => ({
    ...jest.requireActual("../../config/institutionConfig"),
    getInstitutionConfig: () => mockConfig,
}));

beforeEach(() => {
    for (const k of Object.keys(mockConfig)) delete mockConfig[k];
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 8, 10, 0)); // 8 Nov 2026
});
afterEach(() => jest.useRealTimers());

test("period types accept Spanish and English names, with semestral as the fallback", () => {
    expect(normalizeAcademicPeriodType(" Annual ")).toBe(T.ANNUAL);
    expect(normalizeAcademicPeriodType("quarterly")).toBe(T.QUARTERLY);
    expect(normalizeAcademicPeriodType("trimester")).toBe(T.TRIMESTRAL);
    expect(normalizeAcademicPeriodType(undefined)).toBe(normalizeAcademicPeriodType("otro"));
    mockConfig.academicPeriodType = "semester";
    expect(getConfiguredAcademicPeriodType()).toBe(T.SEMESTRAL);
    expect(getAcademicPeriodConfig("nope")).toBe(getAcademicPeriodConfig());
});

describe("validatePeriodDates", () => {
    test.each([
        ["", "", null],
        ["2026-01-19", "", "Define la fecha de inicio y la de fin del período"],
        ["2026-02-30", "2026-06-30", "Las fechas del período no son válidas"],
        ["2026-06-30", "2026-01-19", "La fecha de fin debe ser posterior a la fecha de inicio"],
        ["2026-01-19", "2026-02-10", "El período debe durar al menos 4 semanas (28 días)"],
        ["2026-01-19", "2026-09-30", "El período no puede durar más de 6 meses para el tipo seleccionado"],
        ["2026-01-19", "2026-06-30", null],
    ])("%s → %s", (start, end, message) => {
        expect(validatePeriodDates(start, end, "semestral")).toBe(message);
    });
});

test("calendar periods split the year by type", () => {
    const nov = new Date(2026, 10, 8);
    expect(calendarPeriodDates("semestral", nov)).toEqual({ startIso: "2026-07-01", endIso: "2026-12-31", label: "Segundo Semestre 2026" });
    expect(calendarPeriodDates("trimestral", nov)).toMatchObject({ startIso: "2026-10-01", endIso: "2026-12-31", label: "Cuarto Trimestre 2026" });
    expect(calendarPeriodDates("cuatrimestral", nov)).toMatchObject({ startIso: "2026-09-01", label: "Tercer Cuatrimestre 2026" });
    expect(calendarPeriodDates("anual", nov)).toMatchObject({ startIso: "2026-01-01", endIso: "2026-12-31" });
    expect(calculateCurrentPeriodByYear("desconocido", nov)).toMatchObject({ periodNumber: 4, monthsPerPeriod: 3 });
});

test("describePeriod uses the configured dates or the calendar, with status and days left", () => {
    const today = new Date(2026, 10, 8);
    expect(describePeriod("2026-07-13", "2026-12-04", "semestral", today))
        .toEqual({ startIso: "2026-07-13", endIso: "2026-12-04", label: "Segundo Semestre 2026", fromDates: true, daysRemaining: 26, status: "current" });
    expect(describePeriod("2026-12-01", "2027-03-30", "semestral", today).status).toBe("upcoming");
    expect(describePeriod("2026-01-19", "2026-06-12", "semestral", today).status).toBe("ended");
    expect(describePeriod("bad", "2026-06-12", "semestral", today)).toMatchObject({ fromDates: false, startIso: "2026-07-01", status: "current" });
});

test("the periods of a year are flagged past, current or future", () => {
    const list = getYearAcademicPeriodsByMonth(T.TRIMESTRAL, 2026);
    expect(list.map((p) => [p.label, p.isPast, p.isCurrent, p.isFuture])).toEqual([
        ["Primer Trimestre", true, false, false],
        ["Segundo Trimestre", true, false, false],
        ["Tercer Trimestre", true, false, false],
        ["Cuarto Trimestre", false, true, false],
    ]);
    expect(list[0]).toMatchObject({ id: "trimestral-2026-1", startWeek: 1 });
    expect(getYearAcademicPeriodsByMonth(T.SEMESTRAL, 2027).every((p) => p.isFuture)).toBe(true);
    expect(getYearAcademicPeriodsByMonth(T.ANNUAL, 2026)).toHaveLength(1);
    expect(getYearAcademicPeriodsByMonth(T.QUARTERLY, 2026)).toHaveLength(3);
    expect(getYearAcademicPeriodsByMonth("otro", 2026)).toHaveLength(4);
});

test("the current period comes from Settings dates when both are set", () => {
    mockConfig.periodStartDate = "2026-07-13T00:00:00";
    mockConfig.periodEndDate = "2026-12-04T00:00:00";
    mockConfig.isAutomaticPeriod = false;
    expect(getCurrentPeriod("semestral")).toMatchObject({
        id: "semestral-custom-2026", label: "Segundo Semestre", isCurrent: true, isManual: true, year: 2026,
    });
});

test("without Settings dates the current period is calculated from the year", () => {
    mockConfig.academicPeriodType = "trimestral";
    expect(getCurrentPeriod()).toMatchObject({ id: "trimestral-2026-4", isCalculatedByYear: true, isAutomatic: true });
});

test("labels and date ranges follow the configured date format", () => {
    mockConfig.dateFormat = "YYYY-MM-DD";
    const period = { label: "Segundo Semestre", startDate: new Date(2026, 6, 13), endDate: new Date(2026, 11, 4) };
    expect(formatPeriodDateRange(period)).toBe("2026-07-13 - 2026-12-04");
    expect(getFullPeriodLabel(period)).toBe("Segundo Semestre (2026-07-13 - 2026-12-04)");
    expect(getFullPeriodLabel({ label: "Sin fechas" })).toBe("Sin fechas");
    expect(getFullPeriodLabel(null)).toBe("");
    expect(formatPeriodDateRange(null)).toBe("");
});

test("weeks count from the period start and never go below 1", () => {
    expect(getCurrentAcademicWeek(new Date(2026, 0, 1), new Date(2026, 0, 15))).toBe(3);
    expect(getCurrentAcademicWeek(new Date(2026, 0, 15), new Date(2026, 0, 1))).toBe(1);
});

test("the default export keeps the helpers used through it", () => {
    expect(periods.getAcademicPeriodWeeks(T.ANNUAL)).toBe(32);
    expect(periods.isValidWeekCount(17, T.SEMESTRAL)).toBe(true);
    expect(periods.isValidWeekCount(20, T.SEMESTRAL)).toBe(false);
    expect(periods.generateWeekLabels(3, 5)).toEqual(["Sem 5", "Sem 6", "Sem 7"]);
    expect(periods.formatPeriodLabel({ label: "X" })).toBe("X");
    expect(periods.getNextPeriod(null)).toBeNull();
    const next = periods.getNextPeriod({ startDate: new Date(2026, 0, 1), endDate: new Date(2026, 5, 30) }, T.SEMESTRAL);
    expect(next).toMatchObject({ label: "Segundo Semestre", year: 2026, duration: 181 });
    expect(next.startDate.getMonth()).toBe(6);
    mockConfig.periodStartDate = "2026-01-01";
    expect(periods.getConfiguredPeriodDates()).toMatchObject({ startDate: "2026-01-01" });
});
