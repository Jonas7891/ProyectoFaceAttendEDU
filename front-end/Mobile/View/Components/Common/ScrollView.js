import React from "react";
import {
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import stylesCommon from "./Style/Style";

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
      <View style={[stylesCommon.loadingContainer, contentContainerStyle]}>
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
      style={[stylesCommon.scrollViewWrapper]}
      contentContainerStyle={[
        stylesCommon.contentContainerScroll,
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