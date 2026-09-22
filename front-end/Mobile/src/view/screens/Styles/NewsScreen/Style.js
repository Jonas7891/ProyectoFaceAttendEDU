import {StyleSheet} from 'react-native';
import {normalizeTypography} from '../../../../utils/typography';

const styles = StyleSheet.create(normalizeTypography({
bottomSpace: {
        height: 90,
    },

container: {
        flex: 1,
        paddingTop: 15,
        marginHorizontal: 20
    },

safeArea: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
}));

export default styles;
