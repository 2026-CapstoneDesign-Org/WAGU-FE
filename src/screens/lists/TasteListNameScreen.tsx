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

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';

type TasteListNameScreenProps = {
  nickname?: string;
  mode?: 'first-list' | 'new-list';
  onBack: () => void;
  onSubmit: (name: string) => void;
};

export function TasteListNameScreen({
  nickname = '먹부림',
  mode = 'first-list',
  onBack,
  onSubmit,
}: TasteListNameScreenProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<TextInput | null>(null);

  const safeNickname = useMemo(() => {
    const trimmed = nickname.trim();
    return trimmed.length > 0 ? trimmed : '먹부림';
  }, [nickname]);

  const titleText =
    mode === 'new-list'
      ? '새 리스트 이름을 지어주세요!'
      : `${safeNickname}님의 첫 리스트\n이름을 지어주세요!`;

  const trimmedValue = value.trim();

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timeout);
  }, []);

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
            <Text style={styles.headerTitle}>맛집 리스트 생성</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.paragraph}>{titleText}</Text>

            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={setValue}
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
                !trimmedValue && styles.completeButtonDisabled,
              ]}
              disabled={!trimmedValue}
              onPress={() => onSubmit(trimmedValue)}
            >
              <Text style={styles.completeLabel}>완료</Text>
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