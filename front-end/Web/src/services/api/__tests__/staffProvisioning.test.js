jest.mock("../authApi", () => ({
    authApi: {
        createPerson: jest.fn(),
        createUser: jest.fn(),
        deletePerson: jest.fn(),
    },
}));
jest.mock("../academicApi", () => ({
    academicApi: {
        createActor: jest.fn(),
        listSchools: jest.fn(),
    },
}));
jest.mock("../authorizationApi", () => ({
    authorizationApi: {
        listRoles: jest.fn(),
        assignRole: jest.fn(),
    },
}));

import { authApi } from "../authApi";
import { academicApi } from "../academicApi";
import { authorizationApi } from "../authorizationApi";
import { provisionStaff } from "../staffProvisioning";

const base = {
    name: "Ana García López",
    code: "ADMIN001",
    email: "Ana@universidad.edu",
    documentNumber: "1234567890",
    password: "Secret123",
};

beforeEach(() => {
    jest.clearAllMocks();
    authApi.createPerson.mockResolvedValue({ personId: "person-1" });
    authApi.createUser.mockResolvedValue({ userId: "user-1" });
    authorizationApi.listRoles.mockResolvedValue([
        { roleId: 1, roleName: "Administrador" },
        { roleId: 2, roleName: "Instructor" },
    ]);
});

test("admin: creates person, user and assigns role without academic actor", async () => {
    const result = await provisionStaff({ ...base, role: "admin" });

    expect(result).toEqual({ personId: "person-1", userId: "user-1" });
    expect(authApi.createPerson).toHaveBeenCalledWith({
        documentNumber: "1234567890",
        name: "Ana",
        lastName: "García López",
        email: "ana@universidad.edu",
        status: true,
    });
    expect(authApi.createUser).toHaveBeenCalledWith({
        personId: "person-1",
        username: "ana",
        password: "Secret123",
        authenticationType: "Local",
    });
    expect(authorizationApi.assignRole).toHaveBeenCalledWith("user-1", 1);
    expect(academicApi.createActor).not.toHaveBeenCalled();
});

test("teacher: also creates the instructor actor in the given school", async () => {
    await provisionStaff({ ...base, role: "teacher", schoolId: 5 });

    expect(academicApi.createActor).toHaveBeenCalledWith(
        expect.objectContaining({
            personId: "person-1",
            actorTypeId: 2,
            schoolId: 5,
            actorCode: "ADMIN001",
        })
    );
    expect(authorizationApi.assignRole).toHaveBeenCalledWith("user-1", 2);
});

test("compensates the person when user creation fails", async () => {
    authApi.createUser.mockRejectedValueOnce(new Error("duplicate"));

    await expect(provisionStaff({ ...base, role: "admin" })).rejects.toThrow("duplicate");
    expect(authApi.deletePerson).toHaveBeenCalledWith("person-1");
});
