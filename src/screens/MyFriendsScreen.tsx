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
  onToggleFollow,
  onOpenUserProfile,
  sourceTab,
  user,
}: {
  onToggleFollow: (payload: FollowTogglePayload) => void;
  onOpenUserProfile?: (userId: string) => void;
  sourceTab: FriendTabKey;
  user: FriendUser;
}) {
  return (
    <Pressable style={styles.friendRow} onPress={() => onOpenUserProfile?.(user.id)}>
      <View style={styles.thumbnail} />
      <View style={styles.friendCopy}>
        <Text style={styles.friendName}>{user.name}</Text>
        <Text style={styles.friendMeta}>{`\uB9AC\uBDF0 \u00B7 ${user.reviewCount.toLocaleString('ko-KR')}`}</Text>
      </View>
      {user.showFollowAction ? (
        <Pressable
          style={[
            styles.followButton,
            user.isFollowing && styles.followingButton,
          ]}
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
  onToggleFollow,
  onOpenUserProfile,
  sourceTab,
  users,
}: {
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
  title = '\uBC25\uCE5C\uAD6C',
}: MyFriendsScreenProps) {
  const pagerRef = useRef<ScrollView | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<FriendTabKey>(initialTab);
  const [followingUsers, setFollowingUsers] = useState(
    followingUsersData ?? MY_FOLLOWING_USERS,
  );
  const [followerUsers, setFollowerUsers] = useState(() =>
    sortFollowersForInitialView(followerUsersData ?? MY_FOLLOWER_USERS),
  );

  useEffect(() => {
    setFollowingUsers(followingUsersData ?? MY_FOLLOWING_USERS);
  }, [followingUsersData]);

  useEffect(() => {
    setFollowerUsers(sortFollowersForInitialView(followerUsersData ?? MY_FOLLOWER_USERS));
  }, [followerUsersData]);

  const tabs = useMemo(
    () => [
      {
        key: 'following' as const,
        label: '\uD314\uB85C\uC789',
        count: followingUsers.length,
      },
      { key: 'followers' as const, label: '\uD314\uB85C\uC6CC', count: followerUsers.length },
    ],
    [followerUsers.length, followingUsers.length],
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

  const handleToggleFollow = ({
    nextIsFollowing,
    sourceTab,
    userId,
  }: FollowTogglePayload) => {
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
              onToggleFollow={handleToggleFollow}
              onOpenUserProfile={onOpenUserProfile}
              sourceTab="following"
              users={followingUsers}
            />
          </View>
          <View style={styles.page}>
            <FriendList
              onToggleFollow={handleToggleFollow}
              onOpenUserProfile={onOpenUserProfile}
              sourceTab="followers"
              users={followerUsers}
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
});
