// Montaje común de las pruebas de AuthContext. Se usa desde las factories de jest.mock con
// require() (jest.mock se eleva por archivo) y desde las propias pruebas.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export const apiClientMock = () => ({
    getToken: jest.fn().mockResolvedValue(null),
    clearToken: jest.fn().mockResolvedValue(undefined),
    saveToken: jest.fn().mockResolvedValue(true),
    setUnauthorizedHandler: jest.fn(),
    isCookieMode: jest.fn(() => false),
});

export const sessionTimeoutMock = () => ({
    useSessionTimeout: () => ({ resetTimer: jest.fn(), clearTimer: jest.fn(), isActive: false }),
});

/** Monta AuthProvider con una sonda y devuelve un getter del valor actual de useAuth(). */
export function mountAuth() {
    const { AuthProvider, useAuth } = require("../AuthContext");
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

export const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
