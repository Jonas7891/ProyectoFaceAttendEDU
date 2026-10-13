jest.mock("../../../api/apiClient", () => ({
    fetchAllPages: jest.fn(),
    request: jest.fn(),
}));
import { fetchAllPages } from "../../../api/apiClient";
import { cohortActorByPerson, resetReferenceData, setActiveSchool } from "../referenceData";

beforeEach(() => {
    resetReferenceData();
    setActiveSchool(null);
    fetchAllPages.mockReset();
});

test("maps personId to academicActorId only for enrollments in the given cohort", async () => {
    fetchAllPages.mockImplementation((path) => {
        if (String(path).includes("enrollments")) {
            return Promise.resolve([
                { academicActorId: 1, cohortId: 10 },
                { academicActorId: 2, cohortId: 99 },
            ]);
        }
        if (String(path).includes("actors")) {
            return Promise.resolve([
                { academicActorId: 1, personId: "person-a" },
                { academicActorId: 2, personId: "person-b" },
            ]);
        }
        return Promise.resolve([]);
    });

    const map = await cohortActorByPerson(10);

    expect(map.get("person-a")).toBe(1);
    expect(map.has("person-b")).toBe(false);
});
