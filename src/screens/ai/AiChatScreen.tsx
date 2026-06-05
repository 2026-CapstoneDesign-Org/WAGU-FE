import { useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import SendIcon from '../../../assets/icons/send.svg';

type AiChatScreenProps = {
  onBack: () => void;
  onSubmitMessage?: (message: string) => void;
};

type ChatMessage =
  | {
      id: string;
      type: 'user';
      text: string;
    }
  | {
      id: string;
      type: 'assistant';
      text: string;
    };

const MOCK_RESPONSE = `용인 역북동 데이트 코스는 “카페 + 식사 + 가볍게 산책 or 2차” 조합이 가장 무난하고 만족도가 높아요. 실제로 역북동은 감성 카페와 맛집이 모여 있어서 코스 짜기 쉬운 동네입니다

아래에 시간대별 추천 코스 하나 딱 짜드릴게요

🌿 역북동 데이트 코스 (반나절 ~ 하루 코스)

1. 감성 카페 시작 (분위기 잡기)
• ☕ Calliope
• ☕ A Loaf Slice Piece

👉 포인트
• 처음 만나서 분위기 풀기 좋은 구간
• 브런치/디저트 같이 먹기 좋음

👉 TIP
• 낮 데이트면 무조건 카페부터 시작이 편함
• “브런치 → 커피 → 사진” 루틴 추천

2. 메인 식사 (분위기 + 맛)
• 🍽️ 합 용인역북직영점 (술 + 안주 분위기)
• 🍽️ 대가원 용인점 (고기 데이트)`;

const INPUT_BAR_HEIGHT = 46;
const INPUT_AREA_HEIGHT = 78;
const BOTTOM_THRESHOLD = 120;

export function AiChatScreen({ onBack, onSubmitMessage }: AiChatScreenProps) {
  const inputRef = useRef<TextInput | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);

  const trimmedMessage = message.trim();
  const canSend = trimmedMessage.length > 0;
  const hasMessages = messages.length > 0;

  const contentBottomPadding = useMemo(() => INPUT_AREA_HEIGHT + 12, []);

  const scrollToLatest = (animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
      setShowScrollToLatest(false);
    });
  };

  const handleSend = () => {
    if (!canSend) {
      return;
    }

    const outgoingMessage = trimmedMessage;
    const nextMessages: ChatMessage[] = [
      {
        id: `user-${Date.now()}`,
        type: 'user',
        text: outgoingMessage,
      },
      {
        id: `assistant-${Date.now() + 1}`,
        type: 'assistant',
        text: MOCK_RESPONSE,
      },
    ];

    setMessages(nextMessages);
    setMessage('');
    setShowScrollToLatest(false);
    onSubmitMessage?.(outgoingMessage);
    scrollToLatest();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);

    setShowScrollToLatest(distanceFromBottom > BOTTOM_THRESHOLD);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.screen} onPress={Keyboard.dismiss}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={onBack}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
            <Text style={styles.title}>Ai 검색 / 질문</Text>
          </View>

          {hasMessages ? (
            <ScrollView
              ref={scrollRef}
              style={styles.chatScroll}
              contentContainerStyle={[
                styles.chatContent,
                { paddingBottom: contentBottomPadding },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onContentSizeChange={() => scrollToLatest(false)}
            >
              {messages.map((item) =>
                item.type === 'user' ? (
                  <View key={item.id} style={styles.userMessageRow}>
                    <View style={styles.userBubble}>
                      <Text style={styles.userMessageText}>{item.text}</Text>
                    </View>
                  </View>
                ) : (
                  <Text key={item.id} style={styles.assistantMessageText}>
                    {item.text}
                  </Text>
                )
              )}
            </ScrollView>
          ) : (
            <Pressable style={styles.emptyState} onPress={Keyboard.dismiss}>
              <Text style={styles.emptyStateText}>무엇이든 물어보세요!</Text>
            </Pressable>
          )}

          {hasMessages && showScrollToLatest ? (
            <Pressable style={styles.scrollToLatestButton} onPress={() => scrollToLatest()}>
              <Text style={styles.scrollToLatestLabel}>↓</Text>
            </Pressable>
          ) : null}

          <View style={styles.inputArea} pointerEvents="box-none">
            <Pressable
              style={[styles.inputBar, isFocused && styles.inputBarFocused]}
              onPress={() => inputRef.current?.focus()}
            >
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="뭐든 궁금한걸 물어봐!"
                placeholderTextColor="#D9D9D9"
                selectionColor="#FF0000"
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <Pressable
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!canSend}
                hitSlop={8}
              >
                <SendIcon
                  width={19}
                  height={18}
                  color={canSend ? '#FF0000' : '#838383'}
                />
              </Pressable>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 25,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: INPUT_AREA_HEIGHT,
  },
  emptyStateText: {
    width: 328,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 30,
    gap: 30,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    maxWidth: 234,
    minHeight: 40,
    paddingHorizontal: 24,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMessageText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  assistantMessageText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  scrollToLatestButton: {
    position: 'absolute',
    right: 16,
    bottom: INPUT_AREA_HEIGHT + 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  scrollToLatestLabel: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FF0000',
  },
  inputArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: INPUT_AREA_HEIGHT,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  inputBar: {
    height: INPUT_BAR_HEIGHT,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#838383',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 17,
    paddingRight: 12,
    backgroundColor: '#FFFFFF',
  },
  inputBarFocused: {
    borderColor: '#FF0000',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  sendButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});