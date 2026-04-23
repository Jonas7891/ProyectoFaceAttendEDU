import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { useResponsive } from "../../../../Webs/components/hooks/useResponsive";
import { getTypography } from "../../../../Webs/components/constants/typography";
import Colors from "../../../../Webs/components/constants/colors";
import Button from "../../../../Webs/components/own_components/ui/Button";

// ─── Wave divisor (pure RN, sin react-native-svg) ───────────────────────────
// Un View con borderRadius alto + overflow:hidden simula la elipse del mockup.

function WaveDivider() {
    return (
        <View style={{ width: 72, alignSelf: "stretch", overflow: "hidden", zIndex: 2 }}>
            <View
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 144,
                    borderRadius: 72,
                    backgroundColor: Colors.surface,
                }}
            />
        </View>
    );
}

// ─── Form Input ─────────────────────────────────────────────────────────────

type InputProps = {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    fs: (n: number) => number;
    sp: (n: number) => number;
};

function FormInput({ label, value, onChangeText, placeholder, secureTextEntry, fs, sp }: InputProps) {
    const T = getTypography(fs);
    const [focused, setFocused] = useState(false);

    return (
        <View style={{ width: "100%", gap: sp(6) }}>
            <Text style={[T.bodyMD, { color: Colors.text, fontWeight: "600" }]}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.muted}
                secureTextEntry={secureTextEntry}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={[
                    T.bodyMD,
                    {
                        height: sp(44),
                        borderWidth: 1.5,
                        borderColor: focused ? Colors.primary : Colors.border,
                        borderRadius: sp(10),
                        paddingHorizontal: sp(14),
                        color: Colors.text,
                        backgroundColor: focused ? Colors.surface : Colors.bg,
                    },
                ]}
            />
        </View>
    );
}

// ─── LoginPage ───────────────────────────────────────────────────────────────

type Props = {
    onLogin?: (usuario: string, contrasena: string) => void;
    onForgotPassword?: () => void;
    onRegister?: () => void;
};

export default function LoginPage({ onLogin, onForgotPassword, onRegister }: Props) {
    const { fs, sp, isSmall } = useResponsive();
    const T = getTypography(fs);
    const [usuario, setUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const handleLogin = () => onLogin?.(usuario, contrasena);

    const fields = (
        <FormFields
            T={T} fs={fs} sp={sp}
            usuario={usuario} contrasena={contrasena}
            setUsuario={setUsuario} setContrasena={setContrasena}
            onLogin={handleLogin}
            onForgotPassword={onForgotPassword}
            onRegister={onRegister}
        />
    );

    // ── Mobile ───────────────────────────────────────────────────────────────
    if (isSmall) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.safeArea}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                            <View style={{ backgroundColor: Colors.primary, paddingVertical: sp(40), alignItems: "center", justifyContent: "center" }}>
                                <Text style={[T.displayLG, { color: Colors.surface, textAlign: "center" }]}>
                                    ¡Bienvenido{"\n"}de nuevo!
                                </Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: Colors.surface, paddingHorizontal: sp(28), paddingTop: sp(32), paddingBottom: sp(40), gap: sp(20), alignItems: "center" }}>
                                {fields}
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    // ── Desktop ──────────────────────────────────────────────────────────────
    return (
        <SafeAreaProvider>
            <SafeAreaView style={[styles.safeArea, { flexDirection: "row" }]}>
                {/* Panel izquierdo */}
                <View style={{ flex: 1, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" }}>
                    <Text style={[T.displayLG, { color: Colors.surface, textAlign: "center", maxWidth: sp(320) }]}>
                        ¡Bienvenido{"\n"}de nuevo!
                    </Text>
                </View>

                {/* Ola divisora */}
                <WaveDivider />

                {/* Panel derecho */}
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <View style={{ flex: 1, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", paddingHorizontal: sp(60), gap: sp(20) }}>
                        {fields}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

// ─── FormFields ──────────────────────────────────────────────────────────────

type FieldProps = {
    T: ReturnType<typeof getTypography>;
    fs: (n: number) => number;
    sp: (n: number) => number;
    usuario: string;
    contrasena: string;
    setUsuario: (v: string) => void;
    setContrasena: (v: string) => void;
    onLogin: () => void;
    onForgotPassword?: () => void;
    onRegister?: () => void;
};

function FormFields({ T, fs, sp, usuario, contrasena, setUsuario, setContrasena, onLogin, onForgotPassword, onRegister }: FieldProps) {
    return (
        <>
            <View style={{ width: sp(64), height: sp(64), borderRadius: sp(32), backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center" }}>
                <Image
                    source={require("../../../../Webs/assets/images/logoFaceAttend-Minimalista.png")}
                    style={{ width: sp(44), height: sp(44) }}
                    resizeMode="contain"
                />
            </View>

            <View style={{ alignItems: "center", gap: sp(4) }}>
                <Text style={[T.heading1, { color: Colors.text }]}>Inicio Sesión</Text>
                <Text style={[T.bodySM, { color: Colors.muted, textAlign: "center" }]}>
                    * Por favor ingrese sus credenciales de acceso
                </Text>
            </View>

            <View style={{ width: "100%", maxWidth: 340, gap: sp(16) }}>
                <FormInput label="Usuario" value={usuario} onChangeText={setUsuario} placeholder="Ingresa tu usuario" fs={fs} sp={sp} />
                <FormInput label="Contraseña" value={contrasena} onChangeText={setContrasena} placeholder="••••••••" secureTextEntry fs={fs} sp={sp} />
            </View>

            <TouchableOpacity onPress={onForgotPassword} style={{ alignSelf: "flex-end", maxWidth: 340, width: "100%" }}>
                <Text style={[T.bodySM, { color: Colors.primary, textAlign: "right" }]}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <View style={{ width: "100%", maxWidth: 340 }}>
                <Button label="Ingresar" onPress={onLogin} />
            </View>

            <View style={{ flexDirection: "row", gap: sp(4), alignItems: "center" }}>
                <Text style={[T.bodySM, { color: Colors.muted }]}>¿No tienes cuenta?</Text>
                <TouchableOpacity onPress={onRegister}>
                    <Text style={[T.bodySM, { color: Colors.primary, fontWeight: "600" }]}>Regístrate aquí</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.surface },
});