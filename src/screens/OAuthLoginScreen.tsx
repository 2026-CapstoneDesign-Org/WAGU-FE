import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { AuthProvider, extractAuthTokens, getOAuthAuthorizationUrl } from '../api/wagu';

type OAuthLoginScreenProps = {
  onBack: () => void;
  onLoginSuccess: (session: { accessToken: string; refreshToken: string | null }) => void;
  provider: AuthProvider;
};

export function OAuthLoginScreen({
  onBack,
  onLoginSuccess,
  provider,
}: OAuthLoginScreenProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeftIcon width={24} height={24} />
        </Pressable>
        <Text style={styles.headerTitle}>로그인</Text>
      </View>

      <WebView
        source={{ uri: getOAuthAuthorizationUrl(provider) }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color="#FF3B30" />
            <Text style={styles.loadingLabel}>로그인 페이지를 불러오는 중이에요.</Text>
          </View>
        )}
        onNavigationStateChange={(event) => {
          const tokens = extractAuthTokens(event.url);

          if (!tokens) {
            return;
          }

          onLoginSuccess({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken ?? null,
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  loadingLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#666666',
  },
});
