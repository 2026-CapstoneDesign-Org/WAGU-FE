import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import SearchIcon from '../../assets/icons/search.svg';
import { MOCK_DATA_ENABLED } from '../config/mockData';
import { localRankingEntries, nationalRankingEntries } from '../data/rankings';

type RankingDetailVariant = 'local' | 'national';

type RankingDetailScreenProps = {
  items?: typeof localRankingEntries;
  onBack: () => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  variant: RankingDetailVariant;
};

export function RankingDetailScreen({
  items,
  onBack,
  onOpenRestaurantDetail,
  variant,
}: RankingDetailScreenProps) {
  const [query, setQuery] = useState('');
  const [hasScrolledAwayFromTop, setHasScrolledAwayFromTop] = useState(false);
  const searchAnimation = useRef(new Animated.Value(1)).current;
  const lastOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const searchVisibleRef = useRef(true);

  const rankingItems =
    items ??
    (MOCK_DATA_ENABLED
      ? variant === 'local'
        ? localRankingEntries.slice(0, 40)
        : nationalRankingEntries.slice(0, 40)
      : []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return rankingItems;
    }

    return rankingItems.filter((item) => item.name.includes(normalizedQuery));
  }, [rankingItems, query]);

  const setSearchVisible = (visible: boolean) => {
    if (searchVisibleRef.current === visible) {
      return;
    }

    searchVisibleRef.current = visible;
    Animated.timing(searchAnimation, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleScroll = (offsetY: number) => {
    if (!isDraggingRef.current) {
      lastOffsetRef.current = offsetY;
      return;
    }

    const delta = offsetY - lastOffsetRef.current;
    lastOffsetRef.current = offsetY;
    setHasScrolledAwayFromTop(offsetY > 8);

    if (offsetY <= 8) {
      setSearchVisible(true);
      return;
    }

    if (delta > 6) {
      setSearchVisible(false);
      return;
    }

    if (delta < -2) {
      setSearchVisible(true);
    }
  };

  const searchContainerStyle = {
    height: searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 46],
    }),
    opacity: searchAnimation,
    marginTop: searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 18],
    }),
    marginBottom: searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [12, hasScrolledAwayFromTop ? 10 : 0],
    }),
    transform: [
      {
        translateY: searchAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-18, 0],
        }),
      },
    ],
  } as const;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <View style={styles.headerRow}>
            <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
            <Text style={styles.headerTitle}>
              {variant === 'local' ? (
                <>
                  <Text style={styles.headerAccent}>용인</Text>
                  <Text> 맛집 순위</Text>
                </>
              ) : (
                '전국 맛집 순위'
              )}
            </Text>
          </View>

          <Animated.View style={[styles.searchWrapper, searchContainerStyle]}>
            <View style={styles.searchBar}>
              <SearchIcon width={24} height={24} color="#FF1A12" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="원하는 맛집을 검색해보세요."
                placeholderTextColor="#D9D9D9"
                style={styles.searchInput}
              />
            </View>
          </Animated.View>
        </View>

        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          onMomentumScrollEnd={() => {
            isDraggingRef.current = false;
          }}
          onScrollBeginDrag={() => {
            isDraggingRef.current = true;
          }}
          onScrollEndDrag={() => {
            isDraggingRef.current = false;
          }}
          onScroll={({ nativeEvent }) => handleScroll(nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.list}>
            {filteredItems.map((item, index) => (
              <Pressable
                key={item.id}
                style={styles.listItem}
                onPress={() => onOpenRestaurantDetail?.(item.name)}
              >
                <Text style={styles.rankNumber}>{index + 1}.</Text>

                <View style={styles.thumbnail}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.thumbnailImage} />
                  ) : (
                    <View style={styles.thumbnailFallback} />
                  )}
                </View>

                <View style={styles.itemCopy}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.meta}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.ScrollView>
      </View>
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
    paddingTop: 14,
  },
  headerBlock: {
    gap: 5,
  },
  headerRow: {
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
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000000',
  },
  headerAccent: {
    color: '#FF1A12',
  },
  searchWrapper: {
    overflow: 'hidden',
  },
  searchBar: {
    height: 46,
    borderWidth: 1,
    borderColor: '#FF1A12',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#1A1A1A',
    paddingVertical: 0,
  },
  scrollContent: {
    paddingTop: 23,
    paddingBottom: 40,
  },
  list: {
    gap: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  rankNumber: {
    width: 18,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#C4C4C4',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    flex: 1,
    backgroundColor: '#C4C4C4',
  },
  itemCopy: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#000000',
  },
  itemMeta: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#838383',
  },
});
