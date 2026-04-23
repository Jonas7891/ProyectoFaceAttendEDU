import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    Image,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import BottomBar from "../Components/Common/NavigationBar";
import ScrollViewWrapper from "../Components/Common/ScrollView";
import CustomTabs from "../Components/Common/CustomTabs";
import Separador from "../Components/Common/Separador";
import styles from "./Style";

export default function NewsScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const handleLanguageChange = () => {
            setRefreshKey(prev => prev + 1);
        };

        i18n.on('languageChanged', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

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
        <SafeAreaView style={styles.safeArea} key={refreshKey}>
            <ScrollViewWrapper>
                <View style={styles.container}>
                    <CustomTabs style={styles.customTabs} />

                    <View style={{ marginLeft: 25, marginRight: 25 }}>
                        <Image
                            source={require("../../assets/images/persona.png")}
                            style={{ width: "100%", height: 200, marginTop: 40, borderRadius: 10 }}
                        />
                    </View>

                    <View>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 30 }}>
                            {t('news.title')}
                        </Text>

                        <Text style={{ fontSize: 18, fontWeight: "100", marginTop: 15 }}>
                            {t('news.creationDate')}: {t('news.unknownDate')}
                        </Text>
                    </View>

                    <View style={{ marginTop: 15 }}>
                        <Separador style={{ fontWeight: "800" }} />
                    </View>

                    <View style={{ marginHorizontal: Platform.OS === 'android' ? 10 : 0 }}>
                        <Text style={{ fontSize: 15, marginTop: 15, textAlign: "justify" }}>
                            {t('news.content')}
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
        </SafeAreaView>
    );
}