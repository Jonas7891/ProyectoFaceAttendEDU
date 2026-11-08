import { request } from '../../api/apiClient';
import { SchoolService } from '../SchoolService';
import { PersonService } from '../PersonService';
import { ScheduleBlockService } from '../ScheduleBlockService';
import { AcademicConfigService } from '../AcademicConfigService';
import { ActorService } from '../ActorService';
import { getCurrentUser } from '../UserService';

jest.mock('../../api/apiClient', () => ({
  request: jest.fn(),
  GET: 'GET', POST: 'POST', PUT: 'PUT', PATCH: 'PATCH', DELETE: 'DELETE',
}));
jest.mock('../UserService', () => ({ getCurrentUser: jest.fn() }));
jest.mock('../ActorService', () => ({ ActorService: { getByPerson: jest.fn(), getAll: jest.fn() } }));

const call = (i = 0) => request.mock.calls[i][0];

beforeEach(() => {
  request.mockReset();
  getCurrentUser.mockReset();
  ActorService.getByPerson.mockReset();
  ActorService.getAll.mockReset();
});

describe('SchoolService', () => {
  test('maps camelCase rows from the academic service', async () => {
    request.mockResolvedValue({ value: [{ schoolId: 4, code: 'ICT-01', name: 'Camilo Torres', cityId: 11 }] });
    const [school] = await SchoolService.getAll();
    expect(school).toMatchObject({ schoolId: 4, code: 'ICT-01', name: 'Camilo Torres', cityId: 11 });
  });

  test('create and update send camelCase bodies without null fields', async () => {
    request.mockResolvedValue({ schoolId: 4, name: 'Camilo Torres' });
    await SchoolService.create({ code: 'ICT-01', name: 'Camilo Torres', city_id: 11, phone: null });
    await SchoolService.update(4, { name: 'Camilo Torres', email: undefined });
    expect(call(0)).toMatchObject({ method: 'POST', url: 'school', data: { code: 'ICT-01', name: 'Camilo Torres', cityId: 11 } });
    expect(call(0).data).not.toHaveProperty('phone');
    expect(call(1)).toMatchObject({ method: 'PUT', url: 'school/4', data: { name: 'Camilo Torres' } });
  });

  test('getById takes the first row and delete hits the school', async () => {
    request.mockResolvedValueOnce([{ schoolId: 4, name: 'A' }]).mockResolvedValueOnce(undefined);
    expect((await SchoolService.getById(4)).name).toBe('A');
    await SchoolService.delete(4);
    expect(call(1)).toMatchObject({ method: 'DELETE', url: 'school/4' });
  });

  test('current school: the actor school first', async () => {
    getCurrentUser.mockResolvedValue({ personId: 'p-1' });
    ActorService.getByPerson.mockResolvedValue([{ schoolId: 8 }]);
    await expect(SchoolService.getCurrentSchoolId()).resolves.toBe(8);
    expect(ActorService.getAll).not.toHaveBeenCalled();
  });

  test('current school without an actor: the school with most actors, ties to the lowest id', async () => {
    getCurrentUser.mockResolvedValue({ personId: 'p-1' });
    ActorService.getByPerson.mockResolvedValue([]);
    ActorService.getAll.mockResolvedValue([{ schoolId: 5 }, { schoolId: 3 }, { schoolId: 5 }, { schoolId: 3 }, { schoolId: null }]);
    await expect(SchoolService.getCurrentSchoolId()).resolves.toBe(3);
  });

  test('current school without actors at all: the first school, or null', async () => {
    getCurrentUser.mockResolvedValue(null);
    ActorService.getByPerson.mockResolvedValue(null);
    ActorService.getAll.mockResolvedValue(null);
    request.mockResolvedValueOnce([{ schoolId: 2 }]).mockResolvedValueOnce([]);
    await expect(SchoolService.getCurrentSchoolId()).resolves.toBe(2);
    await expect(SchoolService.getCurrentSchoolId()).resolves.toBeNull();
  });
});

describe('PersonService', () => {
  test('create sends the camelCase PersonDto that ms-identity requires', async () => {
    request.mockResolvedValue({ personId: 'p-9', documentNumber: '1001', name: 'Ana', lastName: 'Ruiz' });
    const person = await PersonService.create({ document_number: '1001', name: 'Ana', last_name: 'Ruiz', document_type: 'CC', phone: null });
    expect(call()).toMatchObject({
      method: 'POST', url: 'person', data: { documentNumber: '1001', name: 'Ana', lastName: 'Ruiz', documentType: 'CC' },
    });
    expect(call().data).not.toHaveProperty('phone');
    expect(person).toMatchObject({ personId: 'p-9', lastName: 'Ruiz' });
  });

  test('update and updateFields are authenticated PUTs; setStatus is a PATCH', async () => {
    request.mockResolvedValue({ personId: 'p-9' });
    await PersonService.update('p-9', { documentNumber: '1001', name: 'Ana', lastName: 'Ruiz', email: 'a@b.co' });
    await PersonService.updateFields('p-9', { phone: '300' });
    await PersonService.setStatus('p-9', false);
    expect(call(0)).toMatchObject({ method: 'PUT', url: 'person/p-9', requiresAuth: true, data: { email: 'a@b.co' } });
    expect(call(1)).toMatchObject({ method: 'PUT', url: 'person/p-9', data: { phone: '300' } });
    expect(call(2)).toMatchObject({ method: 'PATCH', url: 'person/p-9/status', params: { status: false } });
  });

  test('lookups by id and document take the first row; an empty answer is null', async () => {
    request.mockResolvedValueOnce({ value: [{ personId: 'p-1', name: 'Ana' }] }).mockResolvedValueOnce([]);
    expect((await PersonService.getById('p-1')).name).toBe('Ana');
    expect(await PersonService.getByDocument('999')).toBeNull();
    expect(call(1)).toMatchObject({ params: { document_number: '999' } });
  });

  test('getAll and delete', async () => {
    request.mockResolvedValueOnce([{ personId: 'p-1' }, { personId: 'p-2' }]).mockResolvedValueOnce(undefined);
    expect(await PersonService.getAll({ status: true })).toHaveLength(2);
    await PersonService.delete('p-2');
    expect(call(1)).toMatchObject({ method: 'DELETE', url: 'person/p-2' });
  });
});

