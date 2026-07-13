import { Button } from '@/components/ui/button';
import InputField from '@/components/ui/input-field';
import { Colors, Typography, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useFoodStore } from '@/store/foodStore';
import { useUserStore } from '@/store/userStore';
import { getNextOnboardingRoute } from '@/utils/get-next-route';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { account, hydrated: authHydrated, checkAuth, signIn, signUp, phoneSignIn } = useAuthStore();
  const { userProfile, resetProfile, loadProfile } = useUserStore();
  const { loadFoodEntries } = useFoodStore();

  const [mode, setMode] = useState<'signup' | 'signin'>(() => (account ? 'signin' : 'signup'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const phoneAnim = useRef(new Animated.Value(0)).current;
  // Pressable with scale animation wrapper
  function PressableScale({ children, style, onPress, activeOpacity = 0.85, ...props }: any) {
    const scale = useRef(new Animated.Value(1)).current;
    const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <TouchableOpacity
        style={style}
        activeOpacity={activeOpacity}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        {...props}
      >
        <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
      </TouchableOpacity>
    );
  }
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<'phone' | 'sms'>('phone');
  const [smsCode, setSmsCode] = useState('');
  
  // убираем анимацию логотипа — делаем статичное лого
  useEffect(() => {
    if (!authHydrated) checkAuth();
  }, [authHydrated, checkAuth]);

  // Всегда используем режим телефона, независимо от аккаунта

  const ctaText = mode === 'signup' ? 'Зарегистрироваться' : 'Войти';
  const titleText = 'CK';

  // Ротатор цитат для экрана входа
  const quotes = [
    'Движение — это лекарство. — Сержи Константин',
    'Питайтесь так, как хотите чувствовать себя. — Джилл Хадсон',
    'Спорт учит дисциплине — она переносится в жизнь. — Арнольд Шварценеггер',
    'Маленькие шаги каждый день дают большие результаты. — Мэг Форд',
    'Правильное питание — основа силы и энергии. — Майкл Поллан',
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);
  const quoteTranslate = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(1)).current;
  const QUOTE_CONTAINER_HEIGHT = 60; // фиксированная высота контейнера цитат, чтобы не прыгал блок
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const isValidEmail = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const isValidPassword = useMemo(() => password.length >= 6, [password]);
  const normalizePhone = (input: string) => {
    const digits = input.replace(/\D/g, '');
    if (digits.length === 0) return null;
    // take last 10 digits as national number
    const national = digits.length > 10 ? digits.slice(-10) : digits.length === 10 ? digits : digits;
    if (national.length < 10) return null;
    const part1 = national.slice(0, 3);
    const part2 = national.slice(3);
    return `${part1} ${part2}`;
  };
  const normalizedPhone = useMemo(() => normalizePhone(phoneRaw), [phoneRaw]);

  // display value: always show +7 prefix and format partial input nicely
  const phoneDisplay = useMemo(() => {
    const digits = phoneRaw.replace(/\D/g, '');
    // remove leading country/local prefix if present (7 or 8)
    let core = digits.replace(/^(8|7)/, '');
    // if user pasted long string, keep last 10
    if (core.length > 10) core = core.slice(-10);
    if (!core) return '';
    if (core.length >= 10) {
      const national = core.slice(-10);
      const p1 = national.slice(0, 3);
      const p2 = national.slice(3, 6);
      const p3 = national.slice(6, 8);
      const p4 = national.slice(8, 10);
      return `+7 ${p1} ${p2} ${p3} ${p4}`;
    }
    const p1 = core.slice(0, 3);
    const p2 = core.slice(3);
    return `+7 ${p1}${p2 ? ' ' + p2 : ''}`;
  }, [phoneRaw]);

  const IMAGE_HEIGHT = 390;
  const TARGET_TOP = 50; // final top offset for the input block
  const MOVE_UP = IMAGE_HEIGHT - TARGET_TOP;
  const INPUT_OFFSET = 60; // keep inputs lower by this many pixels when moved up

  const handlePhoneFocus = () => {
    setPhoneFocused(true);
    Animated.timing(phoneAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  };

  const handlePhoneBlur = () => {
    // keep focused state; user can press back arrow to return
  };

  const handleBackFromPhone = () => {
    Animated.timing(phoneAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      // откатываем состояние фокуса и оставляем пользователя на том же экране
      setPhoneFocused(false);
      setPhoneTouched(false);
    });
  };

  const animateQuoteChange = () => {
    // анимируем старую вверх полностью и исчезаем
    Animated.parallel([
      Animated.timing(quoteTranslate, { toValue: -QUOTE_CONTAINER_HEIGHT, duration: 450, useNativeDriver: true }),
      Animated.timing(quoteOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start(() => {
      // смена цитаты, подготавливаем вход снизу
      setQuoteIndex((i) => (i + 1) % quotes.length);
      quoteTranslate.setValue(QUOTE_CONTAINER_HEIGHT);
      quoteOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(quoteTranslate, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(quoteOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]).start();
    });
  };

  useEffect(() => {
    const id = setInterval(animateQuoteChange, 10000);
    return () => clearInterval(id);
  }, [quoteTranslate, quoteOpacity]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (mode === 'signup') {
      // for phone signup require valid phone and agreement
      if (!normalizedPhone) return false;
      if (!agree) return false;
      return true;
    }

    if (!email.trim() || !password.trim()) return false;
    if (!isValidEmail || !isValidPassword) return false;
    if (mode === 'signup' && !agree) return false;
    return true;
  }, [agree, email, loading, mode, password, normalizedPhone]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        // Phone signup flow: first step — отправка кода, вторая — проверка
        if (authStep === 'phone') {
          if (!normalizedPhone) {
            setError('Неверный номер телефона');
            setLoading(false);
            return;
          }
          // simulate send SMS
          setAuthStep('sms');
          setPhoneFocused(true);
          setLoading(false);
          return;
        }

        // проверяем введённый код
        if (authStep === 'sms') {
          if (smsCode.length !== 4) {
            setError('Введите 4-значный код');
            setLoading(false);
            return;
          }
          // Создаём/логиним пользователя по номеру телефона
          const cleanPhone = normalizedPhone!.replace(/\s/g, '');
          const ok = await phoneSignIn(cleanPhone);
          if (!ok) {
            setError('Ошибка при регистрации. Попробуйте снова.');
            setLoading(false);
            return;
          }
          // Загружаем профиль — если онбординг уже пройден, идём на главную
          await loadProfile(cleanPhone);
          const existingProfile = useUserStore.getState().userProfile;
          if (existingProfile.isOnboarded) {
            router.replace('/(tabs)');
          } else {
            resetProfile();
            router.replace('/onboarding/goal');
          }
          return;
        }
      }

      const ok = await signIn({ email, password });
      if (!ok) {
        setError('Неверный email. Попробуйте снова.');
        setLoading(false);
        return;
      }
      await loadProfile(email);
      router.replace(getNextOnboardingRoute(useUserStore.getState().userProfile));
      return;
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={mode === 'signup' ? [styles.scrollContent, { paddingTop: 0 }] : styles.scrollContent}
      >
        {mode === 'signup' ? (
          <View style={{ flex: 1, backgroundColor: '#fff', marginHorizontal: -20, marginTop: -20, paddingHorizontal: 0 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={{ width: '100%', height: IMAGE_HEIGHT }}>
                <Animated.Image
                  source={require('../../assets/images/RegAuth/vegetable.png')}
                  style={[styles.regImage, { position: 'absolute', top: 0, left: 0, right: 0, opacity: phoneAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) } ]}
                  resizeMode="cover"
                />
                <Animated.Image
                  source={require('../../assets/images/RegAuth/bgNumber.png')}
                  style={[styles.regImage, { position: 'absolute', top: 0, left: 0, right: 0, opacity: phoneAnim } ]}
                  resizeMode="cover"
                />
              </View>
              <View style={{ height: 30 }} />
              <Animated.View style={{ paddingHorizontal: 20, transform: [{ translateY: phoneAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -(MOVE_UP - INPUT_OFFSET)] }) }] }}>
                <Animated.View style={{ position: 'absolute', top: TARGET_TOP - 120, left: 25, opacity: phoneAnim, zIndex: 60 }}>
                  <PressableScale onPress={handleBackFromPhone} style={{ padding: 6 }}>
                    <MaterialIcons name="arrow-back" size={24} color="#53B175" />
                  </PressableScale>
                </Animated.View>

                {authStep === 'phone' ? (
                  <>
                    <Text style={[styles.phoneLabel, { color: colors.text }]}>Введите номер телефона</Text>

                    <InputField
                      label=""
                      value={phoneDisplay}
                      onChangeText={(t) => {
                        // keep only digits in internal state, max 11 (1 для кода + 10 для номера)
                        const d = t.replace(/\D/g, '').slice(0, 11);
                        setPhoneRaw(d);
                      }}
                      keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'phone-pad'}
                      placeholder={'+7 '}
                      errorText={phoneTouched && !normalizedPhone ? 'Введите корректный номер' : null}
                      onFocus={() => { setPhoneTouched(false); handlePhoneFocus(); }}
                      onBlur={() => { setPhoneTouched(true); handlePhoneBlur(); }}
                    />
                  </>
                ) : (
                  <>
                    <Text style={[styles.phoneLabel, { color: colors.text }]}>Введите код из смс</Text>
                    <InputField
                      label=""
                      value={smsCode.split('').join(' ')}
                      onChangeText={(t) => {
                        const d = t.replace(/\D/g, '').slice(0, 4);
                        setSmsCode(d);
                      }}
                      keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'phone-pad'}
                      placeholder={'- - - -'}
                      errorText={smsCode && smsCode.length < 4 ? 'Код должен состоять из 4 цифр' : null}
                      onFocus={() => { setPhoneTouched(false); handlePhoneFocus(); }}
                      onBlur={() => { setPhoneTouched(true); handlePhoneBlur(); }}
                    />

                    <TouchableOpacity onPress={() => { /* resend logic placeholder */ }} style={{ marginTop: 10 }}>
                      <Text style={{ color: '#53B175', fontFamily: fontFamily('regular', '18') }}>Отправить код еще раз</Text>
                    </TouchableOpacity>
                  </>
                )}

                <Animated.View style={{ alignItems: 'center', marginTop: 18, opacity: phoneAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }} pointerEvents={phoneFocused ? 'none' : 'auto'}>
                  <Text style={[styles.orText, { color: colors.icon }]}>или можете войти через социальные сети</Text>
                </Animated.View>

                <Animated.View style={[styles.socialButtonsWrap, { opacity: phoneAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]} pointerEvents={phoneFocused ? 'none' : 'auto'}>
                  <PressableScale style={[styles.socialWideButton, styles.buttonShadow]} onPress={() => setError(null)}>
                    <Text style={styles.socialWideButtonText}>Войти через VK</Text>
                  </PressableScale>
                  <PressableScale style={[styles.socialWideButton, { marginTop: 12 }, styles.buttonShadow]} onPress={() => setError(null)}>
                    <Text style={styles.socialWideButtonText}>Войти через Яндекс</Text>
                  </PressableScale>
                </Animated.View>
                {/* регистрационная кнопка удалена */}

                <Animated.View style={[styles.nextFabWrap, { opacity: phoneAnim }]} pointerEvents={phoneFocused ? 'auto' : 'none'}>
                  <PressableScale style={[styles.nextFab, styles.buttonShadow]} onPress={handleSubmit}>
                    <MaterialIcons name="arrow-forward" size={28} color="#fff" />
                  </PressableScale>
                </Animated.View>
              </Animated.View>
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.header, { backgroundColor: colors.primary, borderColor: 'transparent' }]}> 
          <Image source={require('../../assets/icons/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.title, { color: '#fff', textTransform: 'uppercase' }]}>{titleText}</Text>

          <View style={{ overflow: 'hidden', height: QUOTE_CONTAINER_HEIGHT, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Animated.Text
                numberOfLines={3}
                style={[
                  styles.subtitle,
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.95)',
                    fontFamily: fontFamily('light', '18'),
                    fontStyle: 'italic',
                    transform: [{ translateY: quoteTranslate }],
                    opacity: quoteOpacity,
                    paddingHorizontal: 12,
                    fontSize: 15,
                    lineHeight: 20,
                  },
                ]}
              >
                {quotes[quoteIndex]}
              </Animated.Text>
            </View>
        </View>

        )}

        {mode !== 'signup' && (
          <View style={[styles.card, { backgroundColor: colors.card, borderWidth: 0, shadowColor: colors.shadow }]}> 
          <InputField
            label="Эл. почта"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="ваш@email.ru"
            errorText={emailTouched && !isValidEmail ? 'Неверный email' : null}
            onFocus={() => setFocusedField('email')}
            onBlur={() => {
              setFocusedField(null);
              setEmailTouched(true);
            }}
          />

          <InputField
            label="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Пароль"
            errorText={passwordTouched && !isValidPassword ? 'Пароль должен быть не короче 6 символов' : null}
            onFocus={() => setFocusedField('password')}
            onBlur={() => {
              setFocusedField(null);
              setPasswordTouched(true);
            }}
          />

          {mode === 'signup' && (
            <PressableScale
              style={styles.checkboxRow}
              onPress={() => setAgree((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agree && styles.checkboxChecked, { borderColor: colors.tint }]}> 
                {agree ? <Text style={styles.checkboxMark}>✓</Text> : null}
              </View>
              <Text style={[styles.checkboxText, { color: colors.icon }]}>Я принимаю условия сервиса.</Text>
            </PressableScale>
          )}

          {error && <Text style={[styles.errorText, { color: '#d32f2f' }]}>{error}</Text>}

          <View style={styles.ctaWrap}>
            <Button
              title={ctaText}
              onPress={handleSubmit}
              disabled={!canSubmit}
              loading={loading}
              style={mode === 'signup' ? styles.signUpButton : undefined}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.icon }]}> 
              {mode === 'signup' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
            </Text>
            <PressableScale
              onPress={() => {
                setMode((m) => (m === 'signup' ? 'signin' : 'signup'));
                setError(null);
              }}
              style={styles.switchButton}
              activeOpacity={0.8}
            >
              <Text style={[styles.switchButtonText, { color: colors.tint }]}> 
                {mode === 'signup' ? 'Войти' : 'Создать'}
              </Text>
            </PressableScale>
          </View>

          <View style={styles.divider} />

          <View style={styles.socialRow}>
            {['G', '', 'f', 'X'].map((label, idx) => (
              <PressableScale
                key={idx}
                style={[styles.socialButton, styles.buttonShadow]}
                activeOpacity={0.8}
                onPress={() => setError(null)}
              >
                <Text style={[Typography.title, { color: colors.icon }]}>{label}</Text>
              </PressableScale>
            ))}
          </View>
          </View>
        )}
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    ...Typography.displayLarge,
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    fontFamily: fontFamily('light', '18'),
    textAlign: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },

  card: {
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: '#FAFBF7',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
  },
  input: {
    ...Typography.input,
    paddingVertical: Platform.select({ ios: 14, android: 14 }),
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    opacity: 1,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    marginRight: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7cb342',
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 16,
  },
  checkboxText: {
    ...Typography.caption,
    flex: 1,
  },

  errorText: {
    ...Typography.caption,
    marginBottom: 10,
    textAlign: 'center',
  },

  ctaWrap: {
    position: 'relative',
    marginTop: 6,
  },
  signUpButton: {
    backgroundColor: '#7cb342',
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  switchText: {
    ...Typography.caption,
  },
  switchButton: {
    paddingLeft: 6,
  },
  switchButtonText: {
    ...Typography.caption,
    fontFamily: Typography.bodySemiBold.fontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regImage: {
    width: '100%',
    height: 390,
    marginTop: -20,
    alignSelf: 'stretch',
  },
  phoneLabel: {
    fontFamily: fontFamily('semiBold', '24'),
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 12,
  },
  orText: {
    fontFamily: fontFamily('light', '18'),
    fontSize: 12,
    textAlign: 'center',
  },
  socialButtonsWrap: {
    alignItems: 'center',
    marginTop: 12,
  },
  socialWideButton: {
    width: '80%',
    backgroundColor: '#5383EC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  socialWideButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontFamily('light', '24'),
  },
  nextFabWrap: {
    position: 'absolute',
    right: 20,
    bottom: 12,
    zIndex: 30,
  },
  nextFab: {
    width: 67,
    height: 67,
    borderRadius: 34,
    backgroundColor: '#53B175',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  nextFabIcon: {
    width: 18,
    height: 18,
  },
  backButtonIcon: {
    width: 12,
    height: 12,
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
});
