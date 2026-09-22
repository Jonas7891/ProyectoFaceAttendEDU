import {StyleSheet} from 'react-native';
import {appFontFamily, normalizeTypography} from '../../../../utils/typography';

const styles = StyleSheet.create(normalizeTypography({
ScrollView: {
        flex: 1,
    },

arrowImage: {
        transform: [{rotate: '180deg'}],
        width: 26,
        height: 26,
        marginLeft: "auto",
        opacity: 0.5,
    },

backIcon: {
        top: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
    },

backIconImage: {
        width: '80%',
        height: '80%',
    },

container: {
        flex: 1,
        paddingTop: 15,
        marginHorizontal: 20
    },

containerSesion: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        alignItems: "left",
    },

menuScreen: {
        flex: 1,
    },

menuScrollContent: {
        paddingBottom: 24,
    },

safeAreaWhite: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

sectionTitleMenu: {
        fontSize: 18,
        fontFamily: appFontFamily,
        textAlign: "justify",
        marginBottom: 15,
        color: "#000000",
        fontWeight: '600',
        marginTop: 15,
        alignSelf: "left",
    },

userText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 15,
        color: "#000000",
    },
}));

export default styles;