describe('ScheduleBlockService', () => {
  test('filters are sent in camelCase, which ms-scheduling reads', async () => {
    request.mockResolvedValue([{ scheduleBlockId: 1, cohortId: 2, dayOfWeek: 'MONDAY', startsAt: '07:00' }]);
    const [block] = await ScheduleBlockService.getByCohort(2);
    await ScheduleBlockService.getByInstructor(10);
    await ScheduleBlockService.getByEnvironment(3);
    await ScheduleBlockService.getByDay('MONDAY');
    expect(block).toMatchObject({ scheduleBlockId: 1, cohortId: 2, dayOfWeek: 'MONDAY', startsAt: '07:00' });
    expect(request.mock.calls.map(([c]) => c.params)).toEqual([
      { cohortId: 2 }, { instructorActorId: 10 }, { environmentId: 3 }, { dayOfWeek: 'MONDAY' },
    ]);
  });

  test('create and update build a camelCase body from either key style', async () => {
    request.mockResolvedValue({ scheduleBlockId: 7 });
    await ScheduleBlockService.create({ cohort_id: 2, courseId: 4, environment_id: 3, day_of_week: 'TUESDAY', starts_at: '07:00', endsAt: '09:00' });
    await ScheduleBlockService.update(7, { instructorActorId: 10 });
    expect(call(0).data).toEqual({ cohortId: 2, courseId: 4, environmentId: 3, dayOfWeek: 'TUESDAY', startsAt: '07:00', endsAt: '09:00' });
    expect(call(1)).toMatchObject({ method: 'PUT', url: 'schedule_block/7', data: { instructorActorId: 10 } });
  });

  test('getAll, getById and delete', async () => {
    request.mockResolvedValueOnce({ value: [{ scheduleBlockId: 1 }] })
      .mockResolvedValueOnce({ scheduleBlockId: 9 })
      .mockResolvedValueOnce(undefined);
    expect(await ScheduleBlockService.getAll()).toHaveLength(1);
    expect((await ScheduleBlockService.getById(9)).scheduleBlockId).toBe(9);
    await ScheduleBlockService.delete(9);
    expect(call(2)).toMatchObject({ method: 'DELETE', url: 'schedule_block/9' });
  });
});

describe('AcademicConfigService', () => {
  const configs = [
    { configurationId: 1, schoolId: 4, configurationName: 'tardy_tolerance_minutes', configurationValue: '10' },
    { configurationId: 2, schoolId: 5, configurationName: 'tardy_tolerance_minutes', configurationValue: '15' },
  ];

  test('getBySchool and getByName filter on the client', async () => {
    request.mockResolvedValue(configs);
    expect((await AcademicConfigService.getBySchool('5')).map((c) => c.configurationValue)).toEqual(['15']);
    const config = await AcademicConfigService.getByName(4, 'tardy_tolerance_minutes');
    expect(config).toMatchObject({ configurationId: 1, configurationValue: '10' });
    expect(call(1)).toMatchObject({ params: { name: 'tardy_tolerance_minutes' } });
    await expect(AcademicConfigService.getByName(9, 'tardy_tolerance_minutes')).resolves.toBeNull();
  });

  test('listBySchool uses the server-side filter route', async () => {
    request.mockResolvedValue({ value: configs.slice(0, 1) });
    const list = await AcademicConfigService.listBySchool(4);
    expect(call()).toMatchObject({ method: 'GET', url: 'api/v1/schools/4/configurations' });
    expect(list[0].configurationName).toBe('tardy_tolerance_minutes');
  });

  test('create and update send camelCase bodies without null fields', async () => {
    request.mockResolvedValue(configs[0]);
    await AcademicConfigService.create({ school_id: 4, configuration_name: 'max_absences', configuration_value: '3', description: null });
    await AcademicConfigService.update(1, { configurationValue: '4' });
    expect(call(0).data).toEqual({ schoolId: 4, configurationName: 'max_absences', configurationValue: '3' });
    expect(call(1)).toMatchObject({ method: 'PUT', url: 'academic_configuration/1', data: { configurationValue: '4' } });
  });

  test('getAll, getById and delete', async () => {
    request.mockResolvedValueOnce(configs).mockResolvedValueOnce([configs[1]]).mockResolvedValueOnce(undefined);
    expect(await AcademicConfigService.getAll()).toHaveLength(2);
    expect((await AcademicConfigService.getById(2)).schoolId).toBe(5);
    await AcademicConfigService.delete(2);
    expect(call(2)).toMatchObject({ method: 'DELETE', url: 'academic_configuration/2' });
  });
});
