import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import BronzeBadge from '../../assets/rank/bronze.svg';
import DiamondBadge from '../../assets/rank/diamond.svg';
import GoldBadge from '../../assets/rank/gold.svg';
import PlatinumBadge from '../../assets/rank/platinum.svg';
import RubyBadge from '../../assets/rank/ruby.svg';
import SilverBadge from '../../assets/rank/silver.svg';
import UnrankBadge from '../../assets/rank/unrank.svg';
import {
  normalizeReliabilityGrade,
  type ReliabilityGradeLabel,
} from '../utils/reliability';

const DEFAULT_BADGE_HEIGHT = 32;
const BADGE_ASPECT_RATIO = 1.22;
const BADGE_VISUAL_SCALE = 2.15;

const BADGE_COMPONENT_BY_GRADE: Record<
  ReliabilityGradeLabel,
  ComponentType<any>
> = {
  언랭: UnrankBadge,
  브론즈: BronzeBadge,
  실버: SilverBadge,
  골드: GoldBadge,
  플레티넘: PlatinumBadge,
  다이아: DiamondBadge,
  루비: RubyBadge,
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

  const BadgeComponent = BADGE_COMPONENT_BY_GRADE[normalizedGrade];
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
      <BadgeComponent
        height={height}
        width={width}
        style={{
          height,
          transform: [{ scale: BADGE_VISUAL_SCALE }],
          width,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badgeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    overflow: 'hidden',
    transform: [{ translateY: 4 }],
  },
});
