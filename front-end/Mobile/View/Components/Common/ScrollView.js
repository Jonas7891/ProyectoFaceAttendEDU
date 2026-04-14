import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

export default function ScrollViews({
  children,
  showVerticalScroll = true,
  showHorizontalScroll = false,
  refreshing = false,
  onRefresh,
  loading = false,
  bottomSpace = 80,
  contentContainerStyle = {},
  style = {},
  keyboardShouldPersistTaps = "handled"
}) {
  if (loading) {
    return (
      <View style={[styles.loadingContainer, contentContainerStyle]}>
        <ActivityIndicator color="#4CAF50" />
      </View>
    );
  }

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#4CAF50", "#2196F3", "#FF9800"]}
      tintColor="#4CAF50"
    />
  ) : undefined;

  return (
    <ScrollView
      style={[styles.scrollView]}
      contentContainerStyle={[
        styles.contentContainer,
        contentContainerStyle,
        { paddingBottom: bottomSpace }
      ]}
      showsVerticalScrollIndicator={showVerticalScroll}
      showsHorizontalScrollIndicator={showHorizontalScroll}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});