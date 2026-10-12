import React from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./Styles/SchoolsScreen/Style";
import { useSchoolsViewModel } from "../../viewmodels/useSchoolsViewModel";

function SchoolCard({ school, colors, t }) {
  const active = school.status !== false;
  return (
    <View
      style={[
        styles.schoolCard,
        { backgroundColor: colors.card ?? colors.backgroundWhite, borderColor: colors.separator ?? "#E5E7EB" },
      ]}
    >
      <Text style={[styles.schoolName, { color: colors.text }]}>{school.name}</Text>
      <Text style={[styles.schoolMeta, { color: colors.textSecondary ?? colors.textMuted }]}>
        {school.code}
        {school.address ? ` · ${school.address}` : ""}
      </Text>
      {school.phone ? (
        <Text style={[styles.schoolMeta, { color: colors.textSecondary ?? colors.textMuted }]}>
          {school.phone}
        </Text>
      ) : null}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: active ? "#DCFCE7" : "#FEE2E2" }]}>
          <Text style={[styles.badgeText, { color: active ? "#14532D" : "#7F1D1D" }]}>
            {active ? t("schools.active") : t("schools.inactive")}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight ?? "#E0E7FF" }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {t("schools.programs")}: {school.programsCount}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function SchoolsScreen({ navigation }) {
  const { loading, error, schools, reload, colors, t } = useSchoolsViewModel();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundWhite }]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation?.navigate("DashboardScreen")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <View style={styles.backIcon}>
              <Image
                source={require("../../assets/images/flecha-volver.png")}
                style={[styles.backIconImage, { tintColor: colors.text }]}
              />
            </View>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("schools.title")}</Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary ?? colors.textMuted }]}>
          {t("schools.subtitle")}
        </Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <Text style={[styles.centerText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity
              onPress={reload}
              activeOpacity={0.7}
              accessibilityRole="button"
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.retryText}>{t("schools.retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : schools.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={[styles.centerText, { color: colors.text }]}>{t("schools.empty")}</Text>
          </View>
        ) : (
          <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
          >
            {schools.map((school) => (
              <SchoolCard key={school.schoolId} school={school} colors={colors} t={t} />
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
