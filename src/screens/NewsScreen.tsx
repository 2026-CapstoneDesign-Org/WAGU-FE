import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';

type NewsItem = {
  id: string;
  actor: string;
  message: string;
  imageUri?: string;
};

type NewsSection = {
  id: string;
  title: string;
  items: NewsItem[];
};

type NewsScreenProps = {
  onBack: () => void;
};

const IMAGE_1 =
  'https://www.figma.com/api/mcp/asset/dbd96308-eddd-4071-bd57-84f522d2120d';
const IMAGE_2 =
  'https://www.figma.com/api/mcp/asset/9d184afe-062a-4ab7-b61e-c69b56efc7b7';
const IMAGE_3 =
  'https://www.figma.com/api/mcp/asset/bedab772-3e88-4a8f-ab70-88bbe11f9817';
const IMAGE_4 =
  'https://www.figma.com/api/mcp/asset/5148360d-d2f8-464b-b63b-7ddb7134ce73';

const newsSections: NewsSection[] = [
  {
    id: 'follower',
    title: '새 팔로워',
    items: [
      {
        id: 'news-1',
        actor: 'JUnn',
        message: '님이 회원님을 팔로우하기 시작했습니다.',
        imageUri: IMAGE_2,
      },
      {
        id: 'news-2',
        actor: '다주',
        message: '님이 회원님을 팔로우하기 시작했습니다.',
        imageUri: IMAGE_4,
      },
      {
        id: 'news-3',
        actor: '서울떡볶이',
        message: '님이 회원님을 팔로우하기 시작했습니다.',
        imageUri: IMAGE_1,
      },
      {
        id: 'news-4',
        actor: '인천회타운',
        message: '님이 회원님을 팔로우하기 시작했습니다.',
        imageUri: IMAGE_1,
      },
    ],
  },
  {
    id: 'like',
    title: '좋아요',
    items: [
      {
        id: 'news-5',
        actor: '강남치맥',
        message: '님이 회원님의 리스트를 좋아합니다.',
        imageUri: IMAGE_3,
      },
    ],
  },
  {
    id: 'following',
    title: '팔로잉 활동',
    items: [
      {
        id: 'news-6',
        actor: '용인맛집러',
        message: '님이 새로운 리뷰를 게시했습니다.',
        imageUri: IMAGE_1,
      },
      {
        id: 'news-7',
        actor: '부산해물탕',
        message: '님이 새로운 리스트를 게시했습니다.',
      },
      {
        id: 'news-8',
        actor: '전주비빔밥',
        message: '님이 새로운 리뷰를 게시했습니다.',
        imageUri: IMAGE_3,
      },
      {
        id: 'news-9',
        actor: '홍대브런치',
        message: '님이 새로운 리뷰를 게시했습니다.',
        imageUri: IMAGE_4,
      },
      {
        id: 'news-10',
        actor: 'kakakaoo',
        message: '님이 새로운 리뷰를 게시했습니다.',
      },
      {
        id: 'news-11',
        actor: '연남동식탁',
        message: '님이 새로운 리스트를 게시했습니다.',
        imageUri: IMAGE_2,
      },
      {
        id: 'news-12',
        actor: '마라좋아',
        message: '님이 새로운 리뷰를 게시했습니다.',
        imageUri: IMAGE_3,
      },
      {
        id: 'news-13',
        actor: '성수브런치',
        message: '님이 새로운 리스트를 게시했습니다.',
        imageUri: IMAGE_4,
      },
      {
        id: 'news-14',
        actor: '국밥탐험대',
        message: '님이 새로운 리뷰를 게시했습니다.',
        imageUri: IMAGE_1,
      },
      {
        id: 'news-15',
        actor: '강릉칼국수',
        message: '님이 새로운 리스트를 게시했습니다.',
      },
    ],
  },
];

export function NewsScreen({ onBack }: NewsScreenProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {newsSections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.sectionBody}>
                {(expandedSections[section.id]
                  ? section.items.slice(0, 30)
                  : section.items.slice(0, 7)
                ).map((item) => (
                  <View key={item.id} style={styles.newsItem}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
                    ) : (
                      <View style={styles.thumbnailFallback} />
                    )}

                    <Text style={styles.newsText}>
                      <Text style={styles.newsActor}>{item.actor}</Text>
                      {item.message}
                    </Text>
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
    alignItems: 'center',
    gap: 15,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 6,
  },
  thumbnailFallback: {
    width: 58,
    height: 58,
    borderRadius: 6,
    backgroundColor: '#C4C4C4',
  },
  newsText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#000000',
  },
  newsActor: {
    fontWeight: '700',
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
