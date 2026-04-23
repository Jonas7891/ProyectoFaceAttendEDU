import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import stylesAuth from "./Style/Style";

export default function PrimaryButton({
  title,
  onPress = () => { },
  disabled = false,
}) {
  return (
    <TouchableOpacity
      style={[stylesAuth.buttonPrimary, disabled && stylesAuth.buttonDisabledPrimary]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={stylesAuth.textPrimaryButton}>{title}</Text>
    </TouchableOpacity>
  );
}