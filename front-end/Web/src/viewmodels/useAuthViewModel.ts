// ============================================================
//  FaceAttend EDU — Auth ViewModel
//  Encapsula lógica de autenticación.
//  Las Views solo llaman funciones y leen estado de aquí.
// ============================================================

import { useState, useRef } from "react";
import { useTranslation } from "../i18n/hooks/useTranslation";

export interface LoginForm {
    email:    string;
    password: string;
}

export interface SignupForm {
    username: string;
    email:    string;
    password: string;
}

// ── useLoginViewModel ────────────────────────────────────────

export function useLoginViewModel(onSuccess: (email: string, password: string) => void) {
    const { t } = useTranslation();
    const emailRef    = useRef("");
    const passwordRef = useRef("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState("");

    function setEmail(v: string)    { emailRef.current = v; }
    function setPassword(v: string) { passwordRef.current = v; }
    function togglePassword()       { setShowPassword(v => !v); }

    function validate(): boolean {
        if (!emailRef.current || !passwordRef.current) {
            setError(t("Completa todos los campos"));
            return false;
        }
        setError("");
        return true;
    }

    function handleLogin() {
        if (!validate()) return;
        setLoading(true);
        // TODO: reemplazar con llamada real a API de auth
        setTimeout(() => {
            setLoading(false);
            onSuccess(emailRef.current, passwordRef.current);
        }, 900);
    }

    return {
        showPassword,
        loading,
        error,
        setEmail,
        setPassword,
        togglePassword,
        handleLogin,
    };
}

// ── useSignupViewModel ───────────────────────────────────────

export function useSignupViewModel(
    onSuccess: (data: SignupForm) => void
) {
    const { t } = useTranslation();
    const usernameRef = useRef("");
    const emailRef    = useRef("");
    const passwordRef = useRef("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState("");

    function setUsername(v: string) { usernameRef.current = v; }
    function setEmail(v: string)    { emailRef.current = v; }
    function setPassword(v: string) { passwordRef.current = v; }
    function togglePassword()       { setShowPassword(v => !v); }

    function validate(): boolean {
        if (!usernameRef.current || !emailRef.current || !passwordRef.current) {
            setError(t("Completa todos los campos"));
            return false;
        }
        setError("");
        return true;
    }

    function handleRegister() {
        if (!validate()) return;
        setLoading(true);
        // TODO: reemplazar con llamada real a API de registro
        setTimeout(() => {
            setLoading(false);
            onSuccess({
                username: usernameRef.current,
                email:    emailRef.current,
                password: passwordRef.current,
            });
        }, 900);
    }

    return {
        showPassword,
        loading,
        error,
        setUsername,
        setEmail,
        setPassword,
        togglePassword,
        handleRegister,
    };
}
