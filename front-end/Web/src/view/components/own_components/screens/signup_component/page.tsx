import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { useResponsive } from "../../../hooks/useResponsive";
import { getTypography } from "../../../constants/typography";
import Colors from "../../../constants/colors";
import Button from "../../ui/Button";

export default function SignupPage({ onRegister, onLogin }: any) {
    const { fs, sp } = useResponsive();
    const T = getTypography(fs);

    const [usuario, setUsuario] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={{ padding: sp(24), gap: sp(16) }}>
                    <Text style={T.heading1}>Registro</Text>

                    <TextInput
                        placeholder="Usuario"
                        value={usuario}
                        onChangeText={setUsuario}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Contraseña"
                        secureTextEntry
                        value={contrasena}
                        onChangeText={setContrasena}
                        style={styles.input}
                    />

                    <Button
                        label="Registrarse"
                        onPress={() => onRegister({ usuario, email, contrasena })}
                    />

                    <TouchableOpacity onPress={onLogin}>
                        <Text style={{ color: Colors.primary }}>
                            ¿Ya tienes cuenta? Inicia sesión
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.surface },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 10,
        borderRadius: 8,
    },
});
