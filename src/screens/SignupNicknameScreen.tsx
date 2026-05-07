import { useEffect, useMemo, useRef, useState } from 'react';
import {
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

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';

type SignupNicknameScreenProps = {
  initialNickname?: string;
  onBack: () => void;
  onSubmit: (nickname: string) => Promise<void> | void;
};

export function SignupNicknameScreen({
  initialNickname = '',
  onBack,
  onSubmit,
}: SignupNicknameScreenProps) {
  const [value, setValue] = useState(initialNickname);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  const trimmedValue = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async () => {
    if (!trimmedValue || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(trimmedValue);
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
            <Text style={styles.headerTitle}>닉네임 설정</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.paragraph}>닉네임을 지어주세요!</Text>

            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={(text) => setValue(text.slice(0, 20))}
              placeholder="이름 입력"
              placeholderTextColor="#C7C7CC"
              style={styles.input}
              textAlign="center"
              maxLength={20}
            />
          </View>

          <View style={styles.bottomBar}>
            <Pressable
              style={[
                styles.completeButton,
                (!trimmedValue || isSubmitting) && styles.completeButtonDisabled,
              ]}
              disabled={!trimmedValue || isSubmitting}
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
  input: {
    width: '100%',
    height: 30,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '500',
    color: '#000000',
    paddingVertical: 0,
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
