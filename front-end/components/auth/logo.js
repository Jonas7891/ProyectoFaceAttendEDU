import React from 'react';
import { Image, StyleSheet, View } from "react-native";

export default function CustomLogo({
  source,
  size = "medium",
  customSize,
  rounded = true,
  backgroundColor = "#000000",
  marginBottom = 20,
}) {

  const getSize = () => {
    if (customSize) return customSize;

    switch (size) {
      case "small":
        return { width: 80, height: 80 };
      case "medium":
        return { width: 120, height: 120 };
      case "large":
        return { width: 160, height: 160 };
      case "xlarge":
        return { width: 200, height: 200 };
      default:
        return { width: 120, height: 120 };
    }
  };

  const dimensions = getSize();

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: rounded ? dimensions.width / 2 : 0,
          backgroundColor,
          marginBottom,
        },
      ]}
    >
      <Image
        style={styles.image}
        source={source || require("../../assets/images/logoFaceAttend.png")}
        accessibilityLabel="Logo de FaceAttend"
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});