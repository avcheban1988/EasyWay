import { Platform, TextStyle } from 'react-native';

/**
 * Roboto optical sizes mapping used across the app:
 * - 18pt — small text: captions, inputs, secondary text (12–16px)
 * - 24pt — UI and main text: buttons, lists, sections (16–20px)
 * - 28pt — headings and large numbers (22px+)
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

export type OpticalSize = '18' | '24' | '28';

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
export function fontFamily(weight: FontWeight = 'regular', size: OpticalSize | 'base' = '18'): string {
  const suffix = WEIGHT_SUFFIX[weight];
  if (size === 'base') {
    return weight === 'regular' ? 'Roboto' : `Roboto-${suffix}`;
  }
  return `Roboto-${size}pt-${suffix}`;
}

/** Шрифт по fontWeight — для миграции стилей с fontWeight вместо fontFamily. */
export function fontFromWeight(
  fontWeight?: TextStyle['fontWeight'],
  fontSize = 16,
): string {
  const size: OpticalSize = fontSize >= 26 ? '28' : fontSize >= 18 ? '24' : '18';

  switch (fontWeight) {
    case '100':
    case '200':
    case '300':
    case 'light':
      return fontFamily('light', size);
    case '500':
    case 'medium':
      return fontFamily('medium', size);
    case '600':
      return fontFamily('semiBold', size);
    case '700':
    case 'bold':
      return fontFamily('bold', size);
    case '800':
      return fontFamily('extraBold', size);
    case '900':
    case 'black':
      return fontFamily('black', size);
    default:
      return fontFamily('regular', size);
  }
}

export const FontFamily = Platform.select({
  web: 'Roboto',
  default: fontFamily('regular', '18'),
}) as const;

/** Готовые типографические стили — используйте вместо fontWeight. */
export const Typography = {
  displayLarge: {
    fontFamily: fontFamily('bold', '28'),
    fontSize: 32,
    lineHeight: 40,
  },
  display: {
    fontFamily: fontFamily('semiBold', '28'),
    fontSize: 28,
    lineHeight: 34,
  },
  headline: {
    fontFamily: fontFamily('bold', '24'),
    fontSize: 22,
    lineHeight: 28,
  },
  title: {
    fontFamily: fontFamily('semiBold', '24'),
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: fontFamily('medium', '18'),
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontFamily: fontFamily('regular', '18'),
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fontFamily('medium', '18'),
    fontSize: 16,
    lineHeight: 24,
  },
  bodySemiBold: {
    fontFamily: fontFamily('semiBold', '18'),
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: fontFamily('semiBold', '18'),
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily('regular', '18'),
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: fontFamily('semiBold', '24'),
    fontSize: 16,
    lineHeight: 22,
  },
  input: {
    fontFamily: fontFamily('regular', '18'),
    fontSize: 16,
    lineHeight: 22,
  },
  stat: {
    fontFamily: fontFamily('extraBold', '28'),
    fontSize: 36,
    lineHeight: 42,
  },
  tabLabel: {
    fontFamily: fontFamily('medium', '18'),
    fontSize: 10,
  },
} as const satisfies Record<string, TextStyle>;

/** TTF-файлы для expo-font — только те, что реально используются в Typography. */
export const FONT_FILES = {
  // 18pt — мелкий текст, подписи, поля ввода
  'Roboto-18pt-Light': require('../assets/fonts/Roboto/static/Roboto-Light.ttf'),
  'Roboto-18pt-Regular': require('../assets/fonts/Roboto/static/Roboto-Regular.ttf'),
  'Roboto-18pt-Medium': require('../assets/fonts/Roboto/static/Roboto-Medium.ttf'),
  'Roboto-18pt-SemiBold': require('../assets/fonts/Roboto/static/Roboto-SemiBold.ttf'),

  // 24pt — кнопки, UI, основной контент
  'Roboto-24pt-SemiBold': require('../assets/fonts/Roboto/static/Roboto-SemiBold.ttf'),
  'Roboto-24pt-Bold': require('../assets/fonts/Roboto/static/Roboto-Bold.ttf'),

  // 28pt — заголовки, крупные числа
  'Roboto-28pt-SemiBold': require('../assets/fonts/Roboto/static/Roboto-SemiBold.ttf'),
  'Roboto-28pt-Bold': require('../assets/fonts/Roboto/static/Roboto-Bold.ttf'),
  'Roboto-28pt-ExtraBold': require('../assets/fonts/Roboto/static/Roboto-ExtraBold.ttf'),
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
    sans: `'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
