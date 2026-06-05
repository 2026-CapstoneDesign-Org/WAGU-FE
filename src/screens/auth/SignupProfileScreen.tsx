import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';

type SignupProfileScreenProps = {
  nickname?: string;
  onBack: () => void;
  onSubmit: (profile: {
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    gender: 'FEMALE' | 'MALE';
  }) => Promise<void> | void;
};

export function SignupProfileScreen({
  nickname = '먹부림',
  onBack,
  onSubmit,
}: SignupProfileScreenProps) {
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState<'FEMALE' | 'MALE' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const birthYearInputRef = useRef<TextInput | null>(null);
  const birthMonthInputRef = useRef<TextInput | null>(null);
  const birthDayInputRef = useRef<TextInput | null>(null);

  const safeNickname = useMemo(() => {
    const trimmed = nickname.trim();
    return trimmed.length > 0 ? trimmed : '먹부림';
  }, [nickname]);

  const isValidDate = useMemo(() => {
    const year = Number(birthYear);
    const month = Number(birthMonth);
    const day = Number(birthDay);

    if (!year || !month || !day) {
      return false;
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      return false;
    }

    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, [birthDay, birthMonth, birthYear]);

  const isComplete = isValidDate && gender !== null;

  useEffect(() => {
    const timeout = setTimeout(() => {
      birthYearInputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async () => {
    if (!isComplete || !gender) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        birthYear: Number(birthYear),
        birthMonth: Number(birthMonth),
        birthDay: Number(birthDay),
        gender,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '프로필 정보를 저장하지 못했습니다.';
      Alert.alert('입력 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
          <View style={styles.headerRow}>
            <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
            <Text style={styles.headerTitle}>프로필 입력</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.paragraph}>
              {`${safeNickname}님의\n생년월일과 성별을 알려주세요!`}
            </Text>

            <View style={styles.formBlock}>
              <View style={styles.birthRow}>
                <TextInput
                  ref={birthYearInputRef}
                  value={birthYear}
                  onChangeText={(value) => {
                    const nextValue = value.replace(/[^0-9]/g, '').slice(0, 4);
                    setBirthYear(nextValue);

                    if (nextValue.length === 4) {
                      birthMonthInputRef.current?.focus();
                    }
                  }}
                  placeholder="YYYY"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="number-pad"
                  style={[styles.input, styles.yearInput]}
                  textAlign="center"
                  maxLength={4}
                  returnKeyType="next"
                />
                <Text style={styles.separator}>년</Text>
                <TextInput
                  ref={birthMonthInputRef}
                  value={birthMonth}
                  onChangeText={(value) => {
                    const nextValue = value.replace(/[^0-9]/g, '').slice(0, 2);
                    setBirthMonth(nextValue);

                    if (nextValue.length === 2) {
                      birthDayInputRef.current?.focus();
                    }
                  }}
                  placeholder="MM"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="number-pad"
                  style={[styles.input, styles.dateInput]}
                  textAlign="center"
                  maxLength={2}
                  returnKeyType="next"
                />
                <Text style={styles.separator}>월</Text>
                <TextInput
                  ref={birthDayInputRef}
                  value={birthDay}
                  onChangeText={(value) => {
                    const nextValue = value.replace(/[^0-9]/g, '').slice(0, 2);
                    setBirthDay(nextValue);
                  }}
                  placeholder="DD"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="number-pad"
                  style={[styles.input, styles.dateInput]}
                  textAlign="center"
                  maxLength={2}
                  returnKeyType="done"
                />
                <Text style={styles.separator}>일</Text>
              </View>

              <View style={styles.genderRow}>
                <Pressable
                  style={[
                    styles.genderButton,
                    gender === 'MALE' ? styles.genderButtonActive : null,
                  ]}
                  onPress={() => setGender('MALE')}
                >
                  <Text
                    style={[
                      styles.genderLabel,
                      gender === 'MALE' ? styles.genderLabelActive : null,
                    ]}
                  >
                    남성
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.genderButton,
                    gender === 'FEMALE' ? styles.genderButtonActive : null,
                  ]}
                  onPress={() => setGender('FEMALE')}
                >
                  <Text
                    style={[
                      styles.genderLabel,
                      gender === 'FEMALE' ? styles.genderLabelActive : null,
                    ]}
                  >
                    여성
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.bottomBar}>
            <Pressable
              style={[
                styles.completeButton,
                (!isComplete || isSubmitting) && styles.completeButtonDisabled,
              ]}
              disabled={!isComplete || isSubmitting}
              onPress={() => void handleSubmit()}
            >
              <Text style={styles.completeLabel}>
                {isSubmitting ? '저장 중...' : '완료'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 25,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '500',
    color: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    paddingBottom: 52,
  },
  paragraph: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  formBlock: {
    width: '100%',
    gap: 22,
  },
  birthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  input: {
    height: 42,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '500',
    color: '#000000',
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  yearInput: {
    width: 92,
  },
  dateInput: {
    width: 58,
  },
  separator: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    color: '#444444',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    height: 46,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderButtonActive: {
    borderColor: '#FF0000',
    backgroundColor: '#FFF1F0',
  },
  genderLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    color: '#666666',
  },
  genderLabelActive: {
    color: '#FF0000',
  },
  bottomBar: {
    height: 85,
    backgroundColor: '#FFFFFF',
    paddingTop: 13,
  },
  completeButton: {
    height: 46,
    borderRadius: 25,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#FFB6B2',
  },
  completeLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});