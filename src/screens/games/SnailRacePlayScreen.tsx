import { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import WaguIcon from '../../../assets/icons/WAGUicon.svg';
import { SnailRaceResult } from '../../types/snailRace';
import {
  advanceSnailRace,
  buildSnailRaceRacers,
  buildSnailRaceResults,
} from '../../utils/snailRace';

const CHARACTER_SIZE = 42;
const TRACK_LEFT_PADDING = 14;
const TRACK_RIGHT_PADDING = 18;
const FINISH_LINE_WIDTH = 10;
const TICK_MS = 48;
const BASE_TICK_MS = 110;
const TRACK_WORLD_WIDTH_FACTOR_50M = 3.2;
const TRACK_WORLD_WIDTH_FACTOR_100M = 6.4;
const MIN_WORLD_TRACK_WIDTH_50M = 1200;
const MIN_WORLD_TRACK_WIDTH_100M = 2400;
const CAMERA_FOLLOW_RATIO = 0.28;

type RaceDistance = 50 | 100;

type SnailRacePlayScreenProps = {
  onBack: () => void;
  racerCount: number;
};

export function SnailRacePlayScreen({
  onBack,
  racerCount,
}: SnailRacePlayScreenProps) {
  const [racers, setRacers] = useState(() => buildSnailRaceRacers(racerCount));
  const [trackWidth, setTrackWidth] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [finishOrder, setFinishOrder] = useState<string[]>([]);
  const [distance, setDistance] = useState<RaceDistance>(50);

  useEffect(() => {
    setRacers(buildSnailRaceRacers(racerCount));
    setTrackWidth(0);
    setIsRunning(false);
    setWinnerId(null);
    setFinishOrder([]);
    setDistance(50);
  }, [racerCount]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setRacers((currentRacers) => {
        const nextState = advanceSnailRace({
          finishOrder,
          racers: currentRacers,
          timeScale: TICK_MS / BASE_TICK_MS,
        });

        if (nextState.finishOrder.length > finishOrder.length) {
          setFinishOrder(nextState.finishOrder);
        }

        if (nextState.hasWinner && !winnerId) {
          setWinnerId(nextState.finishOrder[0] ?? null);
        }

        if (nextState.isFinished) {
          setIsRunning(false);
        }

        return nextState.racers;
      });
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [finishOrder, isRunning, winnerId]);

  const results = useMemo<SnailRaceResult[]>(
    () => buildSnailRaceResults(finishOrder, racers),
    [finishOrder, racers],
  );

  const winner = useMemo(
    () => results.find((result) => result.id === winnerId) ?? null,
    [results, winnerId],
  );

  const worldTrackWidth = useMemo(() => {
    const factor = distance === 100 ? TRACK_WORLD_WIDTH_FACTOR_100M : TRACK_WORLD_WIDTH_FACTOR_50M;
    const minimumWidth = distance === 100 ? MIN_WORLD_TRACK_WIDTH_100M : MIN_WORLD_TRACK_WIDTH_50M;

    return Math.max(trackWidth * factor, minimumWidth);
  }, [distance, trackWidth]);

  const cameraOffset = useMemo(() => {
    if (trackWidth <= 0) {
      return 0;
    }

    const maxCameraOffset = Math.max(0, worldTrackWidth - trackWidth);
    const leaderProgress = Math.max(...racers.map((racer) => racer.progress));
    const leaderWorldX = TRACK_LEFT_PADDING + worldTrackWidth * leaderProgress;

    return Math.min(
      maxCameraOffset,
      Math.max(0, leaderWorldX - trackWidth * CAMERA_FOLLOW_RATIO),
    );
  }, [racers, trackWidth, worldTrackWidth]);

  const handleStart = () => {
    if (isRunning || winnerId) {
      return;
    }

    setIsRunning(true);
  };

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const handleRestart = () => {
    setRacers(buildSnailRaceRacers(racerCount));
    setIsRunning(false);
    setWinnerId(null);
    setFinishOrder([]);
  };

  const handleToggleDistance = () => {
    if (isRunning) {
      return;
    }

    setDistance((current) => (current === 50 ? 100 : 50));
    setRacers(buildSnailRaceRacers(racerCount));
    setWinnerId(null);
    setFinishOrder([]);
  };

  const distanceButtonLabel = distance === 100 ? '짧게 달리기' : '더 길게 달리기';

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>곰돌이 레이스</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.secondaryButton, isRunning && styles.secondaryButtonDisabled]}
              disabled={isRunning}
              onPress={handleToggleDistance}
            >
              <Text style={styles.secondaryButtonLabel}>{distanceButtonLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, isRunning && styles.secondaryButtonDisabled]}
              disabled={isRunning}
              onPress={handleRestart}
            >
              <Text style={styles.secondaryButtonLabel}>다시 하기</Text>
            </Pressable>
          </View>

          <View style={styles.boardCard}>
            <View style={styles.boardHeader}>
              <Text style={styles.boardEyebrow}>RACE TRACK</Text>
              <Text style={styles.boardModeLabel}>
                {distance === 100 ? '더 길게 달리기 모드' : '기본 레이스'}
              </Text>
              <Text style={styles.boardDescription}>
                역전에 역전, 끝까지 몰라요.
              </Text>
            </View>

            <View style={styles.trackList}>
              {racers.map((racer) => {
                const left =
                  TRACK_LEFT_PADDING + worldTrackWidth * racer.progress - cameraOffset;

                return (
                  <View key={racer.id} style={styles.trackRow}>
                    <Text style={styles.trackLabel}>{racer.label}</Text>
                    <View style={styles.trackLane} onLayout={handleTrackLayout}>
                      <View style={styles.trackLaneBed} />
                      <View style={styles.trackLaneRailTop} />
                      <View style={styles.trackLaneRailBottom} />
                      <View
                        style={[
                          styles.trackWorld,
                          {
                            width: worldTrackWidth,
                            transform: [{ translateX: -cameraOffset }],
                          },
                        ]}
                      >
                        <View style={styles.startLine} />
                        <View style={styles.trackGrooveTop} />
                        <View style={styles.trackGrooveBottom} />
                        <View style={styles.trackLine} />
                        <View style={styles.trackDashWrap}>
                          {Array.from(
                            { length: Math.max(10, Math.ceil(worldTrackWidth / 72)) },
                            (_, dashIndex) => (
                              <View
                                key={`${racer.id}-dash-${dashIndex}`}
                                style={styles.trackDash}
                              />
                            ),
                          )}
                        </View>
                        <View style={styles.finishLine} />
                      </View>

                      <View style={[styles.racerWrap, { left }]}>
                        <View style={[styles.shell, { backgroundColor: racer.color }]} />
                        <WaguIcon
                          width={CHARACTER_SIZE}
                          height={CHARACTER_SIZE}
                          color={racer.color}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {!isRunning && !winner ? (
            <Pressable style={styles.primaryButton} onPress={handleStart}>
              <Text style={styles.primaryButtonLabel}>시작하기</Text>
            </Pressable>
          ) : null}

          {isRunning ? (
            <View style={styles.resultCardMuted}>
              <Text style={styles.resultCardMutedText}>레이스 진행 중...</Text>
            </View>
          ) : null}

          {winner && !isRunning ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultEyebrow}>우승 곰돌이</Text>
              <Text style={styles.resultTitle}>{winner.label} 곰돌이</Text>
              <View style={styles.resultListWrap}>
                {results.map((result, index) => (
                  <View
                    key={result.id}
                    style={[
                      styles.resultListRow,
                      index === results.length - 1 && styles.resultListRowLast,
                    ]}
                  >
                    <View style={styles.resultListLabelWrap}>
                      <View style={[styles.resultListDot, { backgroundColor: result.color }]} />
                      <Text style={styles.resultListLabel}>{result.rank}위</Text>
                    </View>
                    <Text style={styles.resultListOutcome}>{result.label} 곰돌이</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
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
    fontWeight: '600',
    color: '#111111',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButtonLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: '#222222',
  },
  boardCard: {
    borderRadius: 24,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 18,
  },
  boardHeader: {
    gap: 6,
  },
  boardEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#FF6B57',
    letterSpacing: 1,
  },
  boardModeLabel: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111111',
  },
  boardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4C4C4C',
  },
  trackList: {
    gap: 16,
  },
  trackRow: {
    gap: 8,
  },
  trackLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#333333',
  },
  trackLane: {
    position: 'relative',
    height: 54,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#EBC8B8',
    borderWidth: 1,
    borderColor: '#D9AE99',
  },
  trackLaneBed: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EBC8B8',
  },
  trackLaneRailTop: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 7,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#F7E2D7',
    opacity: 0.9,
  },
  trackLaneRailBottom: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 7,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#C58F79',
    opacity: 0.75,
  },
  trackWorld: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  startLine: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: TRACK_LEFT_PADDING + 10,
    width: 6,
    borderRadius: 999,
    backgroundColor: '#FFF7F2',
    opacity: 0.95,
  },
  trackGrooveTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 15,
    height: 1,
    backgroundColor: '#D6A792',
    opacity: 0.7,
  },
  trackGrooveBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
    height: 1,
    backgroundColor: '#D6A792',
    opacity: 0.7,
  },
  trackLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 25,
    height: 4,
    backgroundColor: '#F7EDE7',
  },
  trackDashWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    paddingHorizontal: 10,
  },
  trackDash: {
    width: 20,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#C68F78',
    opacity: 0.9,
  },
  finishLine: {
    position: 'absolute',
    top: 0,
    right: TRACK_RIGHT_PADDING,
    bottom: 0,
    width: FINISH_LINE_WIDTH,
    borderRadius: 4,
    backgroundColor: '#1A1A1A',
  },
  racerWrap: {
    position: 'absolute',
    top: 6,
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    position: 'absolute',
    width: 26,
    height: 18,
    borderRadius: 999,
    top: 14,
    left: 5,
    opacity: 0.22,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultCardMuted: {
    borderRadius: 22,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  resultCardMutedText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#444444',
  },
  resultCard: {
    borderRadius: 22,
    backgroundColor: '#151515',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 4,
  },
  resultEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#FFB4AB',
    letterSpacing: 1,
  },
  resultTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultListWrap: {
    marginTop: 6,
  },
  resultListRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 9,
  },
  resultListRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  resultListLabelWrap: {
    minWidth: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultListDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  resultListLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultListOutcome: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});