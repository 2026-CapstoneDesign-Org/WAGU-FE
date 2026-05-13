import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { MOCK_DATA_ENABLED } from '../config/mockData';
import { MyReview, myReviews } from '../data/myReviews';
import { ReviewMediaItem } from '../types/reviews';

const REVIEW_IMAGE_SIZE = 172;

type MyReviewsScreenProps = {
  isOwner?: boolean;
  onBack: () => void;
  onDeleteReview?: (reviewId: string) => Promise<boolean> | boolean;
  onOpenRestaurantDetail?: (restaurantName: string) => void;
  reviewsData?: MyReview[];
  title?: string;
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

function MoreDotsIcon() {
  return (
    <View style={styles.moreDots}>
      <View style={styles.moreDot} />
      <View style={styles.moreDot} />
      <View style={styles.moreDot} />
    </View>
  );
}

function ReactionButton({
  count,
  icon,
  onPress,
}: {
  count: number;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.reactionButton} onPress={onPress}>
      {icon}
      <Text style={styles.reactionCount}>{count}</Text>
    </Pressable>
  );
}

function getReviewMediaItems(review: Pick<MyReview, 'imageUris' | 'media'>): ReviewMediaItem[] {
  if (review.media?.length) {
    return review.media;
  }

  return (review.imageUris ?? []).map((uri, index) => ({
    id: `legacy-media-${index}-${uri}`,
    type: 'image',
    uri,
  }));
}

