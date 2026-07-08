import React from 'react';
import {
    ImageBackground,
    ImageSourcePropType,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

type ScreenBackgroundProps = {
  source: ImageSourcePropType;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Полупрозрачный оверлей поверх картинки (например rgba(0,0,0,0.2)) */
  overlayColor?: string;
  /** Лёгкий зум картинки (>1), экран по-прежнему заполняется целиком (cover + обрезка краёв) */
  imageScale?: number;
};

export function ScreenBackground({
  source,
  children,
  style,
  overlayColor,
  imageScale = 1,
}: ScreenBackgroundProps) {
  return (
    <ImageBackground
      source={source}
      style={[styles.background, style]}
      resizeMode="cover"
      imageStyle={imageScale > 1 ? { transform: [{ scale: imageScale }] } : undefined}
    >
      {overlayColor ? (
        <View style={[styles.overlay, { backgroundColor: overlayColor }]} pointerEvents="none" />
      ) : null}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
});
