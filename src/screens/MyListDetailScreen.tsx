import { Alert, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useState } from 'react';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { RatingStars } from '../components/RatingStars';
import { MyList, MyListRestaurant } from '../data/myLists';
import { restaurants as allRestaurants } from '../data/restaurants';

type MyListDetailScreenProps = {
  list: MyList;
  lists: MyList[];
  onBack: () => void;
  onChangeLists: (lists: MyList[]) => void;
  onOpenPlaceEdit: () => void;
  onOpenRestaurantDetail: (restaurantName: string) => void;
  onRemoveRestaurants?: (listId: string, restaurantIds: string[]) => Promise<void> | void;
  onRenameList?: (listId: string, title: string) => Promise<void> | void;
  onUpdateRestaurantRatings?: (
    listId: string,
    restaurantId: string,
    ratings: {
      taste: number;
      service: number;
      value: number;
    },
  ) => Promise<void> | void;
};

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 6;
const CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = 224;

function buildNextListsAfterDelete(lists: MyList[], targetId: string) {
  const nextLists = lists.filter((item) => item.id !== targetId);

  if (!nextLists.some((item) => item.isRepresentative) && nextLists.length > 0) {
    return nextLists.map((item, index) => ({
      ...item,
      isRepresentative: index === 0,
      isPrivate: index === 0 ? false : item.isPrivate,
    }));
  }

  return nextLists;
}

