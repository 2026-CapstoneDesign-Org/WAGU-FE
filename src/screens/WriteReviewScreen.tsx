import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import CameraIcon from '../../assets/icons/camera.svg';
import RemoveIcon from '../../assets/icons/remove.svg';
import { ReviewMediaItem } from '../types/reviews';

const MAX_MEDIA_COUNT = 5;
const MAX_REVIEW_LENGTH = 300;

export type WriteReviewDraft = {
  content: string;
  media: ReviewMediaItem[];
};

type WriteReviewScreenProps = {
  initialContent?: string;
  restaurantName: string;
  onBack: () => void;
  onSubmit: (draft: WriteReviewDraft) => Promise<void> | void;
  submitLabel?: string;
  title?: string;
};

function MediaCard({
  item,
  onRemove,
}: {
  item: ReviewMediaItem;
  onRemove: (id: string) => void;
}) {
  return (
    <View style={styles.mediaCard}>
      <Image source={{ uri: item.uri }} style={styles.mediaImage} />

      <Pressable style={styles.removeButton} onPress={() => onRemove(item.id)}>
        <RemoveIcon width={16} height={16} />
      </Pressable>
    </View>
  );
}

export function WriteReviewScreen({
  initialContent = '',
  restaurantName,
  onBack,
  onSubmit,
  submitLabel = '리뷰 등록',
  title = '리뷰 쓰기',
}: WriteReviewScreenProps) {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState(initialContent);
  const [media, setMedia] = useState<ReviewMediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNoticeVisible, setIsNoticeVisible] = useState(false);

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  const handlePickMedia = async () => {
    if (media.length >= MAX_MEDIA_COUNT) {
      Alert.alert('업로드 제한', `사진은 최대 ${MAX_MEDIA_COUNT}장까지 담을 수 있어요.`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한 필요', '사진을 추가하려면 사진 접근 권한이 필요해요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const nextItems = result.assets
      .slice(0, MAX_MEDIA_COUNT - media.length)
      .map((asset, index) => ({
        id: `${Date.now()}-${index}-${asset.assetId ?? asset.fileName ?? 'media'}`,
        type: 'image' as const,
        uri: asset.uri,
        fileName: asset.fileName,
      })) satisfies ReviewMediaItem[];

    setMedia((current) => [...current, ...nextItems]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        content: content.trim(),
        media,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : '리뷰를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.';
      Alert.alert('저장 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {restaurantName || title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.body}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>사진 업로드</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaRow}
              >
                <Pressable style={styles.addMediaCard} onPress={() => void handlePickMedia()}>
                  <View style={styles.addMediaIconWrap}>
                    <CameraIcon width={18} height={18} />
                  </View>
                  <Text style={styles.addMediaLabel}>사진 추가</Text>
                </Pressable>

                {media.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onRemove={(id) =>
                      setMedia((current) => current.filter((mediaItem) => mediaItem.id !== id))
                    }
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.textHeaderRow}>
                <Text style={styles.sectionTitle}>리뷰 내용</Text>
                <Text style={styles.countLabel}>{content.length}/{MAX_REVIEW_LENGTH}</Text>
              </View>

              <TextInput
                multiline
                placeholder="이 가게에 대해 좋았던 점이나 아쉬웠던 점을 자유롭게 적어주세요."
                placeholderTextColor="#B3B3B3"
                style={styles.textInput}
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                maxLength={MAX_REVIEW_LENGTH}
              />

              <Pressable style={styles.noticeButton} onPress={() => setIsNoticeVisible(true)}>
                <Text style={styles.noticeButtonLabel}>리뷰 작성 유의사항</Text>
              </Pressable>
            </View>
          </ScrollView>

          <View style={[styles.bottomBar, { paddingBottom: 14 + insets.bottom }]}>
            <Pressable
              style={[styles.submitButton, !canSubmit ? styles.submitButtonDisabled : null]}
              onPress={() => void handleSubmit()}
              disabled={!canSubmit}
            >
              <Text style={styles.submitButtonLabel}>
                {isSubmitting ? '저장하는 중...' : submitLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={isNoticeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNoticeVisible(false)}
      >
        <Pressable style={styles.noticeOverlay} onPress={() => setIsNoticeVisible(false)}>
          <Pressable style={styles.noticeModal} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.noticeModalTitle}>리뷰 작성 유의사항</Text>

            <View style={styles.noticeList}>
              <Text style={styles.noticeListItem}>
                <Text style={styles.noticeBullet}>• </Text>
                <Text style={styles.noticeEmphasis}>장소와 무관한 내용</Text>
                은 작성하지 않도록 유의해 주세요.
              </Text>
              <Text style={styles.noticeListItem}>
                <Text style={styles.noticeBullet}>• </Text>
                <Text style={styles.noticeEmphasis}>타인의 얼굴</Text>
                이 나오지 않도록 유의해 주세요.
              </Text>
              <Text style={styles.noticeListItem}>
                <Text style={styles.noticeBullet}>• </Text>
                <Text style={styles.noticeEmphasis}>욕설, 비방, 허위 내용</Text>
                은 제재될 수 있어요.
              </Text>
            </View>

            <Pressable
              style={styles.noticeCloseButton}
              onPress={() => setIsNoticeVisible(false)}
            >
              <Text style={styles.noticeCloseButtonLabel}>확인</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 25,
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
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 16,
    gap: 28,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111111',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  addMediaCard: {
    width: 110,
    height: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFD5D0',
    borderStyle: 'dashed',
    backgroundColor: '#FFF8F7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addMediaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMediaLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FF3B30',
  },
  mediaCard: {
    width: 110,
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F3F3',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countLabel: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#999999',
  },
  textInput: {
    minHeight: 240,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#FAFAFA',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    color: '#111111',
  },
  noticeButton: {
    alignSelf: 'flex-start',
  },
  noticeButtonLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#8A8A8A',
    textDecorationLine: 'underline',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#F3B6B1',
  },
  submitButtonLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noticeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  noticeModal: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 16,
  },
  noticeModalTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#111111',
  },
  noticeList: {
    gap: 10,
  },
  noticeListItem: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  noticeBullet: {
    color: '#8A8A8A',
    fontWeight: '700',
  },
  noticeEmphasis: {
    color: '#111111',
    fontWeight: '700',
  },
  noticeCloseButton: {
    marginTop: 4,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeCloseButtonLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#444444',
  },
});
