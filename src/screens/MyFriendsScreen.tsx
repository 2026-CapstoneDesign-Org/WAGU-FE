import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { ReliabilityBadge } from '../components/ReliabilityBadge';
import { MOCK_DATA_ENABLED } from '../config/mockData';
import {
  FollowTogglePayload,
  FriendTabKey,
  FriendUser,
  MY_FOLLOWER_USERS,
  MY_FOLLOWING_USERS,
} from '../data/myFriends';

type MyFriendsScreenProps = {
  followerUsersData?: FriendUser[];
  initialTab?: FriendTabKey;
  followingUsersData?: FriendUser[];
  onBack: () => void;
  onChangeTab?: (tab: FriendTabKey) => void;
  onOpenUserProfile?: (userId: string) => void;
  onToggleFollow?: (payload: FollowTogglePayload) => Promise<boolean> | boolean;
  preserveListOnToggle?: boolean;
  title?: string;
};

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;

function sortFollowersForInitialView(users: FriendUser[]) {
  return [...users].sort((left, right) => {
    if (left.isFollowing === right.isFollowing) {
      return 0;
    }

    return left.isFollowing ? 1 : -1;
  });
}

function FriendRow({
  isPending = false,
  onToggleFollow,
  onOpenUserProfile,
  sourceTab,
  user,
}: {
  isPending?: boolean;
  onToggleFollow: (payload: FollowTogglePayload) => void;
  onOpenUserProfile?: (userId: string) => void;
  sourceTab: FriendTabKey;
  user: FriendUser;
}) {
  return (
    <Pressable style={styles.friendRow} onPress={() => onOpenUserProfile?.(user.id)}>
      <View style={styles.thumbnail} />
      <View style={styles.friendCopy}>
        <View style={styles.friendNameRow}>
          <Text style={styles.friendName}>{user.name}</Text>
          <ReliabilityBadge grade={user.reliabilityGrade} height={20} />
        </View>
        <Text style={styles.friendMeta}>{`\uB9AC\uBDF0 \u00B7 ${user.reviewCount.toLocaleString('ko-KR')}`}</Text>
      </View>
      {user.showFollowAction ? (
        <Pressable
          style={[
            styles.followButton,
            user.isFollowing && styles.followingButton,
            isPending && styles.pendingFollowButton,
          ]}
          disabled={isPending}
          onPress={(event) => {
            event.stopPropagation();
            onToggleFollow({
              sourceTab,
              userId: user.id,
              nextIsFollowing: !user.isFollowing,
            });
          }}
        >
          <Text
            style={[
              styles.followButtonLabel,
              user.isFollowing && styles.followingButtonLabel,
            ]}
          >
            {user.isFollowing ? '\uD314\uB85C\uC789' : '\uD314\uB85C\uC6B0'}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

function FriendList({
  pendingUserIds,
  onToggleFollow,
  onOpenUserProfile,
  sourceTab,
  users,
}: {
  pendingUserIds?: string[];
  onToggleFollow: (payload: FollowTogglePayload) => void;
  onOpenUserProfile?: (userId: string) => void;
  sourceTab: FriendTabKey;
  users: FriendUser[];
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    >
      {users.map((user) => (
        <FriendRow
          isPending={pendingUserIds?.includes(user.id)}
          key={user.id}
          onToggleFollow={onToggleFollow}
          onOpenUserProfile={onOpenUserProfile}
          sourceTab={sourceTab}
          user={user}
        />
      ))}
    </ScrollView>
  );
}

export function MyFriendsScreen({
  followerUsersData,
  initialTab = 'following',
  followingUsersData,
  onBack,
  onChangeTab,
  onOpenUserProfile,
  onToggleFollow,
  preserveListOnToggle = false,
  title = '\uBC25\uCE5C\uAD6C',
}: MyFriendsScreenProps) {
  const pagerRef = useRef<ScrollView | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<FriendTabKey>(initialTab);
  const [followingUsers, setFollowingUsers] = useState(
    followingUsersData ?? (MOCK_DATA_ENABLED ? MY_FOLLOWING_USERS : []),
  );
  const [followerUsers, setFollowerUsers] = useState(() =>
    sortFollowersForInitialView(
      followerUsersData ?? (MOCK_DATA_ENABLED ? MY_FOLLOWER_USERS : []),
    ),
  );
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});
  const [pendingUserIds, setPendingUserIds] = useState<string[]>([]);

  useEffect(() => {
    setFollowingUsers(followingUsersData ?? (MOCK_DATA_ENABLED ? MY_FOLLOWING_USERS : []));
  }, [followingUsersData]);

  useEffect(() => {
    setFollowerUsers(
      sortFollowersForInitialView(
        followerUsersData ?? (MOCK_DATA_ENABLED ? MY_FOLLOWER_USERS : []),
      ),
    );
  }, [followerUsersData, preserveListOnToggle]);

  useEffect(() => {
    if (!preserveListOnToggle) {
      return;
    }

    const mergedUsers = [...(followingUsersData ?? []), ...(followerUsersData ?? [])];

    setFollowOverrides((current) => {
      const nextEntries = Object.entries(current).filter(([userId, isFollowing]) => {
        const matchedUser = mergedUsers.find((user) => user.id === userId);

        if (!matchedUser) {
          return true;
        }

        return matchedUser.isFollowing !== isFollowing;
      });

      return nextEntries.length === Object.keys(current).length
        ? current
        : Object.fromEntries(nextEntries);
    });
  }, [followerUsersData, followingUsersData, preserveListOnToggle]);

  const displayedFollowingUsers = useMemo(
    () =>
      followingUsers.map((user) => ({
        ...user,
        isFollowing:
          followOverrides[user.id] !== undefined
            ? followOverrides[user.id]
            : user.isFollowing,
      })),
    [followOverrides, followingUsers],
  );

  const displayedFollowerUsers = useMemo(
    () =>
      sortFollowersForInitialView(
        followerUsers.map((user) => ({
          ...user,
          isFollowing:
            followOverrides[user.id] !== undefined
              ? followOverrides[user.id]
              : user.isFollowing,
        })),
      ),
    [followOverrides, followerUsers],
  );

  const tabs = useMemo(
    () => [
      {
        key: 'following' as const,
        label: '\uD314\uB85C\uC789',
        count: displayedFollowingUsers.length,
      },
      { key: 'followers' as const, label: '\uD314\uB85C\uC6CC', count: displayedFollowerUsers.length },
    ],
    [displayedFollowerUsers.length, displayedFollowingUsers.length],
  );

  const initialIndex = useMemo(
    () => tabs.findIndex((tab) => tab.key === initialTab),
    [initialTab, tabs],
  );

  useEffect(() => {
    const targetX = Math.max(0, initialIndex) * screenWidth;
    scrollX.setValue(targetX);
    requestAnimationFrame(() => {
      pagerRef.current?.scrollTo({ x: targetX, animated: false });
    });
    setActiveTab(initialTab);
    onChangeTab?.(initialTab);
  }, [initialIndex, initialTab, onChangeTab, scrollX]);

  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [0, screenWidth / 2],
    extrapolate: 'clamp',
  });

  const handlePressTab = (nextTab: FriendTabKey) => {
    const nextIndex = tabs.findIndex((tab) => tab.key === nextTab);
    pagerRef.current?.scrollTo({
      x: nextIndex * screenWidth,
      animated: true,
    });
    setActiveTab(nextTab);
    onChangeTab?.(nextTab);
  };

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth,
    );
    const nextTab = tabs[nextIndex]?.key ?? 'following';
    setActiveTab(nextTab);
    onChangeTab?.(nextTab);
  };

  const applyFollowChange = ({
    nextIsFollowing,
    sourceTab,
    userId,
  }: FollowTogglePayload) => {
    if (preserveListOnToggle) {
      setFollowOverrides((current) => ({
        ...current,
        [userId]: nextIsFollowing,
      }));
      return;
    }

    if (sourceTab === 'following') {
      setFollowingUsers((current) =>
        nextIsFollowing
          ? current
          : current.filter((user) => user.id !== userId),
      );
      setFollowerUsers((current) =>
        current.map((user) =>
          user.id === userId ? { ...user, isFollowing: nextIsFollowing } : user,
        ),
      );
      return;
    }

    let targetFollower: FriendUser | null = null;

    setFollowerUsers((current) =>
      current.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        targetFollower = { ...user, isFollowing: nextIsFollowing };
        return targetFollower;
      }),
    );

    setFollowingUsers((current) => {
      if (nextIsFollowing) {
        if (!targetFollower || current.some((user) => user.id === userId)) {
          return current;
        }

        return [...current, targetFollower];
      }

      return current.filter((user) => user.id !== userId);
    });
  };

  const handleToggleFollow = async (payload: FollowTogglePayload) => {
    if (pendingUserIds.includes(payload.userId)) {
      return;
    }

    if (onToggleFollow) {
      const rollbackPayload: FollowTogglePayload = {
        ...payload,
        nextIsFollowing: !payload.nextIsFollowing,
      };

      applyFollowChange(payload);
      setPendingUserIds((current) => [...current, payload.userId]);

      try {
        const didSucceed = await onToggleFollow(payload);

        if (!didSucceed) {
          applyFollowChange(rollbackPayload);
          return;
        }
      } finally {
        setPendingUserIds((current) => current.filter((id) => id !== payload.userId));
      }

      return;
    }

    applyFollowChange(payload);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerSection}>
          <View style={styles.titleRow}>
            <Pressable style={styles.backButton} onPress={onBack}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.tabSection}>
            <View style={styles.tabRow}>
              {tabs.map((tab) => (
                <Pressable
                  key={tab.key}
                  style={styles.tabButton}
                  onPress={() => handlePressTab(tab.key)}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === tab.key && styles.activeTabLabel,
                    ]}
                  >
                    {`${tab.label} ${tab.count}`}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.tabDivider}>
              <Animated.View
                style={[
                  styles.activeTabIndicator,
                  { transform: [{ translateX: indicatorTranslateX }] },
                ]}
              />
            </View>
          </View>
        </View>

        <Animated.ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
        >
          <View style={styles.page}>
            <FriendList
              pendingUserIds={pendingUserIds}
              onToggleFollow={handleToggleFollow}
              onOpenUserProfile={onOpenUserProfile}
              sourceTab="following"
              users={displayedFollowingUsers}
            />
          </View>
          <View style={styles.page}>
            <FriendList
              pendingUserIds={pendingUserIds}
              onToggleFollow={handleToggleFollow}
              onOpenUserProfile={onOpenUserProfile}
              sourceTab="followers"
              users={displayedFollowerUsers}
            />
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
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 25,
    gap: 10,
  },
  titleRow: {
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
  title: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '500',
    color: '#000000',
  },
  tabSection: {
    marginHorizontal: -HORIZONTAL_PADDING,
  },
  tabRow: {
    flexDirection: 'row',
    width: screenWidth,
    height: 58,
  },
  tabButton: {
    width: screenWidth / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#99A1AF',
  },
  activeTabLabel: {
    color: '#000000',
  },
  tabDivider: {
    width: screenWidth,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  activeTabIndicator: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: screenWidth / 2,
    height: 2,
    backgroundColor: '#000000',
  },
  page: {
    width: screenWidth,
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  listContent: {
    paddingTop: 17,
    paddingBottom: 24,
  },
  friendRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 6,
    backgroundColor: '#D9D9D9',
  },
  friendCopy: {
    flex: 1,
    gap: 3,
  },
  friendNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  friendName: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '600',
    color: '#000000',
  },
  friendMeta: {
    fontSize: 15,
    lineHeight: 19.5,
    fontWeight: '400',
    color: '#838383',
  },
  followButton: {
    minWidth: 68,
    height: 31.5,
    borderRadius: 8,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  followingButton: {
    backgroundColor: '#F3F4F6',
  },
  followButtonLabel: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  followingButtonLabel: {
    color: '#000000',
  },
  pendingFollowButton: {
    opacity: 0.55,
  },
});
