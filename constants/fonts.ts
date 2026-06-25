import { Platform, TextStyle } from 'react-native';

/**
 * Montserrat font mapping used across the app.
 *
 * We keep the fontFamily(...) helper so existing calls remain unchanged.
 */
export type FontWeight =
  | 'light'
  | 'regular'
  | 'medium'
  | 'semiBold'
  | 'bold'
  | 'extraBold'
  | 'black';

const WEIGHT_SUFFIX: Record<FontWeight, string> = {
  light: 'Light',
  regular: 'Regular',
  medium: 'Medium',
  semiBold: 'SemiBold',
  bold: 'Bold',
  extraBold: 'ExtraBold',
  black: 'Black',
};

/** Возвращает имя семейства, зарегистрированное в useFonts. */
export function fontFamily(weight: FontWeight = 'regular', _size?: string): string {
  const suffix = WEIGHT_SUFFIX[weight];
  return weight === 'regular' ? 'Montserrat' : `Montserrat-${suffix}`;
}

/** Шрифт по fontWeight — для миграции стилей с fontWeight вместо fontFamily. */
export function fontFromWeight(
  fontWeight?: TextStyle['fontWeight'],
  _fontSize = 16,
): string {
  switch (fontWeight) {
    case '100':
    case '200':
    case '300':
    case 'light':
      return fontFamily('light');
    case '500':
    case 'medium':
      return fontFamily('medium');
    case '600':
      return fontFamily('semiBold');
    case '700':
    case 'bold':
      return fontFamily('bold');
    case '800':
      return fontFamily('extraBold');
    case '900':
    case 'black':
      return fontFamily('black');
    default:
      return fontFamily('regular');
  }
}

export const FontFamily = {
  default: fontFamily('regular'),
} as const;

/** Готовые типографические стили — используйте вместо fontWeight. */
export const Typography = {
  displayLarge: {
    fontFamily: fontFamily('bold'),
    fontSize: 32,
    lineHeight: 40,
  },
  display: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 28,
    lineHeight: 34,
  },
  headline: {
    fontFamily: fontFamily('bold'),
    fontSize: 22,
    lineHeight: 28,
  },
  title: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: fontFamily('medium'),
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontFamily: fontFamily('regular'),
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fontFamily('medium'),
    fontSize: 16,
    lineHeight: 24,
  },
  bodySemiBold: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily('regular'),
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 16,
    lineHeight: 22,
  },
  input: {
    fontFamily: fontFamily('regular'),
    fontSize: 16,
    lineHeight: 22,
  },
  stat: {
    fontFamily: fontFamily('extraBold'),
    fontSize: 36,
    lineHeight: 42,
  },
  tabLabel: {
    fontFamily: fontFamily('medium'),
    fontSize: 10,
  },
} as const satisfies Record<string, TextStyle>;

/** TTF-файлы для expo-font. */
export const FONT_FILES = {
  'Montserrat': require('../assets/fonts/Montserrat/static/Montserrat-Regular.ttf'),
  'Montserrat-Light': require('../assets/fonts/Montserrat/static/Montserrat-Light.ttf'),
  'Montserrat-Regular': require('../assets/fonts/Montserrat/static/Montserrat-Regular.ttf'),
  'Montserrat-Medium': require('../assets/fonts/Montserrat/static/Montserrat-Medium.ttf'),
  'Montserrat-SemiBold': require('../assets/fonts/Montserrat/static/Montserrat-SemiBold.ttf'),
  'Montserrat-Bold': require('../assets/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  'Montserrat-ExtraBold': require('../assets/fonts/Montserrat/static/Montserrat-ExtraBold.ttf'),
  'Montserrat-Black': require('../assets/fonts/Montserrat/static/Montserrat-Black.ttf'),
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: FontFamily.default,
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: FontFamily.default,
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: `'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
