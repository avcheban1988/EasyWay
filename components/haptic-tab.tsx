import React from 'react';
import { TouchableOpacity, type GestureResponderEvent } from 'react-native';

export function HapticTab({ children, onPress, accessibilityRole }: { children: React.ReactNode; onPress?: (event: GestureResponderEvent) => void; accessibilityRole?: string; }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole={accessibilityRole as any} style={{ flex: 1 }}>
      {children}
    </TouchableOpacity>
  );
}