export function MyListDetailScreen({
  list,
  lists,
  onBack,
  onChangeLists,
  onOpenPlaceEdit,
  onOpenRestaurantDetail,
  onRemoveRestaurants,
  onRenameList,
  onUpdateRestaurantRatings,
}: MyListDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [isEditMenuVisible, setIsEditMenuVisible] = useState(false);
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [isRatingEditVisible, setIsRatingEditVisible] = useState(false);
  const [renameValue, setRenameValue] = useState(list.title);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [ratingEditRestaurantId, setRatingEditRestaurantId] = useState<string | null>(null);
  const [editingRatings, setEditingRatings] = useState({
    taste: 0,
    service: 0,
    value: 0,
  });

  useEffect(() => {
    setRenameValue(list.title);
  }, [list.title]);

  const orderedRestaurants = useMemo(() => list.restaurants, [list.restaurants]);

  const selectedCard = useMemo(
    () => orderedRestaurants.find((item) => item.id === selectedCardId) ?? null,
    [orderedRestaurants, selectedCardId],
  );
  const ratingEditRestaurant = useMemo(
    () => orderedRestaurants.find((item) => item.id === ratingEditRestaurantId) ?? null,
    [orderedRestaurants, ratingEditRestaurantId],
  );

  const isRatingEditReady = useMemo(
    () => editingRatings.taste > 0 && editingRatings.service > 0 && editingRatings.value > 0,
    [editingRatings],
  );

  const restaurantImageMap = useMemo(() => {
    return new Map(
      allRestaurants.map((restaurant) => [
        restaurant.id,
        restaurant.photoUris?.[0] ?? restaurant.imageUri ?? null,
      ]),
    );
  }, []);

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

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim();

    if (!trimmed) {
      return;
    }

    try {
      if (onRenameList) {
        await onRenameList(list.id, trimmed);
      } else {
        onChangeLists(
          lists.map((item) =>
            item.id === list.id
              ? {
                  ...item,
                  title: trimmed,
                }
              : item,
          ),
        );
      }
      setIsRenameVisible(false);
    } catch {
      Alert.alert('안내', '리스트 이름을 변경하지 못했습니다.');
    }
  };

  const handleOpenCardMenu = (cardId: string) => {
    setSelectedCardId((current) => (current === cardId ? null : cardId));
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) {
      return;
    }

    if (orderedRestaurants.length <= 5) {
      setSelectedCardId(null);
      Alert.alert('안내', '리스트 내 가게는 최소 5개를 유지해야 합니다.');
      return;
    }

    try {
      if (onRemoveRestaurants) {
        await onRemoveRestaurants(list.id, [selectedCard.id]);
      } else {
        updateListRestaurants(orderedRestaurants.filter((item) => item.id !== selectedCard.id));
      }
      setSelectedCardId(null);
    } catch {
      Alert.alert('안내', '가게를 삭제하지 못했습니다.');
    }
  };

  const handleConfirmDeleteCard = () => {
    if (!selectedCard) {
      return;
    }

    Alert.alert('가게 삭제', `정말 ${selectedCard.name} 을 삭제하시겠습니까?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void handleDeleteCard();
        },
      },
    ]);
  };

  const handleOpenRatingEdit = () => {
    if (!selectedCard) {
      return;
    }

    setEditingRatings({
      taste: selectedCard.ratings?.taste ?? 0,
      service: selectedCard.ratings?.service ?? 0,
      value: selectedCard.ratings?.value ?? 0,
    });
    setRatingEditRestaurantId(selectedCard.id);
    setSelectedCardId(null);
    setIsRatingEditVisible(true);
  };

  const handleSubmitRatingEdit = async () => {
    if (!ratingEditRestaurant || !isRatingEditReady) {
      return;
    }

    try {
      if (onUpdateRestaurantRatings) {
        await onUpdateRestaurantRatings(list.id, ratingEditRestaurant.id, editingRatings);
      } else {
        updateListRestaurants(
          orderedRestaurants.map((restaurant) =>
            restaurant.id === ratingEditRestaurant.id
              ? {
                  ...restaurant,
                  ratings: editingRatings,
                }
              : restaurant,
          ),
        );
      }
      setRatingEditRestaurantId(null);
      setIsRatingEditVisible(false);
    } catch {
      Alert.alert('안내', '가게 점수를 수정하지 못했습니다.');
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>

          <View style={styles.headerInfo}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>{list.title}</Text>
              {list.isRepresentative ? (
                <View style={styles.representativeBadge}>
                  <Text style={styles.representativeBadgeLabel}>대표</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.metaText}>
              {list.isPrivate ? '비공개' : '공개'}
              <Text style={styles.metaDot}> · </Text>
              장소 {list.restaurantCount}개
            </Text>
          </View>
        </View>

        <View style={styles.metaSection}>
          <Pressable style={styles.editButton} onPress={() => setIsEditMenuVisible(true)}>
            <Text style={styles.editButtonLabel}>편집</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
        >
          <View style={styles.grid}>
            {orderedRestaurants.map((item, index) => (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => onOpenRestaurantDetail(item.name)}
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
                <Pressable
                  hitSlop={8}
                  style={styles.cardMoreButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    handleOpenCardMenu(item.id);
                  }}
                >
                  <View style={styles.cardMoreDots}>
                    <View style={styles.cardMoreDot} />
                    <View style={styles.cardMoreDot} />
                    <View style={styles.cardMoreDot} />
                  </View>
                </Pressable>

                {selectedCardId === item.id ? (
                  <View style={styles.cardDropdown}>
                    <Pressable
                      onPress={handleOpenRatingEdit}
                      style={({ pressed }) => [
                        styles.cardDropdownItem,
                        pressed ? styles.cardDropdownItemPressed : null,
                      ]}
                    >
                      <Text style={styles.cardDropdownLabel}>수정하기</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleConfirmDeleteCard}
                      style={({ pressed }) => [
                        styles.cardDropdownItem,
                        pressed ? styles.cardDropdownItemPressed : null,
                      ]}
                    >
                      <Text style={styles.cardDropdownLabel}>삭제하기</Text>
                    </Pressable>
                  </View>
                ) : null}

                <View style={styles.cardTextBlock}>
                  <Text style={styles.cardTitle}>{`${index + 1}. ${item.name}`}</Text>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cardAddress}>
                    {item.address}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Modal
          transparent
          animationType="fade"
          visible={isEditMenuVisible}
          onRequestClose={() => setIsEditMenuVisible(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setIsEditMenuVisible(false)}>
            <Pressable style={styles.actionSheet} onPress={() => {}}>
              <View style={styles.actionGroup}>
                <Pressable
                  onPress={() => {
                    setIsEditMenuVisible(false);
                    onOpenPlaceEdit();
                  }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    styles.menuItemNoBorder,
                    pressed ? styles.menuItemPressed : null,
                  ]}
                >
                  <Text style={styles.menuItemLabel}>장소 편집하기</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setIsEditMenuVisible(false);
                    setIsRenameVisible(true);
                  }}
                  style={({ pressed }) => [styles.menuItem, pressed ? styles.menuItemPressed : null]}
                >
                  <Text style={styles.menuItemLabel}>이름 변경</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => setIsEditMenuVisible(false)}
                style={({ pressed }) => [styles.cancelButton, pressed ? styles.menuItemPressed : null]}
              >
                <Text style={styles.cancelButtonLabel}>취소</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={isRenameVisible}
          onRequestClose={() => setIsRenameVisible(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setIsRenameVisible(false)}>
            <Pressable style={styles.renameModal} onPress={() => {}}>
              <Text style={styles.renameTitle}>리스트 이름 변경</Text>

              <TextInput
                autoFocus
                value={renameValue}
                onChangeText={setRenameValue}
                placeholder="리스트 이름을 입력해 주세요"
                placeholderTextColor="#A6A6A6"
                style={styles.renameInput}
                maxLength={20}
              />

              <View style={styles.renameActions}>
                <Pressable
                  onPress={() => setIsRenameVisible(false)}
                  style={({ pressed }) => [
                    styles.renameButton,
                    styles.renameCancelButton,
                    pressed ? styles.menuItemPressed : null,
                  ]}
                >
                  <Text style={styles.renameCancelLabel}>취소</Text>
                </Pressable>

                <Pressable
                  disabled={renameValue.trim().length === 0}
                  onPress={() => void handleRenameSubmit()}
                  style={({ pressed }) => [
                    styles.renameButton,
                    styles.renameConfirmButton,
                    renameValue.trim().length === 0 ? styles.renameConfirmButtonDisabled : null,
                    pressed && renameValue.trim().length > 0 ? styles.renameConfirmButtonPressed : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.renameConfirmLabel,
                      renameValue.trim().length === 0 ? styles.renameConfirmLabelDisabled : null,
                    ]}
                  >
                    완료
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={isRatingEditVisible}
          onRequestClose={() => {
            setIsRatingEditVisible(false);
            setRatingEditRestaurantId(null);
          }}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => {
              setIsRatingEditVisible(false);
              setRatingEditRestaurantId(null);
            }}
          >
            <Pressable style={styles.ratingModal} onPress={() => {}}>
              <Text style={styles.ratingModalTitle}>가게 점수 수정</Text>
              <Text style={styles.ratingModalSubtitle}>{ratingEditRestaurant?.name ?? ''}</Text>

              <View style={styles.ratingModalGroup}>
                <View style={styles.ratingModalSection}>
                  <Text style={styles.ratingModalLabel}>맛</Text>
                  <RatingStars
                    value={editingRatings.taste}
                    onChange={(value) =>
                      setEditingRatings((current) => ({ ...current, taste: value }))
                    }
                  />
                </View>

                <View style={styles.ratingModalSection}>
                  <Text style={styles.ratingModalLabel}>서비스</Text>
                  <RatingStars
                    value={editingRatings.service}
                    onChange={(value) =>
                      setEditingRatings((current) => ({ ...current, service: value }))
                    }
                  />
                </View>

                <View style={styles.ratingModalSection}>
                  <Text style={styles.ratingModalLabel}>가성비</Text>
                  <RatingStars
                    value={editingRatings.value}
                    onChange={(value) =>
                      setEditingRatings((current) => ({ ...current, value: value }))
                    }
                  />
                </View>
              </View>

              <View style={styles.ratingModalActions}>
                <Pressable
                  onPress={() => {
                    setIsRatingEditVisible(false);
                    setRatingEditRestaurantId(null);
                  }}
                  style={({ pressed }) => [
                    styles.renameButton,
                    styles.renameCancelButton,
                    pressed ? styles.menuItemPressed : null,
                  ]}
                >
                  <Text style={styles.renameCancelLabel}>취소</Text>
                </Pressable>

                <Pressable
                  disabled={!isRatingEditReady}
                  onPress={() => void handleSubmitRatingEdit()}
                  style={({ pressed }) => [
                    styles.renameButton,
                    styles.renameConfirmButton,
                    !isRatingEditReady ? styles.renameConfirmButtonDisabled : null,
                    pressed && isRatingEditReady ? styles.renameConfirmButtonPressed : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.renameConfirmLabel,
                      !isRatingEditReady ? styles.renameConfirmLabelDisabled : null,
                    ]}
                  >
                    저장
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

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
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  representativeBadge: {
    minWidth: 31,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FCE3E1',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  representativeBadgeLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  metaSection: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 12,
  },
  metaText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#666666',
  },
  metaDot: {
    color: '#A0A0A0',
  },
  editButton: {
    alignSelf: 'flex-end',
    minWidth: 66,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    paddingTop: 12,
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
    backgroundColor: '#D9D9D9',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D9D9D9',
  },
  cardMoreButton: {
    position: 'absolute',
    top: 11,
    right: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  cardMoreDots: {
    width: 4,
    height: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMoreDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  cardTextBlock: {
    gap: 2,
  },
  cardDropdown: {
    position: 'absolute',
    top: 34,
    right: 8,
    minWidth: 82,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 5,
    overflow: 'hidden',
    zIndex: 4,
  },
  cardDropdownItem: {
    minHeight: 36,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  cardDropdownItemPressed: {
    backgroundColor: '#F5F5F5',
  },
  cardDropdownLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#000000',
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 18,
  },
  actionSheet: {
    gap: 12,
  },
  actionGroup: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  menuItemNoBorder: {
    borderBottomWidth: 0,
  },
  menuItemPressed: {
    backgroundColor: '#F5F5F5',
  },
  menuItemDestructive: {
    color: '#FF3B30',
  },
  menuItemLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  cancelButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000000',
  },
  renameModal: {
    marginHorizontal: 16,
    marginTop: 'auto',
    marginBottom: 'auto',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 18,
  },
  renameTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  renameInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 20,
    color: '#000000',
  },
  renameActions: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingModal: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 18,
  },
  ratingModalTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  ratingModalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  ratingModalGroup: {
    gap: 16,
  },
  ratingModalSection: {
    gap: 10,
    alignItems: 'center',
  },
  ratingModalLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#000000',
  },
  ratingModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  renameButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameCancelButton: {
    backgroundColor: '#F3F3F3',
  },
  renameCancelLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    color: '#444444',
  },
  renameConfirmButton: {
    backgroundColor: '#FF0000',
  },
  renameConfirmButtonDisabled: {
    backgroundColor: '#F1B0B0',
  },
  renameConfirmButtonPressed: {
    opacity: 0.88,
  },
  renameConfirmLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  renameConfirmLabelDisabled: {
    color: '#FFF6F6',
  },
});
