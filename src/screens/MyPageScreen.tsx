import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import FollowIcon from '../../assets/icons/follow.svg';
import ListIcon from '../../assets/icons/list.svg';
import ReviewIcon from '../../assets/icons/review.svg';
import SettingIcon from '../../assets/icons/setting.svg';
import { AppTab, BottomTabBar, TAB_BAR_HEIGHT } from '../components/BottomTabBar';

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 6;
const CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const quickMenus = [
  { id: 'list', label: '리스트', type: 'list' as const },
  { id: 'review', label: '리뷰', type: 'review' as const },
  { id: 'friend', label: '밥친구', type: 'follow' as const },
  { id: 'settings', label: '설정', type: 'setting' as const },
];

const mainListCards = [
  { id: 'card-1', title: '와이앤웍 용인직영점' },
  { id: 'card-2', title: '공탕 용산본점' },
  { id: 'card-3', title: '킨토토 역북점' },
  { id: 'card-4', title: '육심' },
  { id: 'card-5', title: '짬뽕관 용인역북점' },
  { id: 'card-6', title: '제주둘레국수 강남점' },
  { id: 'card-7', title: '미식회관 성수점' },
  { id: 'card-8', title: '오븐스테이크 수지점' },
  { id: 'card-9', title: '샤브하우스 분당점' },
  { id: 'card-10', title: '포메인 역삼점' },
  { id: 'card-11', title: '라멘공방 판교점' },
  { id: 'card-12', title: '버거스튜디오 홍대점' },
  { id: 'card-13', title: '마라천국 광교점' },
  { id: 'card-14', title: '카레마스터 죽전점' },
  { id: 'card-15', title: '타코하우스 성복점' },
  { id: 'card-16', title: '브런치테이블 서현점' },
  { id: 'card-17', title: '스시몬 동탄점' },
  { id: 'card-18', title: '정성식당 수원점' },
  { id: 'card-19', title: '한우마을 광교점' },
  { id: 'card-20', title: '로제파스타랩 강남점' },
  { id: 'card-21', title: '초밥정원 판교점' },
  { id: 'card-22', title: '곱창공방 잠실점' },
  { id: 'card-23', title: '담솥 용인수지점' },
];

type MyPageScreenProps = {
  nickname?: string;
  onOpenMyReviews?: () => void;
  onOpenSettings: () => void;
  onSelectTab: (tab: AppTab) => void;
};

function QuickMenuIcon({ type }: { type: (typeof quickMenus)[number]['type'] }) {
  if (type === 'list') {
    return <ListIcon width={35} height={35} color="#000000" />;
  }

  if (type === 'review') {
    return <ReviewIcon width={35} height={35} color="#000000" />;
  }

  if (type === 'follow') {
    return <FollowIcon width={35} height={35} color="#000000" />;
  }

  return <SettingIcon width={35} height={35} color="#000000" />;
}

export function MyPageScreen({
  nickname = '먹부림',
  onOpenMyReviews,
  onOpenSettings,
  onSelectTab,
}: MyPageScreenProps) {
  const insets = useSafeAreaInsets();
  const [visibleCount, setVisibleCount] = useState(10);
  const contentBottomPadding = 40 + TAB_BAR_HEIGHT + insets.bottom;

  const visibleCards = mainListCards.slice(0, visibleCount);
  const hasMoreCards = visibleCount < mainListCards.length;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.container, { paddingBottom: contentBottomPadding }]}
        >
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <Text style={styles.nickname}>{`${nickname}님`}</Text>
              <View style={styles.metricsRow}>
                <View style={styles.metricGroup}>
                  <Text style={styles.metricLabel}>매너온도</Text>
                  <Text style={styles.temperatureValue}>36.5°C</Text>
                </View>
                <View style={styles.metricGroup}>
                  <Text style={styles.metricLabel}>팔로워</Text>
                  <Text style={styles.metricValue}>1,234</Text>
                </View>
              </View>
            </View>

            <View style={styles.quickMenuRow}>
              {quickMenus.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.quickMenuItem}
                  onPress={
                    item.id === 'settings'
                      ? onOpenSettings
                      : item.id === 'review'
                        ? onOpenMyReviews
                        : undefined
                  }
                >
                  <View style={styles.quickMenuIconWrap}>
                    <QuickMenuIcon type={item.type} />
                  </View>
                  <Text style={styles.quickMenuLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.mainListSection}>
            <Text style={styles.sectionTitle}>메인 리스트</Text>

            <View style={styles.cardGrid}>
              {visibleCards.map((item) => (
                <Pressable key={item.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </Pressable>
              ))}
            </View>

            {hasMoreCards ? (
              <Pressable
                style={styles.moreButton}
                onPress={() =>
                  setVisibleCount((current) =>
                    Math.min(current + 10, mainListCards.length)
                  )
                }
              >
                <Text style={styles.moreButtonLabel}>더 보기</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        <BottomTabBar
          activeTab="my"
          onPressHome={() => onSelectTab('home')}
          onPressMap={() => onSelectTab('map')}
          onPressRanking={() => onSelectTab('ranking')}
          onPressMy={() => onSelectTab('my')}
        />
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
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 25,
    gap: 35,
  },
  profileSection: {
    gap: 30,
  },
  profileHeader: {
    gap: 5,
  },
  nickname: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: '#000000',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  metricGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricLabel: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '500',
    color: '#000000',
  },
  temperatureValue: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '600',
    color: '#FF0000',
  },
  metricValue: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '600',
    color: '#000000',
  },
  quickMenuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  quickMenuItem: {
    width: 50,
    alignItems: 'center',
    gap: 5,
  },
  quickMenuIconWrap: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickMenuLabel: {
    width: 50,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000000',
  },
  mainListSection: {
    gap: 15,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: 224,
    borderRadius: 5,
    backgroundColor: '#D9D9D9',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  moreButton: {
    width: '100%',
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  moreButtonLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#000000',
  },
});
