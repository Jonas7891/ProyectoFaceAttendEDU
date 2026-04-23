import React from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import stylesAuth from "./Style/Style";

export default function TerminosModal({ isVisible, onClose }) {
    const { t } = useTranslation();

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={stylesAuth.overlayTerminos}>
                <View style={stylesAuth.modalContainerTerminos}>
                    <Text style={stylesAuth.titleTerminos}>{t('termsModal.title')}</Text>

                    <ScrollView
                        style={stylesAuth.contentTerminos}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={stylesAuth.paragraphTerminos}>
                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.acceptanceTitle')} {"\n\n"}</Text>
                            {t('termsModal.acceptanceText')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.objectTitle')} {"\n\n"}</Text>
                            {t('termsModal.objectText')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.authorizationTitle')} {"\n\n"}</Text>
                            {t('termsModal.authorizationText')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.sensitiveDataTitle')} {"\n\n"}</Text>
                            {t('termsModal.sensitiveDataText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.purpose1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.purpose2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.purpose3')} {"\n\n"}

                            {t('termsModal.sensitiveDataNote')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.finalityTitle')} {"\n\n"}</Text>
                            {t('termsModal.finalityText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality3')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality4')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.finality5')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.rightsTitle')} {"\n\n"}</Text>
                            {t('termsModal.rightsText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights3')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights4')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.rights5')} {"\n\n"}

                            {t('termsModal.rightsNote')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.storageTitle')} {"\n\n"}</Text>
                            {t('termsModal.storageText1')} {"\n\n"}
                            {t('termsModal.storageText2')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.transferTitle')} {"\n\n"}</Text>
                            {t('termsModal.transferText')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.responsibilitiesTitle')} {"\n\n"}</Text>
                            {t('termsModal.responsibilitiesText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.responsibilities1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.responsibilities2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.responsibilities3')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.responsibilities4')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.liabilityTitle')} {"\n\n"}</Text>
                            {t('termsModal.liabilityText')} {"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.liability1')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.liability2')} {"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}{t('termsModal.liability3')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.modificationsTitle')} {"\n\n"}</Text>
                            {t('termsModal.modificationsText')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.legislationTitle')} {"\n\n"}</Text>
                            {t('termsModal.legislationText')} {"\n\n"}

                            <Text style={stylesAuth.subtitleTerminos}>{t('termsModal.acceptanceFinalTitle')} {"\n\n"}</Text>
                            {t('termsModal.acceptanceFinalText')} {"\n\n"}
                        </Text>
                    </ScrollView>

                    <TouchableOpacity style={stylesAuth.buttonTerminos} onPress={onClose}>
                        <Text style={stylesAuth.buttonTextTerminos}>{t('common.close')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}