import { Button } from '@/components/ui/button';
import { GenderSelector } from '@/components/ui/gender-selector';
import InputField from '@/components/ui/input-field';
import { Colors, fontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GenderType, useUserStore } from '@/store/userStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function PressableScale({
  children,
  style,
  onPress,
  ...props
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  [key: string]: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      style={style}
      activeOpacity={0.85}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      {...props}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function AnthropometryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { userProfile, setGender, setBirthDate, setHeight, setWeight } = useUserStore();

  const [localGender, setLocalGender] = useState<GenderType | null>(userProfile.gender);
  
  // Инициализируем дату рождения. Если есть birthDate в профиле, используем её, иначе создаём дату на основе возраста
  const initialBirthDate = userProfile.birthDate 
    ? new Date(userProfile.birthDate)
    : new Date(new Date().getFullYear() - (userProfile.age || 25), 0, 1);
  
  const [localBirthDate, setLocalBirthDate] = useState(initialBirthDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localHeight, setLocalHeight] = useState(userProfile.height || 170);
  const [localWeight, setLocalWeight] = useState(userProfile.weight || 70);

  // Вычисляем возраст из birthDate
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(localBirthDate);

  const validateAge = (age: number) => age >= 16 && age <= 90;
  const validateHeight = (value: number) => value >= 140 && value <= 220;
  const validateWeight = (value: number) => value >= 40 && value <= 200;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setLocalBirthDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleHeightChange = (text: string) => {
    const num = Number(text);
    setLocalHeight(isNaN(num) ? 170 : num);
  };

  const handleWeightChange = (text: string) => {
    const num = Number(text);
    setLocalWeight(isNaN(num) ? 70 : num);
  };

  const formatBirthDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleNext = () => {
    setGender(localGender!);
    const birthDateString = localBirthDate.toISOString().split('T')[0];
    setBirthDate(birthDateString);
    setHeight(localHeight);
    setWeight(localWeight);
    router.replace('/onboarding/activity');
  };

  const isFormValid = localGender !== null && localHeight && localWeight &&
    validateAge(currentAge) && validateHeight(localHeight) && validateWeight(localWeight);

  return (
    <View style={[styles.container, { backgroundColor: '#fff' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        {/* Декоративный блок сверху как в auth */}
        <View style={styles.imageWrap}>
          <Image
            source={require('../../assets/images/RegAuth/vegetable.png')}
            style={styles.topImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          {/* Кнопка назад поверх изображения */}
          <View style={styles.topBar}>
            <PressableScale onPress={() => router.back()}>
              <View style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                <Text style={[styles.backArrow, { color: '#000' }]}>←</Text>
              </View>
            </PressableScale>
          </View>
          <View style={styles.imageLabel}>
            <Text style={styles.imageLabelText}>EasyWay</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: '#000' }]}>
              Расскажите о себе
            </Text>
            <Text style={[styles.subtitle, { color: '#666' }]}>
              Эти данные помогут нам рассчитать вашу норму калорий
            </Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.colorField, { borderLeftColor: '#53B175', backgroundColor: hexToRgba('#53B175', 0.1) }]}>
              <Text style={[styles.sectionTitle, { color: '#53B175' }]}>Пол</Text>
              <GenderSelector
                selected={localGender}
                onSelect={setLocalGender}
              />
            </View>

            <View style={[styles.colorField, { borderLeftColor: '#F8A44C', backgroundColor: hexToRgba('#F8A44C', 0.1) }]}>
              <Text style={[styles.sectionTitle, { color: '#F8A44C' }]}>Дата рождения</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View style={styles.datePickerButton}>
                  <Text style={styles.datePickerText}>
                    {formatBirthDate(localBirthDate)} ({currentAge} лет)
                  </Text>
                </View>
              </TouchableOpacity>
              {!validateAge(currentAge) && (
                <Text style={{ color: '#E63946', fontSize: 12, marginTop: 8 }}>
                  Возраст должен быть от 16 до 90 лет
                </Text>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={localBirthDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date(new Date().getFullYear() - 16, new Date().getMonth(), new Date().getDate())}
                minimumDate={new Date(1934, 0, 1)}
              />
            )}

            <View style={[styles.colorField, { borderLeftColor: '#F7A593', backgroundColor: hexToRgba('#F7A593', 0.1) }]}>
              <Text style={[styles.sectionTitle, { color: '#F7A593' }]}>Рост (см)</Text>
              <InputField
                value={localHeight.toString()}
                onChangeText={handleHeightChange}
                keyboardType="numeric"
                placeholder="140-220 см"
              />
            </View>

            <View style={[styles.colorField, { borderLeftColor: '#D3B0E0', backgroundColor: hexToRgba('#D3B0E0', 0.1) }]}>
              <Text style={[styles.sectionTitle, { color: '#D3B0E0' }]}>Вес (кг)</Text>
              <InputField
                value={localWeight.toString()}
                onChangeText={handleWeightChange}
                keyboardType="numeric"
                placeholder="40-200 кг"
              />
            </View>

            <View style={styles.ctaWrap}>
              <Button
                title="Далее"
                onPress={handleNext}
                disabled={!isFormValid}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  imageWrap: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: '#f0f7e8',
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  imageLabel: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  imageLabelText: {
    fontFamily: fontFamily('bold'),
    fontSize: 18,
    color: '#2d3c1c',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  topBar: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  backArrow: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 22,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamily('bold'),
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily('regular'),
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: '#FAFBF7',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 18,
  },
  colorField: {
    marginBottom: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontFamily: fontFamily('semiBold'),
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12,
  },
  datePickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(248, 164, 76, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 164, 76, 0.3)',
  },
  datePickerText: {
    fontFamily: fontFamily('regular'),
    fontSize: 16,
    color: '#333',
  },
  ctaWrap: {
    position: 'relative',
    marginTop: 6,
  },
});
