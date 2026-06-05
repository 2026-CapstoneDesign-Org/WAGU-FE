import { Alert } from 'react-native';
import type { Dispatch, SetStateAction } from 'react';

import {
  cancelReviewVote,
  deleteReview,
  getUserReviews,
  voteReview,
} from '../../../api/wagu';
import type { MyReview } from '../../../types/myReviews';
import type { AuthSession } from '../types';

type CreateReviewHandlersDeps = {
  mapApiReviewToMyReview: (review: Awaited<ReturnType<typeof getUserReviews>>[number]) => MyReview;
  myUserId: number | null;
  session: AuthSession | null;
  setMyReviewItems: Dispatch<SetStateAction<MyReview[]>>;
  setRemoteUserReviewsByUserId: Dispatch<SetStateAction<Record<string, MyReview[]>>>;
  setReviewReactionPendingIds: Dispatch<SetStateAction<string[]>>;
};

function applyStoredReviewReaction(
  items: MyReview[],
  reviewId: string,
  nextReaction: 'dislike' | 'like' | null,
) {
  return items.map((review) => {
    if (review.id !== reviewId) {
      return review;
    }

    const previousReaction = review.myReaction ?? null;
    let likes = review.likes;
    let dislikes = review.dislikes;

    if (previousReaction === 'like') {
      likes = Math.max(0, likes - 1);
    } else if (previousReaction === 'dislike') {
      dislikes = Math.max(0, dislikes - 1);
    }

    if (nextReaction === 'like') {
      likes += 1;
    } else if (nextReaction === 'dislike') {
      dislikes += 1;
    }

    return {
      ...review,
      dislikes,
      likes,
      myReaction: nextReaction,
    };
  });
}

export function createReviewHandlers({
  mapApiReviewToMyReview,
  myUserId,
  session,
  setMyReviewItems,
  setRemoteUserReviewsByUserId,
  setReviewReactionPendingIds,
}: CreateReviewHandlersDeps) {
  const refreshMyReviews = async (token: string, userId: number) => {
    const reviews = await getUserReviews(token, userId);
    setMyReviewItems(reviews.map(mapApiReviewToMyReview));
  };

  const handleToggleUserReviewReaction = async (
    reviewId: string,
    nextReaction: 'dislike' | 'like' | null,
  ) => {
    if (!session?.accessToken) {
      return false;
    }

    const parsedReviewId = Number(reviewId);

    if (Number.isNaN(parsedReviewId)) {
      Alert.alert('안내', '리뷰 반응을 변경하지 못했습니다.');
      return false;
    }

    setReviewReactionPendingIds((current) =>
      current.includes(reviewId) ? current : [...current, reviewId],
    );

    try {
      if (nextReaction === null) {
        await cancelReviewVote(session.accessToken, parsedReviewId);
      } else {
        await voteReview(session.accessToken, parsedReviewId, {
          voteType: nextReaction === 'like' ? 'LIKE' : 'DISLIKE',
        });
      }

      setMyReviewItems((current) => applyStoredReviewReaction(current, reviewId, nextReaction));
      setRemoteUserReviewsByUserId((current) =>
        Object.fromEntries(
          Object.entries(current).map(([userId, reviews]) => [
            userId,
            applyStoredReviewReaction(reviews, reviewId, nextReaction),
          ]),
        ),
      );

      return true;
    } catch {
      Alert.alert('안내', '리뷰 반응을 변경하지 못했습니다.');
      return false;
    } finally {
      setReviewReactionPendingIds((current) => current.filter((id) => id !== reviewId));
    }
  };

  const handleDeleteMyReview = async (reviewId: string) => {
    if (!session?.accessToken) {
      return false;
    }

    const parsedReviewId = Number(reviewId);

    if (Number.isNaN(parsedReviewId)) {
      Alert.alert('안내', '리뷰를 삭제하지 못했습니다.');
      return false;
    }

    const syncMyReviewsFromServer = async () => {
      if (myUserId === null) {
        setMyReviewItems((current) => current.filter((review) => review.id !== reviewId));
        return false;
      }

      const reviews = await getUserReviews(session.accessToken, myUserId);
      const mappedReviews = reviews.map(mapApiReviewToMyReview);
      const stillExists = mappedReviews.some((review) => review.id === reviewId);

      setMyReviewItems(mappedReviews);
      setRemoteUserReviewsByUserId((current) => ({
        ...current,
        [String(myUserId)]: mappedReviews,
      }));

      return stillExists;
    };

    try {
      await deleteReview(session.accessToken, parsedReviewId);
      const stillExists = await syncMyReviewsFromServer();

      if (stillExists) {
        Alert.alert('안내', '리뷰를 삭제하지 못했습니다.');
        return false;
      }

      return true;
    } catch {
      try {
        const stillExists = await syncMyReviewsFromServer();

        if (!stillExists) {
          return true;
        }
      } catch {
        // Ignore sync fallback failures and surface the original delete failure below.
      }

      Alert.alert('안내', '리뷰를 삭제하지 못했습니다.');
      return false;
    }
  };

  return {
    handleDeleteMyReview,
    handleToggleUserReviewReaction,
    refreshMyReviews,
  };
}
