import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import SearchIcon from '../../assets/icons/search.svg';

type SearchHistoryItem = {
  id: string;
  label: string;
};

type MapSearchScreenProps = {
  initialQuery?: string;
  onClose?: () => void;
  onSearch?: (query: string) => void;
};

const MAP_SEARCH_SUGGESTIONS = [
  '와이앤웍',
  '와이키키',
  '와이앤웍 용인점',
  '와이앤웍 수지점',
  '미식담옥',
  '짬뽕관',
  '수지국수 용인점',
  '식용유정',
  '용인 중식',
  '기흥 파스타',
  '수지 브런치',
] as const;

const MAP_SEARCH_HISTORY_STORAGE_KEY = '@wagu/map-search-history';
const MAX_HISTORY_COUNT = 12;

export function MapSearchScreen({
  initialQuery = '',
  onClose,
  onSearch,
}: MapSearchScreenProps) {
  const inputRef = useRef<TextInput | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(MAP_SEARCH_HISTORY_STORAGE_KEY);
        if (!storedValue || cancelled) {
          return;
        }

        const parsedValue = JSON.parse(storedValue);
        if (!Array.isArray(parsedValue)) {
          return;
        }

        const nextHistory = parsedValue.filter(
          (item): item is SearchHistoryItem =>
            Boolean(item) &&
            typeof item.id === 'string' &&
            typeof item.label === 'string',
        );

        if (!cancelled) {
          setHistory(nextHistory);
        }
      } catch {
        if (!cancelled) {
          setHistory([]);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const trimmedQuery = query.trim();
  const liveSuggestions = trimmedQuery
    ? MAP_SEARCH_SUGGESTIONS.filter((item) =>
        item.toLowerCase().includes(trimmedQuery.toLowerCase()),
      ).slice(0, 8)
    : [];

  const applySearch = (label: string) => {
    setQuery(label);
    setHistory((current) => {
      const target = current.find((item) => item.label === label) ?? {
        id: `map-history-${Date.now()}`,
        label,
      };

      const nextHistory = [target, ...current.filter((item) => item.label !== label)].slice(
        0,
        MAX_HISTORY_COUNT,
      );
      void AsyncStorage.setItem(MAP_SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    });
    Keyboard.dismiss();
    onSearch?.(label);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((current) => {
      const nextHistory = current.filter((item) => item.id !== id);
      void AsyncStorage.setItem(MAP_SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.screen} onPress={Keyboard.dismiss}>
          <View style={styles.topRow}>
            <Pressable style={styles.backButton} onPress={onClose}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>

            <Pressable
              style={[styles.searchBar, isFocused && styles.searchBarFocused]}
              onPress={() => inputRef.current?.focus()}
            >
              <SearchIcon width={24} height={24} color="#000000" />
              <View style={styles.inputWrap}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={query}
                  onChangeText={setQuery}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="지역, 음식점, 음식 종류를 검색해보세요"
                  placeholderTextColor="#D9D9D9"
                  selectionColor="#FF0000"
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    if (trimmedQuery) {
                      applySearch(trimmedQuery);
                    }
                  }}
                />
              </View>
              {query.length > 0 ? (
                <Pressable
                  style={styles.clearQueryButton}
                  onPress={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.clearQueryLabel}>×</Text>
                </Pressable>
              ) : null}
            </Pressable>
          </View>

          <View style={styles.historySection}>
            {trimmedQuery ? (
              <>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>추천 검색어</Text>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.historyList}
                >
                  {liveSuggestions.map((item, index) => (
                    <View key={item}>
                      <Pressable style={styles.suggestionRow} onPress={() => applySearch(item)}>
                        <SearchIcon width={18} height={18} color="#9B9B9B" />
                        <Text style={styles.suggestionLabel}>{item}</Text>
                      </Pressable>
                      {index !== liveSuggestions.length - 1 ? <View style={styles.divider} /> : null}
                    </View>
                  ))}

                  {liveSuggestions.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>일치하는 검색어가 없습니다.</Text>
                    </View>
                  ) : null}
                </ScrollView>
              </>
            ) : (
              <>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>최근 검색</Text>
                  <Pressable
                    onPress={() => {
                      setHistory([]);
                      void AsyncStorage.setItem(MAP_SEARCH_HISTORY_STORAGE_KEY, JSON.stringify([]));
                    }}
                  >
                    <Text style={styles.clearAllLabel}>전체 삭제</Text>
                  </Pressable>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.historyList}
                >
                  {history.map((item, index) => (
                    <View key={item.id}>
                      <View style={styles.historyRow}>
                        <Pressable
                          style={styles.historyLabelButton}
                          onPress={() => applySearch(item.label)}
                        >
                          <Text style={styles.historyLabel}>{item.label}</Text>
                        </Pressable>
                        <Pressable
                          style={styles.deleteButton}
                          onPress={() => handleDeleteHistory(item.id)}
                          hitSlop={8}
                        >
                          <Text style={styles.deleteButtonLabel}>×</Text>
                        </Pressable>
                      </View>
                      {index !== history.length - 1 ? <View style={styles.divider} /> : null}
                    </View>
                  ))}

                  {history.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>최근 검색 기록이 없습니다.</Text>
                    </View>
                  ) : null}
                </ScrollView>
              </>
            )}
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
    paddingHorizontal: 16,
    paddingTop: 25,
    gap: 25,
  },
  topRow: {
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
  searchBar: {
    flex: 1,
    height: 46,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  searchBarFocused: {
    borderColor: '#FF0000',
  },
  clearQueryButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearQueryLabel: {
    fontSize: 21,
    lineHeight: 21,
    fontWeight: '300',
    color: '#9B9B9B',
  },
  inputWrap: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 22,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  historySection: {
    flex: 1,
    gap: 12,
  },
  historyHeader: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  historyTitle: {
    fontSize: 17,
    lineHeight: 25.5,
    fontWeight: '500',
    color: '#000000',
  },
  clearAllLabel: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '500',
    color: '#FF0000',
  },
  historyList: {
    paddingHorizontal: 17,
    paddingTop: 1,
  },
  historyRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyLabelButton: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  historyLabel: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '500',
    color: '#000000',
  },
  suggestionLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '500',
    color: '#000000',
  },
  deleteButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonLabel: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '300',
    color: '#9B9B9B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  emptyState: {
    paddingTop: 28,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#B3B3B3',
  },
});
