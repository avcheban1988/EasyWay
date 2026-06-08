import React from 'react';
import { Text, Linking, StyleSheet, TouchableOpacity } from 'react-native';

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(href)} style={styles.link}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: { paddingVertical: 6 },
  text: { color: '#1e90ff', textDecorationLine: 'underline' },
});
