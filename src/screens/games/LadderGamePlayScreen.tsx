import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import WaguIcon from '../../../assets/icons/WAGUicon.svg';
import { LadderGameSetup } from '../../types/ladderGame';
import {
  buildLadderGame,
  buildLadderPathPoints,
  buildSvgPath,
  getLadderOutcomeIndex,
  measurePathLength,
} from '../../utils/ladderGame';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const HORIZONTAL_PADDING = 26;
const ROW_GAP = 32;
const TAIL_LENGTH = 18;
const CHARACTER_SIZE = 56;
const CHARACTER_COLORS = [
  '#FF5A4F',
  '#FF9F43',
  '#FFD93D',
  '#35C889',
  '#2EC5FF',
  '#4D8BFF',
  '#8B5CF6',
  '#FF5DB1',
];
const CHARACTER_COLOR_LABELS = [
  '빨강',
  '주황',
  '노랑',
  '초록',
  '하늘',
  '파랑',
  '보라',
  '핑크',
];

type LadderGamePlayScreenProps = {
  onBack: () => void;
  setup: LadderGameSetup;
};

export function LadderGamePlayScreen({
  onBack,
  setup,
}: LadderGamePlayScreenProps) {
  const [ladderWidth, setLadderWidth] = useState(0);
  const [generationKey, setGenerationKey] = useState(0);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);
  const [resolvedOutcomeIndex, setResolvedOutcomeIndex] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [outcomes, setOutcomes] = useState(setup.outcomes);
  const pathProgress = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setOutcomes(setup.outcomes);
    setSelectedPlayerIndex(null);
    setResolvedOutcomeIndex(null);
    setIsStarted(false);
    setShowAllResults(false);
    pathProgress.setValue(0);
    overlayOpacity.setValue(1);
  }, [overlayOpacity, pathProgress, setup]);

  const baseGame = useMemo(
    () =>
      buildLadderGame({
        outcomes: Array.from({ length: setup.players.length }, () => ''),
        players: setup.players,
      }),
    [generationKey, setup.players],
  );

  const game = useMemo(
    () => ({
      ...baseGame,
      outcomes: outcomes.map((value, index) => value.trim() || `결과 ${index + 1}`),
    }),
    [baseGame, outcomes],
  );

  const columnXs = useMemo(() => {
    if (ladderWidth <= 0) {
      return [];
    }

    const count = game.players.length;
    const usableWidth = Math.max(1, ladderWidth - HORIZONTAL_PADDING * 2);
    const gap = count > 1 ? usableWidth / (count - 1) : 0;

    return Array.from({ length: count }, (_, index) => HORIZONTAL_PADDING + gap * index);
  }, [game.players.length, ladderWidth]);

  const boardHeight = game.rowCount * ROW_GAP + TAIL_LENGTH;

  const pathPoints = useMemo(() => {
    if (selectedPlayerIndex === null || columnXs.length === 0) {
      return [];
    }

    return buildLadderPathPoints(game, selectedPlayerIndex, columnXs, ROW_GAP, TAIL_LENGTH);
  }, [columnXs, game, selectedPlayerIndex]);

  const pathLength = useMemo(() => measurePathLength(pathPoints), [pathPoints]);
  const pathDefinition = useMemo(() => buildSvgPath(pathPoints), [pathPoints]);
  const allResults = useMemo(
    () =>
      game.players.map((player, index) => ({
        color: CHARACTER_COLORS[index % CHARACTER_COLORS.length],
        label: CHARACTER_COLOR_LABELS[index % CHARACTER_COLOR_LABELS.length],
        outcome: game.outcomes[getLadderOutcomeIndex(game, index)],
        player,
      })),
    [game],
  );
  const animatedDashOffset = useMemo(
    () =>
      pathProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [pathLength, 0],
      }),
    [pathLength, pathProgress],
  );

  useEffect(() => {
    if (!pathDefinition || pathLength <= 0 || selectedPlayerIndex === null) {
      return;
    }

    pathProgress.setValue(0);
    Animated.timing(pathProgress, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pathDefinition, pathLength, pathProgress, selectedPlayerIndex]);

  const hasEmptyOutcome = outcomes.some((value) => value.trim().length === 0);

  const handleLadderLayout = (event: LayoutChangeEvent) => {
    setLadderWidth(event.nativeEvent.layout.width);
  };

  const handleReveal = () => {
    if (hasEmptyOutcome) {
      return;
    }

    setIsStarted(true);
    setShowAllResults(false);
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 360,
      useNativeDriver: true,
    }).start();
  };

  const handleRegenerate = () => {
    setGenerationKey((current) => current + 1);
    setSelectedPlayerIndex(null);
    setResolvedOutcomeIndex(null);
    setIsStarted(false);
    setShowAllResults(false);
    pathProgress.setValue(0);
    overlayOpacity.setValue(1);
  };

  const handleLoserMode = () => {
    const loserIndex = Math.floor(Math.random() * setup.players.length);

    setOutcomes(
      Array.from({ length: setup.players.length }, (_, index) =>
        index === loserIndex ? '꽝' : '통과',
      ),
    );
    setSelectedPlayerIndex(null);
    setResolvedOutcomeIndex(null);
    setIsStarted(false);
    setShowAllResults(false);
    pathProgress.setValue(0);
    overlayOpacity.setValue(1);
  };

  const handleSelectPlayer = (playerIndex: number) => {
    if (!isStarted) {
      return;
    }

    setShowAllResults(false);
    setSelectedPlayerIndex(playerIndex);
    setResolvedOutcomeIndex(getLadderOutcomeIndex(game, playerIndex));
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>사다리타기</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={handleLoserMode}>
              <Text style={styles.secondaryButtonLabel}>꽝뽑기 모드</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={handleRegenerate}>
              <Text style={styles.secondaryButtonLabel}>다시 섞기</Text>
            </Pressable>
          </View>

          <View style={styles.boardCard}>
            <View style={styles.characterRow}>
              {game.players.map((player, index) => {
                const isActive = selectedPlayerIndex === index;
                const characterColor = CHARACTER_COLORS[index % CHARACTER_COLORS.length];
                const positionedStyle =
                  columnXs.length > 0
                    ? {
                        position: 'absolute' as const,
                        left: columnXs[index] - CHARACTER_SIZE / 2,
                        width: CHARACTER_SIZE,
                      }
                    : styles.characterSlotFallback;

                return (
                  <Pressable
                    key={player}
                    style={[styles.characterSlot, positionedStyle]}
                    disabled={!isStarted}
                    onPress={() => handleSelectPlayer(index)}
                  >
                    <View style={[styles.characterFrame, isActive && styles.characterFrameActive]}>
                      <WaguIcon
                        width={42}
                        height={42}
                        color={characterColor}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.svgWrap} onLayout={handleLadderLayout}>
              {ladderWidth > 0 ? (
                <>
                  <Svg width={ladderWidth} height={boardHeight}>
                    {columnXs.map((x) => (
                      <Line
                        key={`vertical-${x}`}
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={boardHeight}
                        stroke="#CFCFCF"
                        strokeWidth={3}
                        strokeLinecap="round"
                      />
                    ))}
                    {game.bridges.map((bridge) => {
                      const x1 = columnXs[bridge.fromColumn];
                      const x2 = columnXs[bridge.fromColumn + 1];
                      const y = (bridge.row + 1) * ROW_GAP;

                      return (
                        <Line
                          key={`bridge-${bridge.row}-${bridge.fromColumn}`}
                          x1={x1}
                          y1={y}
                          x2={x2}
                          y2={y}
                          stroke="#B9B9B9"
                          strokeWidth={3}
                          strokeLinecap="round"
                        />
                      );
                    })}
                    {pathDefinition ? (
                      <AnimatedPath
                        d={pathDefinition}
                        stroke="#FF3B30"
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        strokeDasharray={pathLength}
                        strokeDashoffset={animatedDashOffset}
                      />
                    ) : null}
                  </Svg>
                  {!isStarted ? (
                    <Animated.View
                      pointerEvents="none"
                      style={[styles.bridgeMaskWrap, { opacity: overlayOpacity }]}
                    >
                      <View style={styles.bridgeMask} />
                    </Animated.View>
                  ) : null}
                </>
              ) : null}
            </View>

            <View style={styles.outcomeRow}>
              {outcomes.map((outcome, index) => {
                const isActive = resolvedOutcomeIndex === index;

                return (
                  <View key={`outcome-${index}`} style={styles.outcomeSlot}>
                    {isStarted ? (
                      <View
                        style={[
                          styles.outcomeChip,
                          isActive && styles.outcomeChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.outcomeChipLabel,
                            isActive && styles.outcomeChipLabelActive,
                          ]}
                          numberOfLines={2}
                        >
                          {game.outcomes[index]}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        value={outcome}
                        onChangeText={(nextValue) =>
                          setOutcomes((current) =>
                            current.map((value, currentIndex) =>
                              currentIndex === index ? nextValue : value,
                            ),
                          )
                        }
                        placeholder={`결과 ${index + 1}`}
                        placeholderTextColor="#AAAAAA"
                        style={styles.outcomeInput}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {!isStarted ? (
            <Pressable
              style={[styles.primaryButton, hasEmptyOutcome && styles.primaryButtonDisabled]}
              disabled={hasEmptyOutcome}
              onPress={handleReveal}
            >
              <Text style={styles.primaryButtonLabel}>시작하기</Text>
            </Pressable>
          ) : showAllResults ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultEyebrow}>전체 결과</Text>
              <View style={styles.resultListWrap}>
                {allResults.map((item, index) => (
                  <View
                    key={`${item.player}-${index}`}
                    style={[
                      styles.resultListRow,
                      index === allResults.length - 1 && styles.resultListRowLast,
                    ]}
                  >
                    <View style={styles.resultListLabelWrap}>
                      <View
                        style={[
                          styles.resultListDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text style={styles.resultListLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.resultListArrow}>→</Text>
                    <Text style={styles.resultListOutcome} numberOfLines={2}>
                      {item.outcome}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : selectedPlayerIndex !== null && resolvedOutcomeIndex !== null ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultEyebrow}>결과</Text>
              <Text style={styles.resultTitle}>
                {`${CHARACTER_COLOR_LABELS[
                  selectedPlayerIndex % CHARACTER_COLOR_LABELS.length
                ]} → ${game.outcomes[resolvedOutcomeIndex]}`}
              </Text>
            </View>
          ) : (
            <View style={styles.resultCardMuted}>
              <Text style={styles.resultCardMutedText}>
                캐릭터를 누르면 사다리 결과를 확인할 수 있어요.
              </Text>
            </View>
          )}

          {isStarted ? (
            <Pressable
              style={styles.ghostButton}
              onPress={() => {
                setShowAllResults(true);
                setSelectedPlayerIndex(null);
                setResolvedOutcomeIndex(null);
              }}
            >
              <Text style={styles.ghostButtonLabel}>전체 결과 보기</Text>
            </Pressable>
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
  secondaryButtonLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: '#222222',
  },
  boardCard: {
    borderRadius: 24,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 14,
  },
  characterRow: {
    position: 'relative',
    height: 58,
  },
  characterSlot: {
    alignItems: 'center',
  },
  characterSlotFallback: {
    flex: 1,
  },
  characterFrame: {
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  characterFrameActive: {
    borderColor: '#111111',
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.06 }],
  },
  characterImage: {
    width: 42,
    height: 42,
  },
  svgWrap: {
    overflow: 'hidden',
  },
  bridgeMaskWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bridgeMask: {
    width: '92%',
    height: '72%',
    borderRadius: 24,
    backgroundColor: '#111111',
    opacity: 0.96,
  },
  outcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  outcomeSlot: {
    flex: 1,
  },
  outcomeInput: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#222222',
  },
  outcomeChip: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  outcomeChipActive: {
    backgroundColor: '#FFE3E0',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  outcomeChipLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  outcomeChipLabelActive: {
    color: '#D9251B',
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#F5B5B1',
  },
  primaryButtonLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
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
    minWidth: 76,
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
  resultListArrow: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
  },
  resultListOutcome: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
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
  ghostButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#222222',
  },
});