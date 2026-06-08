import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface LoaderProps {
  size?: number;
  color1?: string;
  color2?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 50,
  color1 = '#f74435', // carbs color
  color2 = '#1c96ed', // fats color
}) => {
  const rotation1 = useRef(new Animated.Value(0)).current;
  const rotation2 = useRef(new Animated.Value(0)).current;
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, 2000); // задержка 2 секунды перед запуском

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!started) return;

    const animate = () => {
      Animated.loop(
        Animated.timing(rotation1, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(rotation2, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    };

    animate();
  }, [started, rotation1, rotation2]);

  const rotate1 = rotation1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotate2 = rotation2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'], // reverse
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.circle,
          {
            borderColor: `${color1} ${color1} transparent transparent`,
            transform: [{ rotate: rotate1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            borderColor: `transparent transparent ${color2} ${color2}`,
            transform: [{ rotate: rotate2 }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 8,
    borderRadius: 25, // half of size
    borderStyle: 'solid',
  },
});