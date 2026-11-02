// AUD-37 (c): GET /academic-actors/NaN/attendance devolvía 400. Con un id que no es un entero
// positivo no se hace la petición: el resultado es una lista vacía.
jest.mock("../../../api/apiClient", () => ({ request: jest.fn() }));

import { request } from "../../../api/apiClient";
import { attendanceApi } from "../attendanceApi";

beforeEach(() => {
    request.mockReset();
    request.mockResolvedValue([{ attendanceRecordId: 1 }]);
});

test.each([[NaN], [undefined], [null], [""], ["s_1730000000_ab12c"], [0], [-3], [1.5]])(
    "recordsByActor(%p) no pide nada y devuelve una lista vacía",
    async (id) => {
        await expect(attendanceApi.recordsByActor(id)).resolves.toEqual([]);
        expect(request).not.toHaveBeenCalled();
    }
);

test.each([[7], ["7"]])("recordsByActor(%p) pide el endpoint del actor", async (id) => {
    await attendanceApi.recordsByActor(id);
    expect(request).toHaveBeenCalledTimes(1);
    expect(String(request.mock.calls[0][0])).toMatch(/\/academic-actors\/7\/attendance$/);
});
