import { Alert } from 'react-native';

import { ApiError } from '../../../api/client';
import { createReport } from '../../../api/wagu';
import type { AuthSession } from '../types';

type CreateReportHandlersDeps = {
  session: AuthSession | null;
};

export function createReportHandlers({ session }: CreateReportHandlersDeps) {
  const handleCreateReport = async (
    targetType: 'REVIEW' | 'USER',
    targetId: number,
    reason: string,
  ) => {
    if (!session?.accessToken) {
      Alert.alert('안내', '로그인 후 이용해 주세요.');
      return;
    }

    try {
      await createReport(session.accessToken, {
        targetType,
        targetId,
        reason,
      });
      Alert.alert('안내', '신고가 접수되었습니다.');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? `[${error.status}] ${error.message || '신고를 접수하지 못했습니다.'}`
          : '신고를 접수하지 못했습니다.';
      Alert.alert('안내', message);
    }
  };

  const handleReportReview = (reviewId: string, reason: string) => {
    const parsedReviewId = Number(reviewId);

    if (Number.isNaN(parsedReviewId)) {
      Alert.alert('안내', '신고 대상을 확인하지 못했습니다.');
      return;
    }

    void handleCreateReport('REVIEW', parsedReviewId, reason);
  };

  const handleReportUser = (userId: string, reason: string) => {
    const parsedUserId = Number(userId);

    if (Number.isNaN(parsedUserId)) {
      Alert.alert('안내', '신고 대상을 확인하지 못했습니다.');
      return;
    }

    void handleCreateReport('USER', parsedUserId, reason);
  };

  return {
    handleReportUser,
    handleReportReview,
  };
}
