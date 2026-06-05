import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import type { MyReview } from '../../types/myReviews';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const REVIEW_IMAGE_SIZE = 172;

type ReviewReaction = 'like' | 'dislike' | null;

type UserReviewsScreenProps = {
  onBack: () => void;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  onToggleReaction?: (
    reviewId: string,
    nextReaction: ReviewReaction,
  ) => Promise<boolean> | boolean;
  pendingReactionIds?: string[];
  reviews: MyReview[];
  title: string;
};

function ThumbUpIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5.4C4.84 21 4.56 21 4.346 20.891C4.157 20.795 4.005 20.643 3.909 20.454C3.8 20.24 3.8 19.96 3.8 19.4V11.6C3.8 11.04 3.8 10.76 3.909 10.546C4.005 10.357 4.157 10.205 4.346 10.109C4.56 10 4.84 10 5.4 10H9M9 21V10M9 21L13.649 21C14.593 21 15.441 20.417 15.777 19.535L18.467 12.475C18.961 11.178 18.002 9.8 16.614 9.8H13.2V6.6C13.2 5.495 12.305 4.6 11.2 4.6C10.869 4.6 10.6 4.869 10.6 5.2V7.076C10.6 7.551 10.431 8.011 10.123 8.374L9 10"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ThumbDownIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 3H5.4C4.84 3 4.56 3 4.346 3.109C4.157 3.205 4.005 3.357 3.909 3.546C3.8 3.76 3.8 4.04 3.8 4.6V12.4C3.8 12.96 3.8 13.24 3.909 13.454C4.005 13.643 4.157 13.795 4.346 13.891C4.56 14 4.84 14 5.4 14H9M9 3V14M9 3L13.649 3C14.593 3 15.441 3.583 15.777 4.465L18.467 11.525C18.961 12.822 18.002 14.2 16.614 14.2H13.2V17.4C13.2 18.505 12.305 19.4 11.2 19.4C10.869 19.4 10.6 19.131 10.6 18.8V16.924C10.6 16.449 10.431 15.989 10.123 15.626L9 14"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ReviewReactionButton({
  active = false,
  count,
  icon,
  isPending = false,
  onPress,
}: {
  active?: boolean;
  count: number;
  icon: React.ReactNode;
  isPending?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={isPending}
      onPress={onPress}
      style={[
        styles.reviewReactionButton,
        active ? styles.reviewReactionButtonActive : null,
        isPending ? styles.reviewReactionButtonPending : null,
      ]}
    >
      {icon}
      <Text
        style={[styles.reviewReactionCount, active ? styles.reviewReactionCountActive : null]}
      >
        {count}
      </Text>
    </Pressable>
  );
}

