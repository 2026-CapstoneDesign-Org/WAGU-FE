import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WorldCupEntry } from '../../types/worldCup';

type WorldCupResultScreenProps = {
  onBackToHome: () => void;
  onRestart: () => void;
  winner: WorldCupEntry;
};

const RESULT_COLORS: Record<WorldCupEntry['category'], [string, string]> = {
  dessert: ['#FFB5C8', '#FFF0F5'],
  korean: ['#FF8D80', '#FFF3EF'],
  night: ['#7C4DFF', '#F2EDFF'],
};

export function WorldCupResultScreen({
  onBackToHome,
  onRestart,
  winner,
}: WorldCupResultScreenProps) {
  const [accentColor, backgroundColor] = RESULT_COLORS[winner.category];

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.centerWrap}>
          <View style={styles.decorRow}>
            <View style={styles.decorDot} />
            <View style={[styles.decorDot, styles.decorDotAccent]} />
            <View style={styles.decorDot} />
          </View>
          <Text style={styles.eyebrow}>WINNER</Text>
          <Text style={styles.title}>최종 우승 메뉴</Text>

          <View style={styles.card}>
            {winner.imageUri ? (
              <Image source={{ uri: winner.imageUri }} resizeMode="cover" style={styles.image} />
            ) : (
              <View style={[styles.fallbackVisual, { backgroundColor }]}>
                <View style={[styles.badge, { backgroundColor: accentColor }]}>
                  <Text style={styles.badgeLabel}>TOP 1</Text>
                </View>
                <Text style={styles.fallbackTitle}>{winner.title}</Text>
              </View>
            )}

            <View style={styles.copyWrap}>
              <Text style={styles.menuName}>{winner.title}</Text>
              {winner.subtitle ? <Text style={styles.subtitle}>{winner.subtitle}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable onPress={onRestart} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonLabel}>다시 하기</Text>
          </Pressable>
          <Pressable onPress={onBackToHome} style={styles.primaryButton}>
            <Text style={styles.primaryButtonLabel}>홈으로</Text>
          </Pressable>
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  decorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  decorDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#111111',
    opacity: 0.22,
  },
  decorDotAccent: {
    width: 10,
    height: 10,
    backgroundColor: '#FF3B30',
    opacity: 1,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: '#FF3B30',
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: '#111111',
  },
  card: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 5,
  },
  image: {
    width: '100%',
    aspectRatio: 1.14,
    backgroundColor: '#E8E8E8',
  },
  fallbackVisual: {
    width: '100%',
    aspectRatio: 1.14,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  fallbackTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: '#111111',
  },
  copyWrap: {
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
  },
  menuName: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color: '#111111',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666666',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#111111',
  },
  primaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});