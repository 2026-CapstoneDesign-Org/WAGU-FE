import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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

export type WriteReviewDraft = {
  content: string;
  media: ReviewMediaItem[];
};

type WriteReviewScreenProps = {
  restaurantName: string;
  onBack: () => void;
  onSubmit: (draft: WriteReviewDraft) => Promise<void> | void;
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
      {item.type === 'image' ? (
        <Image source={{ uri: item.uri }} style={styles.mediaImage} />
      ) : (
        <View style={styles.videoCard}>
          <Text style={styles.videoBadge}>VIDEO</Text>
          <Text numberOfLines={2} style={styles.videoLabel}>
            {item.fileName || '동영상'}
          </Text>
        </View>
      )}

      <Pressable style={styles.removeButton} onPress={() => onRemove(item.id)}>
        <RemoveIcon width={16} height={16} />
      </Pressable>
    </View>
  );
}

export function WriteReviewScreen({
  restaurantName,
  onBack,
  onSubmit,
}: WriteReviewScreenProps) {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<ReviewMediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  const handlePickMedia = async () => {
    if (media.length >= MAX_MEDIA_COUNT) {
      Alert.alert('업로드 제한', `사진과 동영상은 최대 ${MAX_MEDIA_COUNT}개까지 올릴 수 있어요.`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한 필요', '사진이나 동영상을 올리려면 앨범 접근 권한이 필요해요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
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
        type: asset.type === 'video' ? 'video' : 'image',
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
    } catch {
      Alert.alert('등록 실패', '리뷰를 저장하지 못했어요. 잠시 후 다시 시도해주세요.');
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
          <Text style={styles.headerTitle}>리뷰 쓰기</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.body}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              { paddingBottom: 28 + insets.bottom },
            ]}
          >
            <View style={styles.restaurantChip}>
              <Text numberOfLines={1} style={styles.restaurantChipLabel}>
                {restaurantName}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>사진 또는 동영상</Text>
              <Text style={styles.sectionDescription}>
                최대 5개까지 올릴 수 있어요.
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaRow}
              >
                <Pressable style={styles.addMediaCard} onPress={() => void handlePickMedia()}>
                  <View style={styles.addMediaIconWrap}>
                    <CameraIcon width={18} height={18} />
                  </View>
                  <Text style={styles.addMediaLabel}>파일 추가</Text>
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
                <Text style={styles.countLabel}>{content.trim().length}자</Text>
              </View>

              <TextInput
                multiline
                placeholder="이 가게에서 어떤 점이 좋았는지 자유롭게 적어주세요."
                placeholderTextColor="#B3B3B3"
                style={styles.textInput}
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
                maxLength={1000}
              />
            </View>
          </ScrollView>

          <View style={[styles.bottomBar, { paddingBottom: 14 + insets.bottom }]}>
            <Pressable
              style={[styles.submitButton, !canSubmit ? styles.submitButtonDisabled : null]}
              onPress={() => void handleSubmit()}
              disabled={!canSubmit}
            >
              <Text style={styles.submitButtonLabel}>
                {isSubmitting ? '등록하는 중...' : '리뷰 등록'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  restaurantChip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#FFF0EE',
  },
  restaurantChipLabel: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: '#FF3B30',
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
  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: '#8A8A8A',
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
  videoCard: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  videoBadge: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  videoLabel: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
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
});
