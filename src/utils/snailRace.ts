import { SnailRaceRacer, SnailRaceResult } from '../types/snailRace';

export const SNAIL_RACE_MIN_RACERS = 2;
export const SNAIL_RACE_MAX_RACERS = 6;

export const SNAIL_RACE_COLORS = [
  '#FF5A4F',
  '#FF9F43',
  '#FFD93D',
  '#35C889',
  '#2EC5FF',
  '#8B5CF6',
];

export const SNAIL_RACE_COLOR_LABELS = [
  '빨강',
  '주황',
  '노랑',
  '초록',
  '하늘',
  '보라',
];

function clampRacerCount(count: number) {
  return Math.max(SNAIL_RACE_MIN_RACERS, Math.min(SNAIL_RACE_MAX_RACERS, count));
}

export function buildSnailRaceRacers(count: number): SnailRaceRacer[] {
  const racerCount = clampRacerCount(count);

  return Array.from({ length: racerCount }, (_, index) => ({
    burstTicksRemaining: 0,
    color: SNAIL_RACE_COLORS[index % SNAIL_RACE_COLORS.length],
    currentBurst: 0,
    id: `snail-${index + 1}`,
    label: SNAIL_RACE_COLOR_LABELS[index % SNAIL_RACE_COLOR_LABELS.length],
    lateKickBias: (Math.random() - 0.35) * 0.012,
    paceBias: (Math.random() - 0.5) * 0.007,
    progress: 0,
    speed: 0.017 + Math.random() * 0.004,
  }));
}

type AdvanceSnailRaceParams = {
  finishOrder: string[];
  racers: SnailRaceRacer[];
  timeScale?: number;
};

export function advanceSnailRace({
  finishOrder,
  racers,
  timeScale = 1,
}: AdvanceSnailRaceParams) {
  const normalizedTimeScale = Math.max(0.1, timeScale);
  const leaderProgress = Math.max(...racers.map((racer) => racer.progress));
  const nextFinishOrder = [...finishOrder];

  const nextRacers = racers.map((racer) => {
    const behindLeader = leaderProgress - racer.progress;
    const progressPhase = racer.progress;
    const catchUpBoost = behindLeader > 0 ? Math.min(behindLeader * 0.22, 0.024) : 0;
    const leaderBrake = behindLeader === 0 ? 0.006 : 0;
    const phaseSwing =
      progressPhase < 0.28
        ? (Math.random() - 0.5) * 0.01
        : progressPhase < 0.72
          ? (Math.random() - 0.5) * 0.018
          : (Math.random() - 0.5) * 0.024 + racer.lateKickBias;

    const shouldRefreshBurst = racer.burstTicksRemaining <= 0 || Math.random() < 0.12;
    const nextBurst = shouldRefreshBurst
      ? (Math.random() - 0.5) * (progressPhase > 0.65 ? 0.04 : 0.03)
      : racer.currentBurst;
    const nextBurstTicksRemaining = shouldRefreshBurst
      ? 6 + Math.floor(Math.random() * 8)
      : Math.max(0, racer.burstTicksRemaining - 1);

    const randomness =
      (Math.random() - 0.5) * 0.018 + phaseSwing + nextBurst + racer.paceBias;

    const nextSpeed = Math.max(
      0.0055,
      Math.min(
        0.048,
        racer.speed * 0.34 + (0.017 + Math.random() * 0.008) * 0.66 + randomness,
      ),
    );

    const nextProgress = Math.min(
      1,
      racer.progress +
        Math.max(
          0.0055 * normalizedTimeScale,
          (nextSpeed + catchUpBoost - leaderBrake) * normalizedTimeScale,
        ),
    );

    if (nextProgress >= 1 && !nextFinishOrder.includes(racer.id)) {
      nextFinishOrder.push(racer.id);
    }

    return {
      ...racer,
      burstTicksRemaining: nextBurstTicksRemaining,
      currentBurst: nextBurst,
      progress: nextProgress,
      speed: nextSpeed,
    };
  });

  return {
    finishOrder: nextFinishOrder,
    hasWinner: nextFinishOrder.length > 0,
    isFinished: nextFinishOrder.length === nextRacers.length,
    racers: nextRacers,
  };
}

export function buildSnailRaceResults(finishOrder: string[], racers: SnailRaceRacer[]) {
  return finishOrder
    .map((racerId, index) => {
      const racer = racers.find((item) => item.id === racerId);

      if (!racer) {
        return null;
      }

      const result: SnailRaceResult = {
        color: racer.color,
        id: racer.id,
        label: racer.label,
        rank: index + 1,
      };

      return result;
    })
    .filter((result): result is SnailRaceResult => result !== null);
}
