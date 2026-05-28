import { Image, type ImageSourcePropType, StyleSheet, View } from 'react-native';

import {
  normalizeReliabilityGrade,
  type ReliabilityGradeLabel,
} from '../utils/reliability';

const DEFAULT_BADGE_HEIGHT = 32;
const BADGE_ASPECT_RATIO = 320 / 310;

const BADGE_SOURCE_BY_GRADE: Record<ReliabilityGradeLabel, ImageSourcePropType> = {
  언랭: require('../../assets/rank/unrank.png'),
  브론즈: require('../../assets/rank/bronze.png'),
  실버: require('../../assets/rank/silver.png'),
  골드: require('../../assets/rank/gold.png'),
  플래티넘: require('../../assets/rank/platinum.png'),
  다이아: require('../../assets/rank/diamond.png'),
  루비: require('../../assets/rank/ruby.png'),
};

type ReliabilityBadgeProps = {
  grade?: string;
  height?: number;
};

export function ReliabilityBadge({
  grade,
  height = DEFAULT_BADGE_HEIGHT,
}: ReliabilityBadgeProps) {
  const normalizedGrade = normalizeReliabilityGrade(grade);

  if (!normalizedGrade) {
    return null;
  }

  const width = height * BADGE_ASPECT_RATIO;

  return (
    <View
      style={[
        styles.badgeWrap,
        {
          height,
          width,
        },
      ]}
    >
      <Image
        source={BADGE_SOURCE_BY_GRADE[normalizedGrade]}
        style={[
          styles.badgeImage,
          {
            height,
            width,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badgeImage: {},
  badgeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  },
});