export function UserReviewsScreen({
  onBack,
  onOpenRestaurantDetail,
  onToggleReaction,
  pendingReactionIds = [],
  reviews,
  title,
}: UserReviewsScreenProps) {
  const insets = useSafeAreaInsets();
  const previewScrollRef = useRef<ScrollView | null>(null);
  const [reviewReactions, setReviewReactions] = useState<Record<string, ReviewReaction>>({});
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [previewCurrentIndex, setPreviewCurrentIndex] = useState(0);
  const [previewImageSizes, setPreviewImageSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort((left, right) => {
        const leftDate = Number(left.date.replaceAll('.', ''));
        const rightDate = Number(right.date.replaceAll('.', ''));
        return rightDate - leftDate;
      }),
    [reviews],
  );

  const handleToggleReaction = async (
    reviewId: string,
    reaction: Exclude<ReviewReaction, null>,
  ) => {
    const baseReview = reviews.find((item) => item.id === reviewId);
    const currentReaction = reviewReactions[reviewId] ?? baseReview?.myReaction ?? null;
    const nextReaction = currentReaction === reaction ? null : reaction;

    setReviewReactions((current) => ({
      ...current,
      [reviewId]: nextReaction,
    }));

    if (!onToggleReaction) {
      return;
    }

    const didSucceed = await onToggleReaction(reviewId, nextReaction);

    if (didSucceed) {
      return;
    }

    setReviewReactions((current) => ({
      ...current,
      [reviewId]: currentReaction,
    }));
  };

  const getReactionCounts = (review: MyReview) => {
    const initialReaction = review.myReaction ?? null;
    const currentReaction = reviewReactions[review.id] ?? initialReaction;
    let likes = review.likes;
    let dislikes = review.dislikes;

    if (initialReaction === 'like') {
      likes = Math.max(0, likes - 1);
    } else if (initialReaction === 'dislike') {
      dislikes = Math.max(0, dislikes - 1);
    }

    if (currentReaction === 'like') {
      return {
        dislikes,
        likes: likes + 1,
      };
    }

    if (currentReaction === 'dislike') {
      return {
        dislikes: dislikes + 1,
        likes,
      };
    }

    return {
      dislikes,
      likes,
    };
  };

  const openPhotoPreview = (images: string[], index: number) => {
    setPreviewImages(images);
    setSelectedPhotoIndex(index);
    setPreviewCurrentIndex(index);

    requestAnimationFrame(() => {
      previewScrollRef.current?.scrollTo({
        animated: false,
        x: windowWidth * index,
      });
    });
  };

  const getPreviewImageFrame = (imageUri: string) => {
    const maxWidth = windowWidth - 32;
    const maxHeight = windowHeight * 0.72;
    const imageSize = previewImageSizes[imageUri];

    if (!imageSize) {
      return {
        height: maxHeight,
        width: maxWidth,
      };
    }

    const imageRatio = imageSize.width / imageSize.height;
    const frameRatio = maxWidth / maxHeight;

    if (imageRatio > frameRatio) {
      return {
        height: maxWidth / imageRatio,
        width: maxWidth,
      };
    }

    return {
      height: maxHeight,
      width: maxHeight * imageRatio,
    };
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: 34 + insets.bottom }]}
        >
          {sortedReviews.map((review, index) => {
            const currentReaction = reviewReactions[review.id] ?? review.myReaction ?? null;
            const reactionCounts = getReactionCounts(review);
            const isPending = pendingReactionIds.includes(review.id);

            return (
              <View key={review.id} style={styles.reviewSection}>
                <View style={styles.reviewBody}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewMeta}>
                      <Pressable
                        style={styles.restaurantLinkRow}
                        onPress={() => onOpenRestaurantDetail?.(review.restaurantName)}
                      >
                        <Text style={styles.restaurantName}>{review.restaurantName}</Text>
                        <Text style={styles.restaurantChevron}>›</Text>
                      </Pressable>
                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>{review.category}</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.metaText}>{review.date}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.reviewContent}>{review.content}</Text>
                </View>

                {review.imageUris?.length ? (
                  <View style={styles.reviewImagesCarousel}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.reviewImagesRow}
                    >
                      {review.imageUris.slice(0, 5).map((imageUri, imageIndex, images) => (
                        <Pressable
                          key={`${review.id}-${imageIndex}`}
                          style={[
                            styles.reviewImage,
                            imageIndex < images.length - 1 ? styles.reviewImageSpacing : null,
                          ]}
                          onPress={() => openPhotoPreview(images, imageIndex)}
                        >
                          <Image source={{ uri: imageUri }} style={styles.reviewImageFill} />
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                <View style={styles.reviewReactionRow}>
                  <ReviewReactionButton
                    active={currentReaction === 'like'}
                    count={reactionCounts.likes}
                    icon={<ThumbUpIcon color={currentReaction === 'like' ? '#F92A1D' : '#666666'} />}
                    isPending={isPending}
                    onPress={() => void handleToggleReaction(review.id, 'like')}
                  />
                  <ReviewReactionButton
                    active={currentReaction === 'dislike'}
                    count={reactionCounts.dislikes}
                    icon={
                      <ThumbDownIcon
                        color={currentReaction === 'dislike' ? '#F92A1D' : '#666666'}
                      />
                    }
                    isPending={isPending}
                    onPress={() => void handleToggleReaction(review.id, 'dislike')}
                  />
                </View>

                {index < sortedReviews.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </ScrollView>

        <Modal
          animationType="none"
          onRequestClose={() => setSelectedPhotoIndex(null)}
          transparent
          visible={selectedPhotoIndex !== null}
        >
          <View style={styles.imageModalBackdrop}>
            <View style={styles.photoPreviewHeader}>
              <View style={styles.imageIndexBadge}>
                <Text style={styles.imageIndexBadgeText}>
                  {previewImages.length ? (
                    <>
                      <Text style={styles.imageIndexBadgeTextCurrent}>
                        {previewCurrentIndex + 1}
                      </Text>
                      <Text style={styles.imageIndexBadgeTextMuted}>/{previewImages.length}</Text>
                    </>
                  ) : (
                    ''
                  )}
                </Text>
              </View>
            </View>

            <ScrollView
              ref={previewScrollRef}
              contentOffset={{
                x: selectedPhotoIndex !== null ? windowWidth * selectedPhotoIndex : 0,
                y: 0,
              }}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imagePreviewScroll}
              onMomentumScrollEnd={(event) => {
                const nextIndex = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
                setPreviewCurrentIndex(nextIndex);
              }}
            >
              {previewImages.map((photoUri, index) => {
                const imageFrame = getPreviewImageFrame(photoUri);

                return (
                  <Pressable
                    key={`${photoUri}-${index}`}
                    style={[styles.imagePreviewPage, { width: windowWidth }]}
                    onPress={() => setSelectedPhotoIndex(null)}
                  >
                    <Pressable
                      style={[
                        styles.imageModalImageWrap,
                        {
                          height: imageFrame.height,
                          width: imageFrame.width,
                        },
                      ]}
                      onPress={(event) => event.stopPropagation()}
                    >
                      <Image
                        source={{ uri: photoUri }}
                        style={styles.imageModalImage}
                        onLoad={(event) => {
                          const { height, width } = event.nativeEvent.source;
                          setPreviewImageSizes((current) => ({
                            ...current,
                            [photoUri]: { height, width },
                          }));
                        }}
                      />
                    </Pressable>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
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
    paddingHorizontal: 16,
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
  content: {
    paddingTop: 25,
    gap: 24,
  },
  reviewSection: {
    gap: 12,
  },
  reviewBody: {
    gap: 12,
    paddingHorizontal: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  reviewMeta: {
    flex: 1,
    gap: 4,
  },
  restaurantLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
  },
  restaurantName: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: '#000000',
  },
  restaurantChevron: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '400',
    color: '#6F6F6F',
    marginTop: -1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '400',
    color: '#999999',
  },
  dot: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
    color: '#999999',
    marginTop: -2,
  },
  reviewContent: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: '#000000',
  },
  reviewImagesCarousel: {
    overflow: 'hidden',
  },
  reviewImagesRow: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 16,
  },
  reviewImage: {
    width: REVIEW_IMAGE_SIZE,
    height: REVIEW_IMAGE_SIZE,
    borderRadius: 5,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  reviewImageFill: {
    width: '100%',
    height: '100%',
  },
  reviewImageSpacing: {
    marginRight: 4,
  },
  reviewReactionRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewReactionButton: {
    minWidth: 44,
    height: 27.5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  reviewReactionButtonActive: {
    backgroundColor: '#FFF0EE',
    borderColor: '#FFC4BC',
  },
  reviewReactionButtonPending: {
    opacity: 0.5,
  },
  reviewReactionCount: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '500',
    color: '#666666',
  },
  reviewReactionCountActive: {
    color: '#F92A1D',
    fontWeight: '600',
  },
  divider: {
    marginTop: 12,
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E6E6E6',
  },
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.96)',
    justifyContent: 'center',
  },
  photoPreviewHeader: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  imageIndexBadge: {
    minWidth: 72,
    height: 28,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndexBadgeText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageIndexBadgeTextCurrent: {
    color: '#FFFFFF',
  },
  imageIndexBadgeTextMuted: {
    color: 'rgba(255,255,255,0.78)',
  },
  imagePreviewScroll: {
    flex: 1,
  },
  imagePreviewPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
