import { PeriodService } from '../PeriodService';
import { request } from '../../api/apiClient';
import AcademicPeriod from '../../models/academic/AcademicPeriod';

jest.mock('../../api/apiClient', () => ({
  request: jest.fn(),
  GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE',
}));

// The academic service answers in camelCase.
const rows = [
  { academicPeriodId: 1, schoolId: 7, name: '2026-1', startsOn: '2026-01-19', endsOn: '2026-06-12', isActive: false },
  { academicPeriodId: 2, schoolId: 7, name: '2026-2', startsOn: '2026-07-13', endsOn: '2026-12-04', isActive: true },
  { academicPeriodId: 3, schoolId: 9, name: 'Otra sede', isActive: true },
];

beforeEach(() => request.mockReset());

test('getActiveBySchool returns the active period of the school with all its fields', async () => {
  request.mockResolvedValue(rows);

  const period = await PeriodService.getActiveBySchool('7');

  expect(period).toBeInstanceOf(AcademicPeriod);
  expect(period).toMatchObject({
    academicPeriodId: 2, schoolId: 7, name: '2026-2', startsOn: '2026-07-13', endsOn: '2026-12-04', isActive: true,
  });
});

test('getActiveBySchool returns null when the school has no active period', async () => {
  request.mockResolvedValue(rows.slice(0, 1));
  await expect(PeriodService.getActiveBySchool(7)).resolves.toBeNull();
});

test('getBySchool filters on the client because the backend ignores ?school_id', async () => {
  request.mockResolvedValue({ value: rows });

  const periods = await PeriodService.getBySchool(9);

  expect(request).toHaveBeenCalledWith({ method: 'GET', url: 'academic_period', requiresAuth: false });
  expect(periods.map((p) => p.name)).toEqual(['Otra sede']);
});

test('getAll forwards the params and accepts a single object as a one-row list', async () => {
  request.mockResolvedValue(rows[0]);

  const periods = await PeriodService.getAll({ is_active: true });

  expect(request).toHaveBeenCalledWith({ method: 'GET', url: 'academic_period', params: { is_active: true }, requiresAuth: false });
  expect(periods).toHaveLength(1);
  expect(periods[0].name).toBe('2026-1');
});

test('getAll returns an empty list for an empty answer', async () => {
  request.mockResolvedValue(null);
  await expect(PeriodService.getAll()).resolves.toEqual([]);
});

test('getById, create, update and delete call the period endpoint', async () => {
  request.mockResolvedValue({ academic_period_id: 5, name: 'Nuevo' });
  const draft = new AcademicPeriod({ name: 'Nuevo', school_id: 7 });

  expect((await PeriodService.getById(5)).name).toBe('Nuevo');
  expect((await PeriodService.create(draft)).academicPeriodId).toBe(5);
  await PeriodService.update(5, draft);
  await PeriodService.delete(5);

  expect(request.mock.calls.map(([c]) => `${c.method} ${c.url}`)).toEqual([
    'GET academic_period/5', 'POST academic_period', 'PUT academic_period/5', 'DELETE academic_period/5',
  ]);
  expect(request.mock.calls[1][0].data).toMatchObject({ name: 'Nuevo', school_id: 7 });
});
