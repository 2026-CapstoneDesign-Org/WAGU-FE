import { Alert, Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import { restaurants as allRestaurants } from '../../fixtures/restaurants';
import type { MyList, MyListRestaurant } from '../../data/myLists';

type MyListPlaceEditScreenProps = {
  list: MyList;
  lists: MyList[];
  onBack: () => void;
  onChangeLists: (lists: MyList[]) => void;
  onDeleteRestaurants?: (listId: string, restaurantIds: string[]) => Promise<void> | void;
};

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 6;
const CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = 224;

export function MyListPlaceEditScreen({
  list,
  lists,
  onBack,
  onChangeLists,
  onDeleteRestaurants,
}: MyListPlaceEditScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const orderedRestaurants = useMemo(() => list.restaurants, [list.restaurants]);
  const restaurantImageMap = useMemo(
    () =>
      new Map(
        allRestaurants.map((restaurant) => [
          restaurant.id,
          restaurant.photoUris?.[0] ?? restaurant.imageUri ?? null,
        ]),
      ),
    [],
  );

  const toggleSelection = (restaurantId: string) => {
    setSelectedIds((current) =>
      current.includes(restaurantId)
        ? current.filter((id) => id !== restaurantId)
        : [...current, restaurantId],
    );
  };

  const updateListRestaurants = (nextRestaurants: MyListRestaurant[]) => {
    onChangeLists(
      lists.map((item) =>
        item.id === list.id
          ? {
              ...item,
              restaurants: nextRestaurants,
              restaurantCount: nextRestaurants.length,
            }
          : item,
      ),
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    if (orderedRestaurants.length - selectedIds.length < 5) {
      Alert.alert('안내', '리스트 내 가게는 최소 5개를 유지해야 합니다.');
      return;
    }

    try {
      if (onDeleteRestaurants) {
        await onDeleteRestaurants(list.id, selectedIds);
      } else {
        updateListRestaurants(
          orderedRestaurants.filter((restaurant) => !selectedIds.includes(restaurant.id)),
        );
      }
      onBack();
    } catch {
      Alert.alert('안내', '선택한 가게를 삭제하지 못했습니다.');
    }
  };

  const handleConfirmDeleteSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }

    const selectedRestaurants = orderedRestaurants.filter((restaurant) =>
      selectedIds.includes(restaurant.id),
    );

    const deleteTargetLabel =
      selectedRestaurants.length === 1
        ? selectedRestaurants[0]?.name ?? '선택한 가게'
        : `${selectedRestaurants[0]?.name ?? '선택한 가게'} 외 ${selectedRestaurants.length - 1}곳`;

    Alert.alert('가게 삭제', `정말 ${deleteTargetLabel} 을 삭제하시겠습니까?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void handleDeleteSelected();
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>장소 편집하기</Text>
            <Text style={styles.headerSubtitle}>삭제할 가게를 선택해 주세요</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 24 + 64 + 16 + insets.bottom },
          ]}
        >
          <View style={styles.grid}>
            {orderedRestaurants.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <Pressable
                  key={item.id}
                  style={[styles.card, isSelected ? styles.cardSelected : null]}
                  onPress={() => toggleSelection(item.id)}
                >
                  {item.imageUri || restaurantImageMap.get(item.id) ? (
                    <Image
                      source={{ uri: item.imageUri || restaurantImageMap.get(item.id) || undefined }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.cardImage} />
                  )}

                  <View style={[styles.checkbox, isSelected ? styles.checkboxSelected : null]}>
                    {isSelected ? <Text style={styles.checkboxCheck}>✓</Text> : null}
                  </View>

                  <View style={styles.cardTextBlock}>
                    <Text style={styles.cardTitle}>{`${index + 1}. ${item.name}`}</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cardAddress}>
                      {item.address}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(8, insets.bottom + 4) }]}>
          <Pressable
            onPress={handleConfirmDeleteSelected}
            disabled={selectedIds.length === 0}
            style={[
              styles.deleteButton,
              selectedIds.length === 0 ? styles.deleteButtonDisabled : null,
            ]}
          >
            <Text style={styles.deleteButtonLabel}>{`삭제하기 (${selectedIds.length})`}</Text>
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
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#666666',
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#D9D9D9',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  cardSelected: {
    borderColor: '#FF0000',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D9D9D9',
  },
  checkbox: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  checkboxCheck: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardTextBlock: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardAddress: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  deleteButton: {
    height: 46,
    borderRadius: 25,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#FFB6B2',
  },
  deleteButtonLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
