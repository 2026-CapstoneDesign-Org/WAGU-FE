import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ScreenProps = PropsWithChildren<{
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
}>;

export function Screen({
  children,
  contentContainerStyle,
  scrollable = true,
}: ScreenProps) {
  const content = <View style={[styles.content, contentContainerStyle]}>{children}</View>;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.layout,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