export function MyReviewsScreen({
  isOwner = true,
  onBack,
  onDeleteReview,
  onOpenRestaurantDetail,
  reviewsData = MOCK_DATA_ENABLED ? myReviews : [],
  title = '내 리뷰',
}: MyReviewsScreenProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [reviews, setReviews] = useState(reviewsData);
  const previewScrollRef = useRef<ScrollView>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewImageSizes, setPreviewImageSizes] = useState<
    Record<string, { height: number; width: number }>
  >({});
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [previewCurrentIndex, setPreviewCurrentIndex] = useState(0);
  const [openMenuReviewId, setOpenMenuReviewId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(18)).current;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setReviews(reviewsData);
  }, [reviewsData]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    previewImages.forEach((imageUri) => {
      if (previewImageSizes[imageUri]) {
        return;
      }

      Image.getSize(
        imageUri,
        (width, height) => {
          setPreviewImageSizes((current) => ({
            ...current,
            [imageUri]: { height, width },
          }));
        },
        () => {
          setPreviewImageSizes((current) => ({
            ...current,
            [imageUri]: { height: 1, width: 1 },
          }));
        },
      );
    });
  }, [previewImageSizes, previewImages]);

  const showSelfReactionToast = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show('자신의 리뷰에는 반응할 수 없어요.', ToastAndroid.SHORT);
      return;
    }

    setToastMessage('자신의 리뷰에는 반응할 수 없어요.');
    setIsToastVisible(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    Animated.parallel([
      Animated.timing(toastOpacity, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        duration: 180,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    toastTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          duration: 180,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          duration: 180,
          toValue: 18,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsToastVisible(false);
        }
      });
    }, 1800);
  };

  const handleDeleteReview = (reviewId: string) => {
    setOpenMenuReviewId(null);
    Alert.alert('리뷰를 삭제하시겠습니까?', '', [
      {
        style: 'cancel',
        text: '취소',
      },
      {
        style: 'destructive',
        text: '삭제',
        onPress: async () => {
          if (onDeleteReview) {
            const didSucceed = await onDeleteReview(reviewId);

            if (!didSucceed) {
              return;
            }
          }

          setReviews((current) => current.filter((review) => review.id !== reviewId));
        },
      },
    ]);
  };

  const openImagePreview = (images: string[], index: number) => {
    setPreviewImages(images);
    setSelectedImageIndex(index);
    setPreviewCurrentIndex(index);
    requestAnimationFrame(() => {
      previewScrollRef.current?.scrollTo({
        animated: false,
        x: windowWidth * index,
      });
    });
  };

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort((left, right) => {
        const leftDate = Number(left.date.replaceAll('.', ''));
        const rightDate = Number(right.date.replaceAll('.', ''));

        return rightDate - leftDate;
      }),
    [reviews],
  );

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

        {openMenuReviewId ? (
          <Pressable
            style={styles.menuBackdrop}
            onPress={() => setOpenMenuReviewId(null)}
          />
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: 34 + insets.bottom }]}
        >
          {sortedReviews.map((review, index) => {
            const reviewMedia = getReviewMediaItems(review);

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

                    {isOwner ? (
                      <View style={styles.actionRow}>
                        <Pressable
                          hitSlop={14}
                          style={styles.moreButton}
                          onPress={() =>
                            setOpenMenuReviewId((current) =>
                              current === review.id ? null : review.id,
                            )
                          }
                        >
                          <MoreDotsIcon />
                        </Pressable>
                        {openMenuReviewId === review.id ? (
                          <View style={styles.moreMenu}>
                            <Pressable
                              onPress={() => handleDeleteReview(review.id)}
                              style={styles.moreMenuItem}
                            >
                              <Text style={[styles.moreMenuLabel, styles.moreMenuLabelDanger]}>
                                삭제하기
                              </Text>
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.reviewContent}>{review.content}</Text>
                </View>

                {reviewMedia.length ? (
                  <View style={styles.reviewImagesCarousel}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.reviewImagesRow}
                    >
                      {reviewMedia.slice(0, 5).map((media, mediaIndex, mediaItems) => (
                        <Pressable
                          key={media.id}
                          style={[
                            styles.reviewImage,
                            mediaIndex < mediaItems.length - 1 ? styles.reviewImageSpacing : null,
                          ]}
                          onPress={() =>
                            openImagePreview(
                              mediaItems
                                .filter((item) => item.type === 'image')
                                .map((item) => item.uri),
                              mediaItems
                                .filter((item) => item.type === 'image')
                                .findIndex((item) => item.id === media.id),
                            )
                          }
                        >
                          <Image source={{ uri: media.uri }} style={styles.reviewImageFill} />
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                <View style={styles.reviewReactionRow}>
                  <ReactionButton
                    count={review.likes}
                    icon={<ThumbUpIcon color="#666666" />}
                    onPress={showSelfReactionToast}
                  />
                  <ReactionButton
                    count={review.dislikes}
                    icon={<ThumbDownIcon color="#666666" />}
                    onPress={showSelfReactionToast}
                  />
                </View>

                {index < sortedReviews.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </ScrollView>

        <Modal
          animationType="none"
          onRequestClose={() => setSelectedImageIndex(null)}
          transparent
          visible={selectedImageIndex !== null}
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
                x: selectedImageIndex !== null ? windowWidth * selectedImageIndex : 0,
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
                    onPress={() => setSelectedImageIndex(null)}
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
                      <Image source={{ uri: photoUri }} style={styles.imageModalImage} />
                    </Pressable>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>

        {Platform.OS === 'ios' && isToastVisible ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.toastContainer,
              {
                bottom: 24 + insets.bottom,
                opacity: toastOpacity,
                transform: [{ translateY: toastTranslateY }],
              },
            ]}
          >
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        ) : null}
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
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
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
  actionRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreDots: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  },
  moreDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 999,
    backgroundColor: '#9A9A9A',
  },
  moreMenu: {
    position: 'absolute',
    top: 34,
    right: 0,
    minWidth: 110,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 20,
  },
  moreMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  moreMenuLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#222222',
  },
  moreMenuLabelDanger: {
    color: '#F92A1D',
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
  reactionButton: {
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
  reactionCount: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '500',
    color: '#666666',
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
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 20, 20, 0.92)',
  },
  toastText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
