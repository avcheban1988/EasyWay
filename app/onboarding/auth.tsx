import { Button } from '@/components/ui/button';
import { ScreenBackground } from '@/components/ui/screen-background';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useFoodStore } from '@/store/foodStore';
import { useUserStore, type UserProfile } from '@/store/userStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { account, hydrated: authHydrated, checkAuth, signIn, signUp } = useAuthStore();
  const { userProfile, resetProfile, loadProfile } = useUserStore();
  const { loadFoodEntries } = useFoodStore();

  const [mode, setMode] = useState<'signup' | 'signin'>(() => (account ? 'signin' : 'signup'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // убираем анимацию логотипа — делаем статичное лого
  useEffect(() => {
    if (!authHydrated) checkAuth();
  }, [authHydrated, checkAuth]);

  useEffect(() => {
    if (authHydrated) setMode(account ? 'signin' : 'signup');
  }, [account, authHydrated]);

  const ctaText = mode === 'signup' ? 'Зарегистрироваться' : 'Войти';
  const titleText = 'EasyWay';

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
    if (!email.trim() || !password.trim()) return false;
    if (!isValidEmail || !isValidPassword) return false;
    if (mode === 'signup' && !agree) return false;
    return true;
  }, [agree, email, loading, mode, password]);

  const getNextRoute = (profile: UserProfile) => {
    if (profile.isOnboarded) return '/(tabs)';
    if (!profile.goal) return '/onboarding/goal';
    if (!profile.gender || profile.age === null || profile.height === null || profile.weight === null) {
      return '/onboarding/anthropometry';
    }
    if (!profile.activityLevel) return '/onboarding/activity';
    if (profile.gymDaysPerWeek === null) return '/onboarding/gym-frequency';
    return '/onboarding/results';
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        await signUp({ email, password });
        // Start onboarding from scratch for a new account.
        resetProfile();
        await loadProfile(email);
        router.replace(getNextRoute(useUserStore.getState().userProfile));
        return;
      }

      const ok = await signIn({ email, password });
      if (!ok) {
        setError('Неверный email. Попробуйте снова.');
        setLoading(false);
        return;
      }
      await loadProfile(email);
      router.replace(getNextRoute(useUserStore.getState().userProfile));
      return;
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground
      source={require('../../assets/images/bg1.jpg')}
      overlayColor="rgba(0, 0, 0, 0.12)"
      imageScale={1.2}
    >
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: colors.primary, borderColor: 'transparent' }]}> 
          <Image source={require('../../assets/icons/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.title, { color: '#fff', fontFamily: 'TikTokSans-Bold', textTransform: 'uppercase' }]}>{titleText}</Text>

          {mode === 'signup' ? (
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.95)', fontFamily: 'TikTokSans-Light', fontStyle: 'italic', textTransform: 'none', maxWidth: 340, textAlign: 'center' }]}>сегодня ты меняешь своё завтра</Text>
          ) : (
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
                    fontFamily: 'TikTokSans-Light',
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
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderWidth: 0, shadowColor: colors.shadow }]}> 
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text, fontFamily: 'TikTokSans' }]}>Эл. почта</Text>
            {(() => {
              const emailBorderColor =
                focusedField === 'email' ? colors.tint : emailTouched ? (isValidEmail ? colors.tint : '#d32f2f') : colors.border;
              return (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: emailBorderColor,
                        backgroundColor: colors.card,
                        fontFamily: 'TikTokSans',
                      },
                    ]}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="ваш@email.ru"
                    placeholderTextColor={colors.icon}
                    value={email}
                    onChangeText={setEmail}
                    selectionColor={colors.tint}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => {
                      setFocusedField(null);
                      setEmailTouched(true);
                    }}
                  />
                  {emailTouched && !isValidEmail ? (
                    <Text style={{ color: '#d32f2f', fontSize: 12, marginTop: 6 }}>Неверный email</Text>
                  ) : null}
                </>
              );
            })()}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text, fontFamily: 'TikTokSans' }]}>Пароль</Text>
            {(() => {
              const passBorderColor =
                focusedField === 'password' ? colors.tint : passwordTouched ? (isValidPassword ? colors.tint : '#d32f2f') : colors.border;
              return (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: passBorderColor,
                        backgroundColor: colors.card,
                        fontFamily: 'TikTokSans',
                      },
                    ]}
                    secureTextEntry
                    placeholder="Пароль"
                    placeholderTextColor={colors.icon}
                    value={password}
                    onChangeText={setPassword}
                    selectionColor={colors.tint}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => {
                      setFocusedField(null);
                      setPasswordTouched(true);
                    }}
                  />
                  {passwordTouched && !isValidPassword ? (
                    <Text style={{ color: '#d32f2f', fontSize: 12, marginTop: 6 }}>Пароль должен быть не короче 6 символов</Text>
                  ) : null}
                </>
              );
            })()}
          </View>

          {mode === 'signup' && (
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgree((v) => !v)} activeOpacity={0.7}>
              <View style={[styles.checkbox, agree && styles.checkboxChecked, { borderColor: colors.tint }]} />
              <Text style={[styles.checkboxText, { color: colors.icon, fontFamily: 'TikTokSans' }]}>Я принимаю условия сервиса.</Text>
            </TouchableOpacity>
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
            <Text style={[styles.switchText, { color: colors.icon, fontFamily: 'TikTokSans' }]}> 
              {mode === 'signup' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
            </Text>
            <TouchableOpacity onPress={() => setMode((m) => (m === 'signup' ? 'signin' : 'signup'))} style={styles.switchButton}>
              <Text style={[styles.switchButtonText, { color: colors.tint, fontFamily: 'TikTokSans' }]}> 
                {mode === 'signup' ? 'Войти' : 'Создать'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.socialRow}>
            {['G', '', 'f', 'X'].map((label, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => setError(null)}
              >
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.icon }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        </ScrollView>
      </View>
    </ScreenBackground>
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
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'TikTokSans',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'TikTokSans',
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
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    paddingVertical: Platform.select({ ios: 14, android: 14 }),
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    fontWeight: '600',
    fontFamily: 'TikTokSans',
    // Slightly muted text for placeholder on web/ios fallback
    opacity: 1,
  },

  checkboxRow: {
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
  },
  checkboxChecked: {
    backgroundColor: '#7cb342',
  },
  checkboxText: {
    fontSize: 12,
    flex: 1,
  },

  errorText: {
    fontSize: 13,
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
    fontSize: 13,
  },
  switchButton: {
    paddingLeft: 6,
  },
  switchButtonText: {
    fontSize: 13,
    fontWeight: '700',
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
});
