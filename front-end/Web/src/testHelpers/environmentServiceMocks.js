/* global jest */
// Dobles compartidos de los servicios de ambientes y bloques para las pruebas de
// useEnvironmentsViewModel (se usan dentro de jest.mock con require).
const positiveId = (id) => (Number.isInteger(Number(id)) && Number(id) > 0 ? Number(id) : null);

export function environmentManagementMock() {
    return {
        backendEnvId: positiveId,
        createEnvironment: jest.fn(),
        deleteEnvironment: jest.fn(),
        updateEnvironment: jest.fn(),
    };
}

export function scheduleBlockManagementMock() {
    return {
        backendScheduleId: positiveId,
        cohortsForCourse: jest.fn(),
        createBlocks: jest.fn(),
        createdBlockId: jest.fn(),
        dayLabelToIso: jest.fn(),
        deleteBlock: jest.fn(),
        instructorActorForUser: jest.fn(),
        isoToDayLabel: jest.fn(),
        replaceBlock: jest.fn(),
    };
}
