import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import SearchIcon from '../../assets/icons/search.svg';
import { Restaurant, restaurants } from '../data/restaurants';

const { width: screenWidth } = Dimensions.get('window');
const CARD_GAP = 6;
const CARD_WIDTH = (screenWidth - 32 - CARD_GAP) / 2;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.24);

type TasteSelectionScreenProps = {
  onBack: () => void;
  onConfirm: (restaurants: Restaurant[]) => void;
};

export function TasteSelectionScreen({
  onBack,
  onConfirm,
}: TasteSelectionScreenProps) {
  const [query, setQuery] = useState('');
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [hasScrolledAwayFromTop, setHasScrolledAwayFromTop] = useState(false);
  const searchAnimation = useRef(new Animated.Value(1)).current;
  const lastOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const searchVisibleRef = useRef(true);

  const filteredRestaurants = useMemo(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return restaurants;
    }

    return restaurants.filter((restaurant) => restaurant.name.includes(normalizedQuery));
  }, [query]);

  const toggleRestaurant = (name: string) => {
    setSelectedRestaurants((current) =>
      current.includes(name)
        ? current.filter((restaurant) => restaurant !== name)
        : [...current, name]
    );
  };

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
      outputRange: [0, 25],
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

  const confirmSelection = () => {
    if (selectedRestaurants.length < 5) {
      return;
    }

    const chosenRestaurants = restaurants.filter((restaurant) =>
      selectedRestaurants.includes(restaurant.name)
    );

    onConfirm(chosenRestaurants);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>나만의 맛집을 골라주세요.</Text>
        </View>

        <Animated.View style={[styles.searchWrapper, searchContainerStyle]}>
          <View style={styles.searchBar}>
            <SearchIcon width={24} height={24} color="#FF1A12" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="찾으시는 맛집을 검색해 보세요"
              placeholderTextColor="#D9D9D9"
              style={styles.searchInput}
            />
          </View>
        </Animated.View>

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
          <View style={styles.grid}>
            {filteredRestaurants.map((restaurant) => {
              const selected = selectedRestaurants.includes(restaurant.name);

              return (
                <Pressable
                  key={restaurant.id}
                  onPress={() => toggleRestaurant(restaurant.name)}
                  style={[styles.card, selected && styles.cardSelected]}
                >
                  <View style={styles.cardOverlay}>
                    <Text style={styles.cardLabel}>{restaurant.name}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            onPress={confirmSelection}
            disabled={selectedRestaurants.length < 5}
            style={[
              styles.confirmButton,
              selectedRestaurants.length < 5 && styles.confirmButtonDisabled,
            ]}
          >
            <Text style={styles.confirmLabel}>{`결정(${selectedRestaurants.length})`}</Text>
          </Pressable>
        </View>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
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
    paddingTop: 18,
    paddingBottom: 110,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 5,
    backgroundColor: '#D9D9D9',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#FF1A12',
  },
  cardOverlay: {
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  cardLabel: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 85,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 13,
  },
  confirmButton: {
    height: 46,
    borderRadius: 25,
    backgroundColor: '#FF1A12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#FFB6B2',
  },
  confirmLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
