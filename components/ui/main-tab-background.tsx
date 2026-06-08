import { ScreenBackground } from '@/components/ui/screen-background';
import React from 'react';

type MainTabBackgroundProps = {
  children: React.ReactNode;
};

export function MainTabBackground({ children }: MainTabBackgroundProps) {
  return (
    <ScreenBackground
      source={require('../../assets/images/bgMain.jpg')}
      overlayColor="rgba(45, 60, 28, 0.07)"
    >
      {children}
    </ScreenBackground>
  );
}
