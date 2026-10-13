jest.mock("../academicApi", () => ({
    academicApi: {
        listSchoolPrograms: jest.fn(),
        createCourse: jest.fn(),
    },
}));

import { academicApi } from "../academicApi";
import { createCourse, listSchoolPrograms } from "../courseCreation";

beforeEach(() => {
    jest.clearAllMocks();
});

test("lists school programs with canonical ids", async () => {
    academicApi.listSchoolPrograms.mockResolvedValue([
        { programId: 4, code: "ADSI", name: "Análisis y Desarrollo" },
        { program_id: 5, code: "MULT", name: "Multimedia" },
        { code: "VOID" },
    ]);

    const programs = await listSchoolPrograms(2);

    expect(academicApi.listSchoolPrograms).toHaveBeenCalledWith(2);
    expect(programs).toEqual([
        { programId: 4, code: "ADSI", name: "Análisis y Desarrollo" },
        { programId: 5, code: "MULT", name: "Multimedia" },
    ]);
});

test("throws without a school context", async () => {
    await expect(listSchoolPrograms(null)).rejects.toThrow("No school context");
    expect(academicApi.listSchoolPrograms).not.toHaveBeenCalled();
});

test("creates the course inside the chosen program", async () => {
    academicApi.createCourse.mockResolvedValue({ courseId: 9 });

    await createCourse({ programId: "4", code: " 2240083 ", name: " ADSI " });

    expect(academicApi.createCourse).toHaveBeenCalledWith({
        programId: 4,
        code: "2240083",
        name: "ADSI",
        status: true,
    });
});

test("requires a program", async () => {
    await expect(createCourse({ programId: "", code: "X", name: "Y" })).rejects.toThrow(
        "A program is required"
    );
    expect(academicApi.createCourse).not.toHaveBeenCalled();
});
