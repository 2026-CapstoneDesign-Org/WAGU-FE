import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { MyList } from '../data/myLists';

type MyListsScreenProps = {
  lists: MyList[];
  onBack: () => void;
  onChangeLists: (lists: MyList[]) => void;
  onOpenList: (listId: string) => void;
  onCreateList: () => void;
  onRenameList?: (listId: string, title: string) => Promise<void> | void;
};

const MENU_ITEMS = ['set-representative', 'toggle-privacy', 'rename', 'delete'] as const;

type MenuAction = (typeof MENU_ITEMS)[number];

function buildNextListsAfterDelete(lists: MyList[], targetId: string) {
  const nextLists = lists.filter((list) => list.id !== targetId);

  if (!nextLists.some((list) => list.isRepresentative) && nextLists.length > 0) {
    return nextLists.map((list, index) => ({
      ...list,
      isRepresentative: index === 0,
      isPrivate: index === 0 ? false : list.isPrivate,
    }));
  }

  return nextLists;
}

export function MyListsScreen({
  lists,
  onBack,
  onChangeLists,
  onOpenList,
  onCreateList,
  onRenameList,
}: MyListsScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const orderedLists = useMemo(() => {
    const representative = lists.find((list) => list.isRepresentative);
    const others = lists.filter((list) => !list.isRepresentative);

    return representative ? [representative, ...others] : lists;
  }, [lists]);

  const selectedList = useMemo(
    () => lists.find((list) => list.id === selectedListId) ?? null,
    [lists, selectedListId],
  );

  const renameTarget = useMemo(
    () => lists.find((list) => list.id === renameTargetId) ?? null,
    [lists, renameTargetId],
  );

  useEffect(() => {
    if (!renameTarget) {
      setRenameValue('');
      return;
    }

    setRenameValue(renameTarget.title);
  }, [renameTarget]);

  const closeMenu = () => setSelectedListId(null);

  const closeRenameModal = () => {
    setRenameTargetId(null);
    setRenameValue('');
  };

  const applyAction = (action: MenuAction) => {
    if (!selectedList) {
      return;
    }

    if (action === 'set-representative') {
      if (selectedList.isPrivate || selectedList.isRepresentative) {
        return;
      }

      onChangeLists(
        lists.map((list) => ({
          ...list,
          isRepresentative: list.id === selectedList.id,
          isPrivate: list.id === selectedList.id ? false : list.isPrivate,
        })),
      );
      closeMenu();
      return;
    }

    if (action === 'toggle-privacy') {
      if (selectedList.isRepresentative) {
        return;
      }

      onChangeLists(
        lists.map((list) =>
          list.id === selectedList.id
            ? {
                ...list,
                isPrivate: !list.isPrivate,
              }
            : list,
        ),
      );
      closeMenu();
      return;
    }

    if (action === 'rename') {
      setRenameTargetId(selectedList.id);
      closeMenu();
      return;
    }

    if (selectedList.isRepresentative) {
      Alert.alert('알림', '대표리스트는 삭제할 수 없습니다.');
      closeMenu();
      return;
    }

    if (lists.length <= 1) {
      return;
    }

    onChangeLists(buildNextListsAfterDelete(lists, selectedList.id));
    closeMenu();
  };

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim();

    if (!renameTarget || trimmed.length === 0) {
      return;
    }

    try {
      if (onRenameList) {
        await onRenameList(renameTarget.id, trimmed);
      } else {
        onChangeLists(
          lists.map((list) =>
            list.id === renameTarget.id
              ? {
                  ...list,
                  title: trimmed,
                }
              : list,
          ),
        );
      }
      closeRenameModal();
    } catch {
      Alert.alert('알림', '리스트 이름을 변경하지 못했습니다.');
    }
  };

  const renderMenuItem = (action: MenuAction) => {
    if (!selectedList) {
      return null;
    }

    let label = '';
    let destructive = false;

    if (action === 'set-representative') {
      if (selectedList.isPrivate || selectedList.isRepresentative) {
        return null;
      }
      label = '대표 리스트 설정';
    } else if (action === 'toggle-privacy') {
      if (selectedList.isRepresentative) {
        return null;
      }
      label = selectedList.isPrivate ? '공개로 설정' : '비공개로 설정';
    } else if (action === 'rename') {
      label = '이름 변경';
    } else {
      if (lists.length <= 1) {
        return null;
      }
      label = '삭제하기';
      destructive = true;
    }

    return (
      <Pressable
        key={action}
        onPress={() => applyAction(action)}
        style={({ pressed }) => [
          styles.menuItem,
          pressed ? styles.menuItemPressed : null,
          action === 'delete' ? styles.menuItemNoBorder : null,
        ]}
      >
        <Text
          style={[
            styles.menuItemLabel,
            destructive ? styles.menuItemLabelDestructive : null,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>내 리스트</Text>
        </View>

        <View style={styles.body}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {orderedLists.map((list, index) => (
              <View key={list.id} style={styles.listItem}>
                <View style={[styles.accentBar, { backgroundColor: list.accentColor }]} />

                <View style={styles.rowMain}>
                  <Pressable style={styles.rowMainPressable} onPress={() => onOpenList(list.id)}>
                    <View style={styles.textBlock}>
                      <View style={styles.titleRow}>
                        <Text style={styles.title}>{list.title}</Text>
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

                      <View style={styles.countRow}>
                        <Text style={[styles.countValue, { color: list.accentColor }]}>
                          {list.restaurantCount}
                        </Text>
                        <Text style={styles.countLabel}>장소</Text>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable
                    hitSlop={8}
                    onPress={() => setSelectedListId(list.id)}
                    style={({ pressed }) => [
                      styles.moreButton,
                      pressed ? styles.moreButtonPressed : null,
                    ]}
                  >
                    <View style={styles.moreDots}>
                      <View style={styles.moreDot} />
                      <View style={styles.moreDot} />
                      <View style={styles.moreDot} />
                    </View>
                  </Pressable>
                </View>

                {index < orderedLists.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </ScrollView>

          <Pressable
            style={[styles.createButton, { marginBottom: 13 + insets.bottom }]}
            onPress={onCreateList}
          >
            <View style={styles.createButtonInner}>
              <Text style={styles.createPlus}>+</Text>
              <Text style={styles.createButtonLabel}>새 리스트 만들기</Text>
            </View>
          </Pressable>
        </View>

        <Modal
          animationType="fade"
          transparent
          visible={selectedList !== null}
          onRequestClose={closeMenu}
        >
          <Pressable style={styles.overlay} onPress={closeMenu}>
            <Pressable style={styles.actionSheet} onPress={() => {}}>
              <View style={styles.actionGroup}>{MENU_ITEMS.map(renderMenuItem)}</View>

              <Pressable
                onPress={closeMenu}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed ? styles.menuItemPressed : null,
                ]}
              >
                <Text style={styles.cancelButtonLabel}>취소</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          animationType="fade"
          transparent
          visible={renameTarget !== null}
          onRequestClose={closeRenameModal}
        >
          <Pressable style={styles.overlay} onPress={closeRenameModal}>
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
                  onPress={closeRenameModal}
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
    paddingHorizontal: 16,
    paddingTop: 25,
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
  body: {
    flex: 1,
    paddingTop: 25,
  },
  listContent: {
    paddingBottom: 18,
  },
  listItem: {
    minHeight: 96.4,
    justifyContent: 'center',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    width: 4,
    height: 72.4,
    borderRadius: 999,
  },
  rowMain: {
    minHeight: 48.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
  },
  rowMainPressable: {
    flex: 1,
  },
  textBlock: {
    width: 260,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    lineHeight: 23.4,
    fontWeight: '600',
    color: '#000000',
  },
  representativeBadge: {
    minWidth: 31.02,
    height: 20.5,
    borderRadius: 10,
    backgroundColor: '#FCE3E1',
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  representativeBadgeLabel: {
    fontSize: 11,
    lineHeight: 16.5,
    fontWeight: '700',
    color: '#FF3B30',
  },
  privateBadge: {
    minWidth: 42,
    height: 18.5,
    borderRadius: 10,
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privateBadgeLabel: {
    fontSize: 11,
    lineHeight: 16.5,
    fontWeight: '700',
    color: '#707070',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  countValue: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  countLabel: {
    marginLeft: 2,
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '400',
    color: '#999999',
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonPressed: {
    backgroundColor: '#F2F2F2',
  },
  moreDots: {
    width: 6,
    height: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#3A3A3A',
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  createButton: {
    width: '100%',
    height: 46,
    borderRadius: 20,
    backgroundColor: '#F92A1D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createPlus: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: -1,
  },
  createButtonLabel: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '600',
    color: '#FFFFFF',
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
  menuItemLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  menuItemLabelDestructive: {
    color: '#FF3B30',
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
