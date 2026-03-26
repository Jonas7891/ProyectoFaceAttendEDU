import React from 'react';
import { View, StyleSheet } from 'react-native';

const Separador = () => (
  <View style={styles.separador} />
);

const styles = StyleSheet.create({
  separador: {
    height: 1,
    backgroundColor: '#b4b4b4',
    marginVertical: 10,
    width: '100%',
  },
});

export default Separador;
