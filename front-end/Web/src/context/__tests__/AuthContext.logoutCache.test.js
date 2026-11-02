// AUD-59: al cerrar sesión (o al caer la sesión por un 401) se borran los datos de dominio
// @faceattend_* guardados en el navegador, y las preferencias se conservan.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockStore = new Map();
jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(async (k) => (mockStore.has(k) ? mockStore.get(k) : null)),
    setItem: jest.fn(async (k, v) => { mockStore.set(k, v); }),
    removeItem: jest.fn(async (k) => { mockStore.delete(k); }),
    getAllKeys: jest.fn(async () => [...mockStore.keys()]),
}));
jest.mock("../../api/apiClient", () => ({
    getToken: jest.fn().mockResolvedValue(null),
    clearToken: jest.fn().mockResolvedValue(undefined),
    saveToken: jest.fn().mockResolvedValue(true),
    setUnauthorizedHandler: jest.fn(),
    isCookieMode: jest.fn(() => false),
}));
jest.mock("../../core/hooks/useSessionTimeout", () => ({
    useSessionTimeout: () => ({ resetTimer: jest.fn(), clearTimer: jest.fn(), isActive: false }),
}));
jest.mock("../../services/api/authApi", () => ({ authApi: { logout: jest.fn().mockResolvedValue(null) } }));
jest.mock("../../services/api/consentApi", () => ({ consentApi: {} }));

import { AuthProvider, useAuth } from "../AuthContext";
import { setUnauthorizedHandler } from "../../api/apiClient";

function mount() {
    let auth;
    function Probe() {
        auth = useAuth();
        return null;
    }
    act(() => {
        create(
            <AuthProvider>
                <Probe />
            </AuthProvider>,
        );
    });
    return () => auth;
}

const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

const PREFERENCES = ["@faceattend:theme_mode", "faceattend_language"];

beforeEach(() => {
    mockStore.clear();
    mockStore.set("@faceattend_students", "[]");
    mockStore.set("@faceattend_courses_v2", "[]");
    mockStore.set("@faceattend:theme_mode", "dark");
    mockStore.set("faceattend_language", "es");
});

const ends = {
    "logout": async (getAuth) => { await act(async () => { await getAuth().logout(); }); },
    "un 401 que purga la sesión": async () => {
        const handler = setUnauthorizedHandler.mock.calls.map((c) => c[0]).filter(Boolean).pop();
        await act(async () => { handler(); await new Promise((resolve) => setTimeout(resolve, 0)); });
    },
};

test.each(Object.keys(ends))("%s borra los datos de dominio y conserva las preferencias", async (name) => {
    const getAuth = mount();
    await flush();
    await ends[name](getAuth);
    expect([...mockStore.keys()].sort()).toEqual(PREFERENCES);
});
