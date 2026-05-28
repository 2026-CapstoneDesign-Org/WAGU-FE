export type ReliabilityGradeLabel =
  | '언랭'
  | '브론즈'
  | '실버'
  | '골드'
  | '플레티넘'
  | '다이아'
  | '루비';

export type ReliabilityGradeInfo = {
  description: string;
  key: ReliabilityGradeLabel;
};

export type ReliabilityGradeProgress = {
  currentGrade: ReliabilityGradeLabel;
  currentScore: number;
  nextGrade: ReliabilityGradeLabel | null;
  progressPercent: number;
  remainingPercent: number;
};

export const RELIABILITY_GRADE_ORDER: ReliabilityGradeLabel[] = [
  '언랭',
  '브론즈',
  '실버',
  '골드',
  '플레티넘',
  '다이아',
  '루비',
];

export const RELIABILITY_GRADE_INFOS: ReliabilityGradeInfo[] = [
  {
    key: '언랭',
    description: '이제 막 신뢰도를 쌓기 시작한 단계예요. 리뷰와 활동이 쌓일수록 다음 등급으로 올라갈 수 있어요.',
  },
  {
    key: '브론즈',
    description: '기본적인 리뷰와 활동이 꾸준히 쌓인 상태예요. 신뢰도 있는 기록을 남기면 더 빠르게 성장할 수 있어요.',
  },
  {
    key: '실버',
    description: '리뷰 품질과 활동량이 안정적으로 쌓인 단계예요. 다른 사용자에게도 참고가 되는 수준의 신뢰도를 보여줘요.',
  },
  {
    key: '골드',
    description: '꾸준한 활동과 좋은 반응이 함께 쌓인 단계예요. 믿고 참고할 수 있는 유저라는 인상을 주기 시작해요.',
  },
  {
    key: '플레티넘',
    description: '활동량과 신뢰도가 모두 높은 상위권 단계예요. 영향력 있는 리뷰어로 보이기 시작하는 구간이에요.',
  },
  {
    key: '다이아',
    description: '높은 품질의 리뷰와 꾸준한 활동이 오래 유지된 단계예요. WAGU 안에서 매우 신뢰할 수 있는 유저예요.',
  },
  {
    key: '루비',
    description: '가장 높은 신뢰도를 가진 최고 등급이에요. 꾸준함과 영향력을 모두 인정받는 대표적인 유저예요.',
  },
];

export const RELIABILITY_GRADE_MIN_SCORE: Record<ReliabilityGradeLabel, number> = {
  언랭: 0,
  브론즈: 1,
  실버: 20,
  골드: 40,
  플레티넘: 60,
  다이아: 80,
  루비: 95,
};

export function normalizeReliabilityGrade(
  grade?: string | null,
): ReliabilityGradeLabel | null {
  const normalizedGrade = grade?.trim();
  const normalizedUpper = normalizedGrade?.toUpperCase();

  if (!normalizedGrade) {
    return null;
  }

  if (normalizedUpper === 'UNRANK' || normalizedUpper === 'UNRANKED') {
    return '언랭';
  }

  if (normalizedUpper === 'BRONZE') {
    return '브론즈';
  }

  if (normalizedUpper === 'SILVER') {
    return '실버';
  }

  if (normalizedUpper === 'GOLD') {
    return '골드';
  }

  if (normalizedUpper === 'PLATINUM') {
    return '플레티넘';
  }

  if (normalizedUpper === 'DIAMOND') {
    return '다이아';
  }

  if (normalizedUpper === 'RUBY') {
    return '루비';
  }

  if (normalizedGrade === '언랭') {
    return '언랭';
  }

  if (normalizedGrade === '브론즈') {
    return '브론즈';
  }

  if (normalizedGrade === '실버') {
    return '실버';
  }

  if (normalizedGrade === '골드') {
    return '골드';
  }

  if (normalizedGrade === '플레티넘' || normalizedGrade === '플래티넘') {
    return '플레티넘';
  }

  if (normalizedGrade === '다이아') {
    return '다이아';
  }

  if (normalizedGrade === '루비') {
    return '루비';
  }

  return null;
}

export function mapReliabilityGrade(
  grade?: string,
  score?: number,
): ReliabilityGradeLabel {
  const normalizedGrade = normalizeReliabilityGrade(grade);

  if (normalizedGrade) {
    return normalizedGrade;
  }

  if (typeof score !== 'number' || Number.isNaN(score)) {
    return '언랭';
  }

  if (score >= 95) {
    return '루비';
  }

  if (score >= 80) {
    return '다이아';
  }

  if (score >= 60) {
    return '플레티넘';
  }

  if (score >= 40) {
    return '골드';
  }

  if (score >= 20) {
    return '실버';
  }

  if (score > 0) {
    return '브론즈';
  }

  return '언랭';
}

export function getReliabilityProgress(
  grade?: string | null,
  score?: number | null,
): ReliabilityGradeProgress {
  const currentGrade =
    normalizeReliabilityGrade(grade) ??
    mapReliabilityGrade(undefined, typeof score === 'number' ? score : undefined);
  const safeScore =
    typeof score === 'number' && Number.isFinite(score)
      ? Math.max(0, Math.min(100, score))
      : RELIABILITY_GRADE_MIN_SCORE[currentGrade];
  const currentIndex = RELIABILITY_GRADE_ORDER.indexOf(currentGrade);
  const nextGrade =
    currentIndex >= 0 && currentIndex < RELIABILITY_GRADE_ORDER.length - 1
      ? RELIABILITY_GRADE_ORDER[currentIndex + 1]
      : null;

  if (!nextGrade) {
    return {
      currentGrade,
      currentScore: safeScore,
      nextGrade: null,
      progressPercent: 100,
      remainingPercent: 0,
    };
  }

  const currentMin = RELIABILITY_GRADE_MIN_SCORE[currentGrade];
  const nextMin = RELIABILITY_GRADE_MIN_SCORE[nextGrade];
  const range = Math.max(1, nextMin - currentMin);
  const clampedWithinRange = Math.max(0, Math.min(safeScore - currentMin, range));
  const progressPercent = Math.round((clampedWithinRange / range) * 100);

  return {
    currentGrade,
    currentScore: safeScore,
    nextGrade,
    progressPercent,
    remainingPercent: 100 - progressPercent,
  };
}
