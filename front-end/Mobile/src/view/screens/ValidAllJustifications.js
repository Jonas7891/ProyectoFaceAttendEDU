import React from "react";
import {View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { useTheme } from '../components/common/ThemeContext';
import styles from "./Style";
import { useJustificationsViewModel } from '../../viewmodels/useValidAllJustificationsViewModel';

export default function JustificationsScreen() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const refreshKey = useLanguageRefresh();

    const {
        justifications,
        updateKey,
        categories,
        getJustificationsByCategory,
        handleBack,
    } = useJustificationsViewModel();

    const renderJustificationItem = (item, index) => (
        <View
            key={item.id}
            style={[
                styles.validAllJustificationsItemCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder }
            ]}
        >
            <View style={styles.validAllJustificationsItemHeader}>
                <View style={[styles.validAllJustificationsItemNumber, { backgroundColor: colors.primary }]}>
                    <Text style={styles.validAllJustificationsItemNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.validAllJustificationsItemType, { color: colors.text }]}>
                    {item.type}
                </Text>
            </View>

            <View style={[styles.validAllJustificationsItemSeparator, { backgroundColor: colors.separator }]} />

            <View style={styles.validAllJustificationsItemFooter}>
                <View style={[styles.validAllJustificationsItemBadge, { backgroundColor: colors.badgeBackground }]}>
                    <Text style={[styles.validAllJustificationsItemBadgeText, { color: colors.badgeText }]}>
                        {item.category}
                    </Text>
                </View>
                <Text style={[styles.validAllJustificationsItemDocText, { color: colors.textMuted }]}>
                    {item.requiresDocument ? t('admin.requiresDocument') : t('admin.noDocumentRequired')}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView
            style={[styles.validAllJustificationsSafeArea, { backgroundColor: colors.background }]}
            key={`${refreshKey}-${updateKey}`}
        >
            <View style={[styles.validAllJustificationsContainer, { backgroundColor: colors.background,  marginTop: Platform.OS === "ios" ? 0 : 50} ]} marginHorizontal={10}>
                <View style={[styles.validAllJustificationsHeader, { backgroundColor: colors.background }]}>
                    <Text style={[styles.validAllJustificationsTitle, { color: colors.text }]}>
                        {t("justifications.validList")}
                    </Text>
                    <View style={[styles.validAllJustificationsBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.validAllJustificationsBadgeText}>{justifications.length}</Text>
                    </View>
                </View>

                <View style={[styles.validAllJustificationsSeparator, { backgroundColor: colors.separator }]} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.validAllJustificationsScrollContent}>
                    {justifications.length > 0 ? (
                        categories.map((category) => {
                            const categoryItems = getJustificationsByCategory(category);
                            return (
                                <View key={category} style={styles.validAllJustificationsCategorySection}>
                                    <View style={[styles.validAllJustificationsCategoryHeader, { backgroundColor: colors.categoryBackground }]}>
                                        <Text style={[styles.validAllJustificationsCategoryTitle, { color: colors.categoryText }]}>
                                            {category}
                                        </Text>
                                        <Text style={[styles.validAllJustificationsCategoryCount, { color: colors.textMuted }]}>
                                            {categoryItems.length} {t('justifications.items')}
                                        </Text>
                                    </View>
                                    {categoryItems.map((item, index) => renderJustificationItem(item, index))}
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.validAllJustificationsEmptyState}>
                            <Text style={styles.validAllJustificationsEmptyIcon}>📋</Text>
                            <Text style={[styles.validAllJustificationsEmptyTitle, { color: colors.text }]}>
                                {t('justifications.noJustifications')}
                            </Text>
                            <Text style={[styles.validAllJustificationsEmptyDescription, { color: colors.textMuted }]}>
                                {t('justifications.noJustificationsDesc')}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleBack}
                        style={[styles.validAllJustificationsBackButton, { backgroundColor: colors.backButtonBackground, borderColor: colors.separator }]}
                    >
                        <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>
                            ← {t('common.back')}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}