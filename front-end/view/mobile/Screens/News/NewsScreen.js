import React, { useState } from "react";
import {
    Text,
    View,
    SafeAreaView,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../../Components/Common/NavigationBar";
import ScrollViewWrapper from "../../Components/Common/ScrollView";
import CustomTabs from "../../Components/Common/CustomTabs";
import Separador from "../../Components/Common/Separador";
import styles from "../Style/Style";

export default function NewsScreen() {
    const navigation = useNavigation();

    const handleSettings = () => {
        console.log("Abrir configuración");
        navigation.navigate("Menu")
    };

    const handleProfile = () => {
        console.log("Abrir perfil");

    };

    const handleSearch = () => {
        console.log("Abrir búsqueda");
        
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollViewWrapper>
                <View style={styles.container}>
                    <CustomTabs
                        style={styles.customTabs}
                    />

                    <View style={{ marginLeft: 25, marginRight: 25 }}>
                        <Image
                            source={require("../../../../assets/images/persona.png")}
                            style={{ width: "100%", height: 200, marginTop: 40, borderRadius: 10}}
                        />
                    </View>

                    <View>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 30 }}>
                            Recomendaciones de Usuarios
                        </Text>

                        <Text style={{ fontSize: 18, fontWeight: "100", marginTop: 15 }}>
                            Fecha de creación: ##/##/####
                        </Text>
                    </View>

                    <View style={{ marginTop: 15, }}>
                        <Separador style={{ fontWeight: "800" }} />
                    </View>

                    <View>
                        <Text style={{ fontSize: 15, marginTop: 15 }}>
                            Imagínate que tienes que usar una aplicación para registrar tu asistencia con el rostro, lo primero es que el sistema te muestra un recuadro en la pantalla para que sepas exactamente dónde poner la cara. A medida que te vas acomodando, se pone en verde para que sepas que ya estás listo. {"\n"}{"\n"}
                            Es importante que te pongas en un lugar con buena luz. Una vez que el rostro se ve bien, el sistema te pide un pequeño gesto, como parpadear o mover un poco la cabeza, para asegurarse de que no sea una foto o algo falso. {"\n"}{"\n"}
                            Lo mejor es que el escaneo no tarda mucho, apenas unos dos o tres segundos, y enseguida te aparece en la pantalla un mensaje claro que dice si la asistencia quedó registrada o si hubo algún problema. Todo está pensado para que sea rápido y sencillo: abres la app, presionas el botón para dirigirte al apartado de Escaneo Facial, te acomodas en el recuadro, parpadeas y en cuestión de segundos ya tienes tu asistencia guardada.
                        </Text>
                    </View>

                    <View style={styles.bottomSpace} />
                </View>
            </ScrollViewWrapper>
            <BottomBar
                onPressSettings={handleSettings}
                onPressProfile={handleProfile}
                onPressSearch={handleSearch}
            />
        </SafeAreaView >
    );
}
