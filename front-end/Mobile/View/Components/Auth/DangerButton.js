import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import stylesAuth from "./Style/Style";

export default function DangerButton({
  title,
  onPress = () => { },
  disabled = false,
}) {
  return (
    <TouchableOpacity
      style={[stylesAuth.button, disabled && stylesAuth.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={stylesAuth.text}>{title}</Text>
    </TouchableOpacity>
  );
}