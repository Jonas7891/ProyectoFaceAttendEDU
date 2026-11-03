// AUD-74: «Eliminar» usuario llama a DELETE /users/{id} de identity (borrado lógico en el servidor).
jest.mock("../../../api/apiClient", () => ({ request: jest.fn(async () => ({})), isCookieMode: () => false }));

import { request } from "../../../api/apiClient";
import { authApi } from "../authApi";

beforeEach(() => request.mockClear());

test("deleteUser sends DELETE to the user resource, not to the status or person routes", async () => {
    await authApi.deleteUser("11111111-1111-4111-8111-111111111111");

    expect(request).toHaveBeenCalledTimes(1);
    const [url, opts] = request.mock.calls[0];
    expect(url).toMatch(/\/users\/11111111-1111-4111-8111-111111111111$/);
    expect(opts).toEqual({ method: "DELETE" });
});
