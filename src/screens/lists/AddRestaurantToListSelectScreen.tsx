import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import type { MyList } from '../../data/myLists';
import type { Restaurant } from '../../data/restaurants';

type AddRestaurantToListSelectScreenProps = {
  restaurant: Restaurant;
  lists: MyList[];
  onBack: () => void;
  onSelectLists: (listIds: string[]) => void;
};

function normalizeRestaurantValue(value?: string) {
  return value?.replace(/\s+/g, '').trim().toLowerCase() ?? '';
}

export function AddRestaurantToListSelectScreen({
  restaurant,
  lists,
  onBack,
  onSelectLists,
}: AddRestaurantToListSelectScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isRestaurantAlreadyInList = (list: MyList) => {
    const restaurantKeys = [
      normalizeRestaurantValue(restaurant.id),
      normalizeRestaurantValue(restaurant.name),
      normalizeRestaurantValue(restaurant.shortName),
    ].filter(Boolean);

    return list.restaurants.some((item) => {
      const itemKeys = [
        normalizeRestaurantValue(item.id),
        normalizeRestaurantValue(item.name),
      ].filter(Boolean);

      return restaurantKeys.some((restaurantKey) => itemKeys.includes(restaurantKey));
    });
  };

  const availableLists = useMemo(
    () => lists.filter((list) => !isRestaurantAlreadyInList(list)),
    [lists, restaurant.id, restaurant.name, restaurant.shortName],
  );

  const toggleSelection = (listId: string) => {
    setSelectedIds((current) =>
      current.includes(listId)
        ? current.filter((item) => item !== listId)
        : [...current, listId],
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>리스트 선택</Text>
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.title}>{restaurant.shortName || restaurant.name}</Text>
          <Text style={styles.description}>추가하고 싶은 리스트를 모두 선택해 주세요</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: 110 + insets.bottom }]}
        >
          {lists.map((list) => {
            const alreadyAdded = isRestaurantAlreadyInList(list);
            const isSelected = selectedIds.includes(list.id);

            return (
              <Pressable
                key={list.id}
                disabled={alreadyAdded}
                onPress={() => toggleSelection(list.id)}
                style={[
                  styles.listRow,
                  alreadyAdded ? styles.listRowDisabled : null,
                  isSelected ? styles.listRowSelected : null,
                ]}
              >
                <View style={[styles.accentBar, { backgroundColor: list.accentColor }]} />

                <View style={styles.listCopy}>
                  <View style={styles.listTitleRow}>
                    <Text style={styles.listTitle}>{list.title}</Text>
                    {list.isRepresentative ? (
                      <View style={styles.representativeBadge}>
                        <Text style={styles.representativeBadgeLabel}>대표</Text>
                      </View>
                    ) : null}
                    {list.isPrivate ? (
                      <View style={styles.privateBadge}>
                        <Text style={styles.privateBadgeLabel}>비공개</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.listMeta}>장소 {list.restaurantCount}개</Text>
                </View>

                {alreadyAdded ? (
                  <View style={[styles.selectionMark, styles.selectionMarkDisabled]}>
                    <Text style={[styles.selectionMarkLabel, styles.selectionMarkLabelDisabled]}>
                      추가됨
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.checkbox, isSelected ? styles.checkboxSelected : null]}>
                    {isSelected ? <Text style={styles.checkboxTick}>✓</Text> : null}
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable
            disabled={selectedIds.length === 0 || availableLists.length === 0}
            onPress={() => onSelectLists(selectedIds)}
            style={[
              styles.nextButton,
              selectedIds.length === 0 || availableLists.length === 0
                ? styles.nextButtonDisabled
                : null,
            ]}
          >
            <Text style={styles.nextButtonLabel}>다음({selectedIds.length})</Text>
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
    paddingTop: 25,
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
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  copyBlock: {
    paddingTop: 26,
    paddingBottom: 20,
    gap: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    color: '#000000',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#666666',
  },
  listContent: {
    gap: 12,
  },
  listRow: {
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 14,
    gap: 12,
  },
  listRowDisabled: {
    opacity: 0.58,
  },
  listRowSelected: {
    borderColor: '#FFD7D2',
    backgroundColor: '#FFF8F7',
  },
  accentBar: {
    width: 4,
    height: 46,
    borderRadius: 999,
  },
  listCopy: {
    flex: 1,
    gap: 6,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
  },
  listMeta: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#8B8B8B',
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
  privateBadge: {
    minWidth: 42,
    height: 18,
    borderRadius: 10,
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateBadgeLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: '#707070',
  },
  selectionMark: {
    minWidth: 56,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: '#FFF1EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionMarkDisabled: {
    backgroundColor: '#F3F3F3',
  },
  selectionMarkLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  selectionMarkLabelDisabled: {
    color: '#9B9B9B',
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
  nextButton: {
    height: 46,
    borderRadius: 25,
    backgroundColor: '#FF1A12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#FFB6B2',
  },
  nextButtonLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D7D7D7',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#FF3B30',
    backgroundColor: '#FF3B30',
  },
  checkboxTick: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: -1,
  },
});
