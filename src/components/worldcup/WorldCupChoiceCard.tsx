import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { WorldCupEntry } from '../../types/worldCup';

type WorldCupChoiceCardProps = {
  animatedStyle: any;
  disabled?: boolean;
  entry: WorldCupEntry;
  onPress: () => void;
};

const FALLBACK_COLORS: Record<WorldCupEntry['category'], string> = {
  dessert: '#FFB5C8',
  korean: '#FF8D80',
  night: '#7C4DFF',
};

export function WorldCupChoiceCard({
  animatedStyle,
  disabled = false,
  entry,
  onPress,
}: WorldCupChoiceCardProps) {
  const accentColor = FALLBACK_COLORS[entry.category];

  return (
    <Animated.View style={[styles.cardWrap, animatedStyle]}>
      <Pressable disabled={disabled} onPress={onPress} style={styles.card}>
        {entry.imageUri ? (
          <Image source={{ uri: entry.imageUri }} resizeMode="cover" style={styles.image} />
        ) : (
          <View style={[styles.fallbackVisual, { backgroundColor: '#ECE6E2' }]}>
            <Text style={[styles.fallbackCenterTitle, { color: accentColor }]}>{entry.title}</Text>
          </View>
        )}

        <View style={styles.titleOverlay}>
          <Text numberOfLines={2} style={styles.title}>
            {entry.title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#111111',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
  },
  fallbackVisual: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackCenterTitle: {
    paddingHorizontal: 18,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  titleOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.46)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
