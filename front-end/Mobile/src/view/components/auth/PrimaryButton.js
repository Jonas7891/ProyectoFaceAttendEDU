import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import stylesauth from "./style/Style";

export default function PrimaryButton({
  title,
  onPress = () => { },
  disabled = false,
}) {
  return (
    <TouchableOpacity
      style={[stylesauth.buttonPrimary, disabled && stylesauth.buttonDisabledPrimary]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={stylesauth.textPrimaryButton}>{title}</Text>
    </TouchableOpacity>
  );
}