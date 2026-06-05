import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import { getWorldCupCandidates } from '../../api/wagu';
import { WorldCupChoiceCard } from '../../components/worldcup/WorldCupChoiceCard';
import { WorldCupSelectionEffect } from '../../components/worldcup/WorldCupSelectionEffect';
import { WorldCupBracketState, WorldCupCategory, WorldCupEntry } from '../../types/worldCup';
import { advanceWorldCup, createInitialWorldCupState, getCurrentWorldCupMatch } from '../../utils/worldCup';

type MatchPhase = 'enter' | 'idle' | 'selected' | 'exit';
type SelectedSide = 'left' | 'right' | null;

type WorldCupBattleScreenProps = {
  accessToken?: string;
  category: WorldCupCategory;
  onBack: () => void;
  onComplete: (winner: WorldCupEntry) => void;
};

export function WorldCupBattleScreen({
  accessToken,
  category,
  onBack,
  onComplete,
}: WorldCupBattleScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bracketState, setBracketState] = useState<WorldCupBracketState | null>(null);
  const [categoryLabel, setCategoryLabel] = useState<string | null>(null);
  const [phase, setPhase] = useState<MatchPhase>('enter');
  const [selectedSide, setSelectedSide] = useState<SelectedSide>(null);
  const [effectKey, setEffectKey] = useState(0);

  const leftOpacity = useRef(new Animated.Value(0)).current;
  const leftScale = useRef(new Animated.Value(0.95)).current;
  const leftTranslateX = useRef(new Animated.Value(-24)).current;
  const leftTranslateY = useRef(new Animated.Value(12)).current;
  const leftRotate = useRef(new Animated.Value(0)).current;

  const rightOpacity = useRef(new Animated.Value(0)).current;
  const rightScale = useRef(new Animated.Value(0.95)).current;
  const rightTranslateX = useRef(new Animated.Value(24)).current;
  const rightTranslateY = useRef(new Animated.Value(12)).current;
  const rightRotate = useRef(new Animated.Value(0)).current;
  const currentMatch = useMemo(
    () => (bracketState ? getCurrentWorldCupMatch(bracketState) : null),
    [bracketState],
  );
  const progressRatio =
    bracketState && bracketState.matches.length > 0
      ? (bracketState.currentMatchIndex + 1) / bracketState.matches.length
      : 0;

  const resetAnimatedValues = () => {
    leftOpacity.setValue(0);
    leftScale.setValue(0.95);
    leftTranslateX.setValue(-24);
    leftTranslateY.setValue(12);
    leftRotate.setValue(0);

    rightOpacity.setValue(0);
    rightScale.setValue(0.95);
    rightTranslateX.setValue(24);
    rightTranslateY.setValue(12);
    rightRotate.setValue(0);
  };

  const runEnterAnimation = () => {
    setPhase('enter');

    Animated.stagger(60, [
      Animated.parallel([
        Animated.timing(leftOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(leftScale, {
          toValue: 1,
          friction: 8,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(leftTranslateX, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(leftTranslateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(rightOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(rightScale, {
          toValue: 1,
          friction: 8,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(rightTranslateX, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rightTranslateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setPhase('idle');
      setSelectedSide(null);
    });
  };

  useEffect(() => {
    if (!bracketState) {
      return;
    }

    resetAnimatedValues();
    runEnterAnimation();
  }, [bracketState?.currentMatchIndex, bracketState?.roundLabel]);

  useEffect(() => {
    let cancelled = false;

    const normalizeCategory = (value: string | undefined): Exclude<WorldCupCategory, 'all'> => {
      const normalized = value?.trim().toLowerCase();

      if (normalized === 'dessert' || normalized === 'korean' || normalized === 'night') {
        return normalized;
      }

      return category === 'all' ? 'korean' : category;
    };

    const hydrateCandidates = async () => {
      if (!accessToken || category === 'all') {
        setBracketState(null);
        setErrorMessage('월드컵 후보를 불러올 수 없어요.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getWorldCupCandidates(accessToken, {
          category,
          roundSize: 8,
        });

        if (cancelled) {
          return;
        }

        const mappedEntries: WorldCupEntry[] = response.items.map((item) => ({
          category: normalizeCategory(response.category),
          id: item.id,
          imageUri: item.imageUrl,
          kind:
            item.kind === 'CHICKEN_BRAND'
              ? 'chicken-brand'
              : item.kind === 'DESSERT_MENU'
                ? 'dessert-menu'
                : 'menu',
          title: item.name,
        }));

        if (mappedEntries.length < 2) {
          setBracketState(null);
          setCategoryLabel(response.categoryLabel ?? null);
          setErrorMessage('월드컵 후보가 아직 충분하지 않아요.');
          return;
        }

        setCategoryLabel(response.categoryLabel ?? null);
        setBracketState(
          createInitialWorldCupState(
            mappedEntries,
            normalizeCategory(response.category),
            response.roundSize,
          ),
        );
      } catch {
        if (!cancelled) {
          setBracketState(null);
          setCategoryLabel(null);
          setErrorMessage('월드컵 후보를 불러오지 못했어요.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void hydrateCandidates();

    return () => {
      cancelled = true;
    };
  }, [accessToken, category]);

  const handleSelectionFinish = (winner: WorldCupEntry) => {
    if (!bracketState) {
      return;
    }

    const { champion, nextState } = advanceWorldCup(bracketState, winner);

    if (champion) {
      onComplete(champion);
      return;
    }

    if (nextState) {
      resetAnimatedValues();
      setBracketState(nextState);
    }
  };

  const handleSelect = (side: 'left' | 'right') => {
    if (phase !== 'idle' || !currentMatch) {
      return;
    }

    const winner = side === 'left' ? currentMatch.left : currentMatch.right;
    const winningScale = side === 'left' ? leftScale : rightScale;
    const losingOpacity = side === 'left' ? rightOpacity : leftOpacity;
    const losingScale = side === 'left' ? rightScale : leftScale;
    const winnerTranslateY = side === 'left' ? leftTranslateY : rightTranslateY;
    const winnerTranslateX = side === 'left' ? leftTranslateX : rightTranslateX;
    const winnerRotate = side === 'left' ? leftRotate : rightRotate;
    const winnerOpacity = side === 'left' ? leftOpacity : rightOpacity;
    const loserTranslateY = side === 'left' ? rightTranslateY : leftTranslateY;
    const loserRotate = side === 'left' ? rightRotate : leftRotate;

    setPhase('selected');
    setSelectedSide(side);
    setEffectKey((current) => current + 1);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(winningScale, {
          toValue: 0.97,
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(winningScale, {
          toValue: 1.04,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(losingOpacity, {
          toValue: 0.66,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(losingScale, {
          toValue: 0.98,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(() => {
      setPhase('exit');

      Animated.parallel([
        Animated.parallel([
          Animated.timing(winnerTranslateY, {
            toValue: -360,
            duration: 520,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(winnerTranslateX, {
            toValue: side === 'left' ? 24 : -24,
            duration: 520,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(winnerRotate, {
            toValue: side === 'left' ? -0.04 : 0.04,
            duration: 520,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(winnerOpacity, {
            toValue: 0.18,
            duration: 520,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(loserTranslateY, {
            toValue: 170,
            duration: 480,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(loserRotate, {
            toValue: side === 'left' ? 0.08 : -0.08,
            duration: 480,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        handleSelectionFinish(winner);
      });
    }, 220);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="small" color="#FF3B30" />
          <Text style={styles.loadingLabel}>월드컵 후보를 불러오는 중이에요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <Text style={styles.errorLabel}>{errorMessage}</Text>
          <Pressable onPress={onBack} style={styles.retryButton}>
            <Text style={styles.retryButtonLabel}>돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentMatch) {
    return null;
  }

  const activeBracketState = bracketState!;
  const canInteract = phase === 'idle';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon height={24} width={24} />
          </Pressable>
          <Text style={styles.headerTitle}>메뉴 월드컵</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.metaWrap}>
          <View style={styles.metaCopy}>
            <Text style={styles.roundLabel}>{activeBracketState.roundLabel}</Text>
            <Text style={styles.matchLabel}>
              {Math.min(activeBracketState.currentMatchIndex + 1, activeBracketState.matches.length)} / {activeBracketState.matches.length}
            </Text>
          </View>
          {categoryLabel ? <Text style={styles.categoryLabel}>{categoryLabel}</Text> : null}

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
          </View>
        </View>

        <View style={styles.battleWrap}>
          <WorldCupSelectionEffect
            effectKey={effectKey}
            side={selectedSide}
            visible={phase === 'selected' || phase === 'exit'}
          />

          <View style={styles.cardRow}>
            <WorldCupChoiceCard
              animatedStyle={{
                opacity: leftOpacity,
                transform: [
                  { translateX: leftTranslateX },
                  { translateY: leftTranslateY },
                  {
                    rotate: leftRotate.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-18deg', '18deg'],
                    }),
                  },
                  { scale: leftScale },
                ],
              }}
              disabled={!canInteract}
              entry={currentMatch.left}
              onPress={() => handleSelect('left')}
            />

            <WorldCupChoiceCard
              animatedStyle={{
                opacity: rightOpacity,
                transform: [
                  { translateX: rightTranslateX },
                  { translateY: rightTranslateY },
                  {
                    rotate: rightRotate.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-18deg', '18deg'],
                    }),
                  },
                  { scale: rightScale },
                ],
              }}
              disabled={!canInteract}
              entry={currentMatch.right}
              onPress={() => handleSelect('right')}
            />
          </View>

          <View pointerEvents="none" style={styles.versusBadge}>
            <Text style={styles.versusLabel}>VS</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    paddingTop: 12,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingLabel: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: '#5C5C5C',
  },
  errorLabel: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: '#4F4F4F',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#111111',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  metaWrap: {
    marginTop: 10,
    gap: 10,
    paddingHorizontal: 16,
  },
  metaCopy: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#7A6E67',
  },
  roundLabel: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: '#111111',
  },
  matchLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#666666',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E7E0DB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FF3B30',
  },
  retryButton: {
    minWidth: 120,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  retryButtonLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  battleWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 18,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 2,
    width: '100%',
    height: 390,
  },
  versusBadge: {
    position: 'absolute',
    alignSelf: 'center',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  versusLabel: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
});