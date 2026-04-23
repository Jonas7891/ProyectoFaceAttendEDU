import { useRouter } from "expo-router";
import LoginPage from "@/components/own_components/screens/LoginPage";

export default function Login() {
    const router = useRouter();

    return (
        <LoginPage
            onLogin={(usuario, contrasena) => {
                // Aquí va tu lógica de autenticación
                console.log(usuario, contrasena);
                // Cuando autentiques exitosamente:
                // router.replace("/dashboard");
            }}
            onForgotPassword={() => router.push("/forgot-password")}
            onRegister={() => router.push("/Sign-Up/Signup")}
        />
    );
}