import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';

export default function PrimaryButton({
  title,
  onPress = () => { },
  disabled = false,
}) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1081D2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#1081D2',
    width: "100%",
    alignSelf: 'center',
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    textAlign: 'center',
    opacity: 0.6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});