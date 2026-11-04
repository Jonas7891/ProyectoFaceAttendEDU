jest.mock("../../api/apiClient", () => require("../testUtils/authContextTestUtils").apiClientMock());
jest.mock("../../core/hooks/useSessionTimeout", () => require("../testUtils/authContextTestUtils").sessionTimeoutMock());
jest.mock("../../services/api/authApi", () => ({ authApi: {} }));
jest.mock("../../services/api/consentApi", () => ({ consentApi: {} }));

import { flush, mountAuth as mount } from "../testUtils/authContextTestUtils";
import { getToken } from "../../api/apiClient";

test("startup session restore finishes loading with no user when reading the token fails", async () => {
    getToken.mockRejectedValue(new Error("storage unavailable"));
    const getAuth = mount();
    await flush();

    expect(getAuth().isLoadingAuth).toBe(false);
    expect(getAuth().user).toBeNull();
});

test("startup session restore finishes loading when there is no stored session", async () => {
    getToken.mockResolvedValue(null);
    const getAuth = mount();
    await flush();

    expect(getAuth().isLoadingAuth).toBe(false);
    expect(getAuth().user).toBeNull();
});
