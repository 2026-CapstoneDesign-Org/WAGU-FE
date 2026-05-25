export type ReliabilityGradeLabel =
  | '언랭'
  | '브론즈'
  | '실버'
  | '골드'
  | '플레티넘'
  | '다이아'
  | '루비';

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
