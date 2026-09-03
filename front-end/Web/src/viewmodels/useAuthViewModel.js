import { useState, useRef } from "react";
import { useTranslation } from "../i18n/hooks/useTranslation";
import { useAuth } from "../context/AuthContext";

// ── useLoginViewModel ────────────────────────────────────────

export function useLoginViewModel(onSuccess) {
    const { t } = useTranslation();
    const { login } = useAuth();

    const emailRef = useRef("");
    const passwordRef = useRef("");

    // Estado visible del email — controla el TextInput (input controlado)
    const [emailDisplay, setEmailDisplay] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Actualiza ref Y estado visible → el usuario puede escribir normalmente
    function setEmail(v) {
        emailRef.current = v;
        setEmailDisplay(v);
    }

    function setPassword(v) {
        passwordRef.current = v;
    }
    function togglePassword() {
        setShowPassword((v) => !v);
    }

    /** Rellena el campo de email desde el panel dev sin perder la capacidad de editar */
    function prefillEmail(email) {
        emailRef.current = email;
        setEmailDisplay(email);
    }

    async function handleLogin() {
        if (!emailRef.current || !passwordRef.current) {
            setError(t("Completa todos los campos"));
            return;
        }
        setError("");
        setLoading(true);

        const err = await login({
            email: emailRef.current,
            password: passwordRef.current,
        });

        setLoading(false);

        if (err) {
            setError(t(err));
        } else {
            onSuccess();
        }
    }

    return {
        showPassword,
        loading,
        error,
        emailDisplay,
        setEmail,
        setPassword,
        togglePassword,
        prefillEmail,
        handleLogin,
    };
}

// ── useSignupViewModel ───────────────────────────────────────

export function useSignupViewModel(onSuccess) {
    const { t } = useTranslation();

    const usernameRef = useRef("");
    const emailRef = useRef("");
    const passwordRef = useRef("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function setUsername(v) {
        usernameRef.current = v;
    }
    function setEmail(v) {
        emailRef.current = v;
    }
    function setPassword(v) {
        passwordRef.current = v;
    }
    function togglePassword() {
        setShowPassword((v) => !v);
    }

    function validate() {
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
                email: emailRef.current,
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
