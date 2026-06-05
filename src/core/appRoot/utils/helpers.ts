import type { ApiReservation } from '../../../api/wagu';
import { getReliabilityScore } from '../../../api/wagu';
import type { FriendUser } from '../../../types/myFriends';
import type { MyReview } from '../../../types/myReviews';
import type { UserProfile } from '../../../types/userProfiles';
import type { AiReservationDraft, AiReservationResult } from '../../../types/aiReservation';
import { normalizeReliabilityGrade } from '../../../utils/reliability';

export const HOME_PROFILE_ACCENT_COLORS = [
  '#F46A67',
  '#56CDB5',
  '#8361C8',
  '#F6B033',
  '#5D8DF4',
  '#E96DC0',
];

export function sortFollowersForInitialView(users: FriendUser[]) {
  return [...users].sort((left, right) => {
    if (left.isFollowing === right.isFollowing) {
      return 0;
    }

    return left.isFollowing ? 1 : -1;
  });
}

export function mapFollowUsersToFriendUsers(
  users: Array<{ nickname: string; userId: number }>,
  followingUserIds: Set<number>,
) {
  return users.map((user) => ({
    id: String(user.userId),
    isFollowing: followingUserIds.has(user.userId),
    name: user.nickname,
    reliabilityGrade: undefined,
    reviewCount: 0,
    showFollowAction: true,
  }));
}

export async function hydrateFriendUsersWithReliability(
  token: string,
  users: Array<{ nickname: string; userId: number }>,
  followingUserIds: Set<number>,
) {
  const results = await Promise.allSettled(
    users.map(async (user) => {
      const reliability = await getReliabilityScore(token, user.userId).catch(() => null);

      return {
        id: String(user.userId),
        isFollowing: followingUserIds.has(user.userId),
        name: user.nickname,
        reliabilityGrade: normalizeReliabilityGrade(reliability?.grade) ?? undefined,
        reviewCount: 0,
        showFollowAction: true,
      } satisfies FriendUser;
    }),
  );

  return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
}

export function buildFriendUserFromSources(
  userId: string,
  sources: Array<FriendUser[]>,
  fallbackProfiles: UserProfile[],
) {
  const matchedUser = sources.flat().find((user) => user.id === userId);

  if (matchedUser) {
    return { ...matchedUser };
  }

  const targetProfile = fallbackProfiles.find((profile) => profile.id === userId);

  if (!targetProfile) {
    return null;
  }

  return {
    id: userId,
    isFollowing: true,
    name: targetProfile.nickname,
    reliabilityGrade: targetProfile.reliabilityGrade,
    reviewCount: Number(targetProfile.reviewCount ?? 0) || 0,
    showFollowAction: true,
  } satisfies FriendUser;
}

export const retryAsync = async <T,>(
  operation: () => Promise<T>,
  attempts = 3,
  delayMs = 450,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === attempts - 1) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
};

export function mergeUserProfiles(
  primaryProfiles: UserProfile[],
  fallbackProfiles: UserProfile[],
) {
  const mergedProfiles = [...primaryProfiles];
  const existingIds = new Set(primaryProfiles.map((profile) => profile.id));

  fallbackProfiles.forEach((profile) => {
    if (existingIds.has(profile.id)) {
      return;
    }

    mergedProfiles.push(profile);
  });

  return mergedProfiles;
}

export function createSearchResultUserProfile(user: {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  reliabilityGrade?: string;
}): UserProfile {
  const numericId = Number(user.id);
  const accentColor =
    HOME_PROFILE_ACCENT_COLORS[
      Number.isFinite(numericId)
        ? Math.abs(numericId) % HOME_PROFILE_ACCENT_COLORS.length
        : 0
    ];

  return {
    id: user.id,
    nickname: user.nickname,
    profileImageUrl: user.profileImageUrl,
    reliabilityGrade: user.reliabilityGrade,
    reviewCount: '0',
    representativeAccentColor: accentColor,
    representativeListIsLiked: false,
    representativeListId: undefined,
    representativeListTitle: '대표 리스트',
    representativeRestaurants: [],
  };
}

export function formatApiReviewDate(createdAt?: string) {
  if (!createdAt) {
    return '';
  }

  const parsed = new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return createdAt.replaceAll('-', '.').slice(0, 10);
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export function mapApiReviewToMyReview(review: {
  id: number;
  content: string;
  createdAt: string;
  dislikeCount: number;
  imageUrls?: string[];
  likeCount: number;
  myVoteType?: 'DISLIKE' | 'LIKE';
  restaurant?: {
    id: number;
    imageUrl?: string;
    name: string;
    regionName?: string;
  };
  restaurantName?: string;
  categoryName?: string;
}): MyReview {
  return {
    id: String(review.id),
    myReaction:
      review.myVoteType === 'LIKE'
        ? 'like'
        : review.myVoteType === 'DISLIKE'
          ? 'dislike'
          : null,
    restaurantId: review.restaurant ? String(review.restaurant.id) : undefined,
    restaurantImageUri: review.restaurant?.imageUrl,
    restaurantName: review.restaurant?.name ?? review.restaurantName ?? '식당 정보 없음',
    category: review.categoryName ?? review.restaurant?.regionName ?? '',
    date: formatApiReviewDate(review.createdAt),
    content: review.content,
    likes: review.likeCount,
    dislikes: review.dislikeCount,
    imageUris: review.imageUrls ?? [],
  };
}

export function buildAiReservationResult(
  draft: AiReservationDraft,
  reservation: ApiReservation,
): AiReservationResult {
  if (reservation.status === 'CONFIRMED') {
    return {
      detail:
        reservation.aiSummary ??
        `${draft.reservationDateLabel} ${draft.reservationTimeLabel}에 ${draft.partySize}명 예약으로 정리했어요.`,
      status: 'confirmed',
      summary:
        reservation.resultMessage ?? 'AI가 매장과 통화해 예약 가능하다는 답변을 받았어요.',
      title: '예약 완료',
    };
  }

  if (reservation.status === 'UNAVAILABLE') {
    return {
      detail:
        reservation.failureReason ??
        reservation.aiSummary ??
        '매장에서 해당 시간대는 예약이 어렵다고 안내했어요.',
      status: 'rejected',
      summary:
        reservation.resultMessage ?? '매장에서 해당 시간 예약이 어렵다고 답변했어요.',
      title: '예약 실패',
    };
  }

  if (reservation.status === 'NEEDS_CONFIRMATION') {
    return {
      detail:
        reservation.aiSummary ??
        reservation.failureReason ??
        '매장에서 추가 확인이 필요하다고 안내했어요.',
      status: 'needs-confirmation',
      summary: reservation.resultMessage ?? '추가 확인이 필요한 예약으로 접수되었어요.',
      title: '추가 확인 필요',
    };
  }

  if (reservation.status === 'CANCELED') {
    return {
      detail:
        reservation.resultMessage ??
        reservation.failureReason ??
        '예약 요청이 취소되었어요.',
      status: 'canceled',
      summary: '예약 요청이 더 이상 진행되지 않았어요.',
      title: '예약 취소',
    };
  }

  return {
    detail:
      reservation.failureReason ??
      reservation.aiSummary ??
      '전화를 받지 않아 예약 가능 여부를 확인하지 못했어요.',
    status: 'no-answer',
    summary:
      reservation.resultMessage ?? '매장과 연결되지 않아 예약 확인을 마치지 못했어요.',
    title: '전화 연결 실패',
  };
}
