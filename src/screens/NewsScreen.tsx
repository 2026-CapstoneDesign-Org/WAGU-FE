import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import {
  ApiNotification,
  ApiNotificationType,
  getNotifications,
  markAllNotificationsAsRead,
} from '../api/wagu';

type NewsItem = {
  createdAt?: string;
  id: string;
  isRead: boolean;
  message: string;
  type: ApiNotificationType;
};

type NewsSection = {
  id: 'follow' | 'following' | 'like';
  items: NewsItem[];
  title: string;
};

type NewsScreenProps = {
  accessToken?: string | null;
  onBack: () => void;
};

const SECTION_ORDER: Array<NewsSection['id']> = ['follow', 'like', 'following'];

function getSectionId(type: ApiNotificationType): NewsSection['id'] {
  switch (type) {
    case 'FOLLOW':
      return 'follow';
    case 'LIST_LIKE':
    case 'REVIEW_LIKE':
      return 'like';
    case 'FOLLOWING_NEW_LIST':
    case 'FOLLOWING_NEW_REVIEW':
      return 'following';
    default:
      return 'following';
  }
}

function getSectionTitle(sectionId: NewsSection['id']) {
  switch (sectionId) {
    case 'follow':
      return '새 팔로워';
    case 'like':
      return '좋아요';
    case 'following':
      return '팔로잉 활동';
    default:
      return '소식';
  }
}

function formatNotificationMessage(notification: ApiNotification) {
  return notification.message?.trim() || '새로운 알림이 도착했어요.';
}

function formatRelativeTime(createdAt?: string) {
  if (!createdAt) {
    return '';
  }

  const created = new Date(createdAt).getTime();

  if (Number.isNaN(created)) {
    return '';
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - created) / 60000));

  if (diffMinutes < 1) {
    return '방금 전';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  return createdAt.slice(0, 10).replace(/-/g, '.');
}

export function NewsScreen({ accessToken, onBack }: NewsScreenProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NewsItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNotifications = async (mode: 'initial' | 'refresh' = 'initial') => {
    if (!accessToken) {
      setNotifications([]);
      setErrorMessage('로그인이 필요합니다.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (mode === 'initial') {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const result = await getNotifications(accessToken);
      const mapped = result.map((notification) => ({
        createdAt: notification.createdAt,
        id: String(notification.id),
        isRead: notification.isRead ?? false,
        message: formatNotificationMessage(notification),
        type: notification.type,
      }));

      setNotifications(mapped);
      setErrorMessage(null);

      void markAllNotificationsAsRead(accessToken).catch(() => undefined);
    } catch {
      setNotifications([]);
      setErrorMessage('알림을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadNotifications('initial');
  }, [accessToken]);

  const sections = useMemo(() => {
    const grouped = notifications.reduce<Record<NewsSection['id'], NewsItem[]>>(
      (accumulator, item) => {
        const sectionId = getSectionId(item.type);
        accumulator[sectionId].push(item);
        return accumulator;
      },
      {
        follow: [],
        following: [],
        like: [],
      },
    );

    return SECTION_ORDER.map((sectionId) => ({
      id: sectionId,
      items: grouped[sectionId],
      title: getSectionTitle(sectionId),
    })).filter((section) => section.items.length > 0);
  }, [notifications]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>소식</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color="#FF3B30" />
          </View>
        ) : errorMessage ? (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>{errorMessage}</Text>
          </View>
        ) : sections.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>아직 도착한 알림이 없어요.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => {
                  void loadNotifications('refresh');
                }}
                tintColor="#FF3B30"
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section) => (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                <View style={styles.sectionBody}>
                  {(expandedSections[section.id]
                    ? section.items.slice(0, 30)
                    : section.items.slice(0, 7)
                  ).map((item) => (
                    <View key={item.id} style={styles.newsItem}>
                      <View style={styles.dotWrap}>
                        {!item.isRead ? <View style={[styles.dot, styles.unreadDot]} /> : null}
                      </View>

                      <View style={styles.newsCopy}>
                        <Text style={styles.newsText}>{item.message}</Text>
                        <Text style={styles.newsTime}>{formatRelativeTime(item.createdAt)}</Text>
                      </View>
                    </View>
                  ))}

                  {section.items.length > 7 ? (
                    <Pressable
                      style={styles.moreButton}
                      onPress={() => toggleSection(section.id)}
                    >
                      <View style={styles.moreLine} />
                      <Text style={styles.moreButtonText}>
                        {expandedSections[section.id] ? '접기' : '더 보기'}
                      </Text>
                      <View style={styles.moreLine} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
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
    paddingTop: 14,
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  listContent: {
    paddingTop: 25,
    paddingBottom: 32,
    gap: 28,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  sectionBody: {
    gap: 15,
  },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dotWrap: {
    width: 10,
    alignItems: 'center',
    marginTop: 6,
    flexShrink: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  unreadDot: {
    backgroundColor: '#FF3B30',
  },
  newsCopy: {
    flex: 1,
    gap: 4,
  },
  newsText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  newsTime: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#A0A0A0',
  },
  moreButton: {
    marginTop: 4,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreLine: {
    width: 24,
    height: 1,
    backgroundColor: '#D9D9D9',
  },
  moreButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#7A7A7A',
  },
});
