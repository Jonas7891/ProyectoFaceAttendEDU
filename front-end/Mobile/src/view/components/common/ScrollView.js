import React from "react";
import {
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import stylescommon from "./style/Style";

export default function ScrollViews({
  children,
  showVerticalScroll = true,
  showHorizontalScroll = false,
  refreshing = false,
  onRefresh,
  loading = false,
  bottomSpace = 80,
  contentContainerstyle = {},
  style = {},
  keyboardShouldPersistTaps = "handled"
}) {
  if (loading) {
    return (
      <View style={[stylescommon.loadingContainer, contentContainerstyle]}>
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
      style={[stylescommon.ScrollViewWrapper]}
      contentContainerstyle={[
        stylescommon.contentContainerScroll,
        contentContainerstyle,
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