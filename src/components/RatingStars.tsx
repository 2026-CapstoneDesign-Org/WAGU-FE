import { Pressable, StyleSheet, Text, View } from 'react-native';

type RatingStarsProps = {
  value: number;
  onChange: (value: number) => void;
};

export function RatingStars({ value, onChange }: RatingStarsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }, (_, index) => {
        const starNumber = index + 1;
        const fillRatio = Math.max(0, Math.min(1, value - index));

        return (
          <View key={starNumber} style={styles.starSlot}>
            <View style={styles.starLayer}>
              <Text style={styles.starBase}>★</Text>
            </View>
            <View style={[styles.fillClip, { width: `${fillRatio * 100}%` }]}>
              <View style={styles.starLayer}>
                <Text style={styles.starFill}>★</Text>
              </View>
            </View>
            <Pressable
              onPress={() => onChange(index + 0.5)}
              style={styles.leftTapZone}
            />
            <Pressable
              onPress={() => onChange(index + 1)}
              style={styles.rightTapZone}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    width: '100%',
    overflow: 'visible',
  },
  starSlot: {
    width: 36,
    height: 42,
    position: 'relative',
    overflow: 'visible',
  },
  starLayer: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBase: {
    fontSize: 42,
    lineHeight: 46,
    color: '#D9D9D9',
    includeFontPadding: false,
  },
  fillClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  starFill: {
    fontSize: 42,
    lineHeight: 46,
    color: '#FFC107',
    includeFontPadding: false,
  },
  leftTapZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  rightTapZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
});
