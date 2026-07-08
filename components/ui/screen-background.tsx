import React from 'react';
import {
    Dimensions,
    ImageBackground,
    ImageSourcePropType,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenBackgroundProps = {
  source: ImageSourcePropType;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Полупрозрачный оверлей поверх картинки (например rgba(0,0,0,0.2)) */
  overlayColor?: string;
  /** Лёгкий зум картинки (>1), экран по-прежнему заполняется целиком (cover + обрезка краёв) */
  imageScale?: number;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ScreenBackground({
  source,
  children,
  style,
  overlayColor,
  imageScale = 1,
}: ScreenBackgroundProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={source}
        style={[styles.background, style]}
        resizeMode="cover"
        imageStyle={imageScale > 1 ? { transform: [{ scale: imageScale }] } : undefined}
      >
        {overlayColor ? (
          <View style={[styles.overlay, { backgroundColor: overlayColor }]} pointerEvents="none" />
        ) : null}
      </ImageBackground>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
});
