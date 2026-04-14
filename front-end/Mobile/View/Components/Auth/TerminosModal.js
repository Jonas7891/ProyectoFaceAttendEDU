import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export default function TerminosModal({ isVisible, onClose }) {
    const { t } = useTranslation();

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>{t('termsModal.title')}</Text>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.paragraph}>
                            <Text style={styles.subtitle}>{t('termsModal.acceptanceTitle')} {"\n\n"}</Text>
                            {t('termsModal.acceptanceText')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.objectTitle')} {"\n\n"}</Text>
                            {t('termsModal.objectText')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.authorizationTitle')} {"\n\n"}</Text>
                            {t('termsModal.authorizationText')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.sensitiveDataTitle')} {"\n\n"}</Text>
                            {t('termsModal.sensitiveDataText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.purpose1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.purpose2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.purpose3')} {"\n\n"}

                            {t('termsModal.sensitiveDataNote')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.finalityTitle')} {"\n\n"}</Text>
                            {t('termsModal.finalityText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality3')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality4')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality5')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.rightsTitle')} {"\n\n"}</Text>
                            {t('termsModal.rightsText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights3')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights4')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights5')} {"\n\n"}

                            {t('termsModal.rightsNote')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.storageTitle')} {"\n\n"}</Text>
                            {t('termsModal.storageText1')} {"\n\n"}
                            {t('termsModal.storageText2')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.transferTitle')} {"\n\n"}</Text>
                            {t('termsModal.transferText')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.responsibilitiesTitle')} {"\n\n"}</Text>
                            {t('termsModal.responsibilitiesText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.responsibilities1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.responsibilities2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.responsibilities3')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.responsibilities4')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.liabilityTitle')} {"\n\n"}</Text>
                            {t('termsModal.liabilityText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.liability1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.liability2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.liability3')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.modificationsTitle')} {"\n\n"}</Text>
                            {t('termsModal.modificationsText')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.legislationTitle')} {"\n\n"}</Text>
                            {t('termsModal.legislationText')} {"\n\n"}

                            <Text style={styles.subtitle}>{t('termsModal.acceptanceFinalTitle')} {"\n\n"}</Text>
                            {t('termsModal.acceptanceFinalText')} {"\n\n"}
                        </Text>
                    </ScrollView>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>{t('common.close')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0B5FA5',
        marginBottom: 16,
        textAlign: 'center',
    },
    content: {
        marginBottom: 20,
    },
    paragraph: {
        fontSize: 17,
        color: '#374151',
        marginBottom: 14,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#118FC3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0B5FA5',
    }
});