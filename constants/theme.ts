/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export { FONT_FILES, FontFamily, Fonts, Typography, fontFamily, fontFromWeight } from './fonts';

// Brand palette (shared) — restored previous softer greens
const Brand = {
  green: '#82ad51',
  paleGreen: '#bed4a4',
  deepOlive: '#2d3c1c',
  olive: '#4c542c',
  warmGray: '#848274',
  lightStone: '#b1afa2',
};

export const Colors = {
  light: {
    text: '#11181C', // dark text on light bg
    background: '#F7F9F4', // softened app background (not pure white)
    backgroundSoft: '#F4F6F0',
    tint: Brand.green,
    primary: Brand.green,
    secondary: Brand.olive,
    icon: Brand.warmGray,
    tabIconDefault: Brand.warmGray,
    tabIconSelected: Brand.green,
    card: '#FFFFFF',
    cardNested: '#F4F6F0',
    modalBackground: '#E8F1DC',
    border: '#C8D0BC',
    shadow: '#2d3c1c22',
    gradientStart: Brand.paleGreen,
    gradientEnd: '#F9FBF7',
    // semantic mappings for macros
    carbs: '#E67A3C', // orange-ish for carbs
    proteins: '#82ad51',
    fats: '#d94b4b',
    // brand accents
    brandDeep: Brand.deepOlive,
    brandLight: Brand.paleGreen,
  },
  dark: {
    text: '#ECEDEE', // light text on dark bg
    background: Brand.deepOlive,
    backgroundSoft: '#22241e',
    tint: Brand.paleGreen,
    primary: Brand.olive,
    secondary: Brand.green,
    icon: Brand.lightStone,
    tabIconDefault: Brand.lightStone,
    tabIconSelected: Brand.paleGreen,
    card: '#1B1D19',
    cardNested: '#22241e',
    modalBackground: '#353f2e',
    border: '#3d4038',
    shadow: '#00000090',
    gradientStart: Brand.deepOlive,
    gradientEnd: Brand.olive,
    carbs: '#E67A3C',
    proteins: '#82ad51',
    fats: '#d94b4b',
    brandDeep: Brand.deepOlive,
    brandLight: Brand.paleGreen,
  },
};

export const Shadows = {
  card: {
    shadowColor: '#2d3c1c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  cardSoft: {
    shadowColor: '#2d3c1c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

