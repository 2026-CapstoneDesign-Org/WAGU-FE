import { useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';

type EditNicknameScreenProps = {
  onBack: () => void;
  initialNickname?: string;
  onSubmit?: (nickname: string) => void;
};

const MAX_NICKNAME_LENGTH = 10;

export function EditNicknameScreen({
  onBack,
  initialNickname = '먹부림',
  onSubmit,
}: EditNicknameScreenProps) {
  const inputRef = useRef<TextInput>(null);
  const [nickname, setNickname] = useState(initialNickname);
  const trimmedNickname = nickname.trim();
  const canSubmit = trimmedNickname.length > 0;

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <Pressable style={styles.screen} onPress={Keyboard.dismiss}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>닉네임 수정</Text>
        </View>

        <View style={styles.content}>
          <Pressable style={styles.inputRow} onPress={() => inputRef.current?.focus()}>
            <TextInput
              ref={inputRef}
              value={nickname}
              onChangeText={(text) => setNickname(text.slice(0, MAX_NICKNAME_LENGTH))}
              style={styles.input}
              placeholder="닉네임을 입력해주세요"
              placeholderTextColor="#B3B3B3"
              selectionColor="#FF0000"
              maxLength={MAX_NICKNAME_LENGTH}
              onPressIn={(event) => event.stopPropagation()}
            />
            <Text style={styles.countLabel}>
              <Text style={styles.countCurrent}>{nickname.length}</Text>
              <Text style={styles.countMax}>/{MAX_NICKNAME_LENGTH}</Text>
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          disabled={!canSubmit}
          onPress={() => onSubmit?.(trimmedNickname)}
        >
          <Text style={styles.submitButtonLabel}>수정하기</Text>
        </Pressable>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingTop: 42,
  },
  inputRow: {
    minHeight: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    color: '#000000',
    paddingVertical: 0,
    paddingRight: 12,
  },
  countLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#999999',
  },
  countCurrent: {
    color: '#000000',
  },
  countMax: {
    color: '#999999',
  },
  submitButton: {
    width: '100%',
    height: 46,
    borderRadius: 25,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
