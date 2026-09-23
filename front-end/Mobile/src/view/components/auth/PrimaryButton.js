import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styleAuth from "./style/Style";

export default function PrimaryButton({
  title,
  onPress = () => { },
  disabled = false,
}) {
  return (
    <TouchableOpacity
      style={[styleAuth.buttonPrimary, disabled && styleAuth.buttonDisabledPrimary]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styleAuth.textPrimaryButton}>{title}</Text>
    </TouchableOpacity>
  );
}