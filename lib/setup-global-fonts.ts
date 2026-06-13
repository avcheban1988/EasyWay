import { Text, TextInput } from 'react-native';

import { FontFamily } from '@/constants/fonts';

let applied = false;

/** Устанавливает Roboto как шрифт по умолчанию для всех Text и TextInput. */
export function setupGlobalFonts() {
  if (applied) return;
  applied = true;

  const defaultStyle = { fontFamily: FontFamily.default };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textDefaults = (Text as any).defaultProps ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Text as any).defaultProps = {
    ...textDefaults,
    style: [textDefaults.style, defaultStyle],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputDefaults = (TextInput as any).defaultProps ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (TextInput as any).defaultProps = {
    ...inputDefaults,
    style: [inputDefaults.style, defaultStyle],
  };
}
