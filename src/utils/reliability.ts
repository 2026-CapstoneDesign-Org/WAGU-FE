export type ReliabilityGradeLabel =
  | '언랭'
  | '브론즈'
  | '실버'
  | '골드'
  | '플래티넘'
  | '다이아'
  | '루비';

export type ReliabilityGradeInfo = {
  description: string;
  key: ReliabilityGradeLabel;
};

export const RELIABILITY_GRADE_INFOS: ReliabilityGradeInfo[] = [
  {
    key: '언랭',
    description:
      '이제 막 신뢰도를 쌓기 시작한 단계예요. 리뷰와 활동이 쌓일수록 다음 등급으로 올라갈 수 있어요.',
  },
  {
    key: '브론즈',
    description:
      '기본적인 리뷰와 활동이 꾸준히 쌓인 상태예요. 신뢰도 있는 기록을 남기면 더 빠르게 성장할 수 있어요.',
  },
  {
    key: '실버',
    description:
      '리뷰 수와 활동량이 안정적으로 쌓인 단계예요. 다른 사용자에게도 참고가 되는 신뢰도를 보여주고 있어요.',
  },
  {
    key: '골드',
    description:
      '꾸준한 활동과 좋은 반응이 함께 쌓인 단계예요. 믿고 참고할 만한 유저라는 인상을 주기 시작해요.',
  },
  {
    key: '플래티넘',
    description:
      '활동량과 신뢰도가 모두 높은 상위권 단계예요. 영향력 있는 리뷰어로 보이기 시작하는 구간이에요.',
  },
  {
    key: '다이아',
    description:
      '높은 신뢰도와 리뷰, 꾸준한 활동을 오래 보여준 단계예요. WAGU 안에서 매우 신뢰받는 유저예요.',
  },
  {
    key: '루비',
    description:
      '가장 높은 신뢰도를 가진 최고 등급이에요. 꾸준함과 영향력을 모두 인정받는 대표적인 유저예요.',
  },
];

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
    return '플래티넘';
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

  if (normalizedGrade === '플래티넘' || normalizedGrade === '플래티늄') {
    return '플래티넘';
  }

  if (normalizedGrade === '다이아') {
    return '다이아';
  }

  if (normalizedGrade === '루비') {
    return '루비';
  }

  return null;
}
