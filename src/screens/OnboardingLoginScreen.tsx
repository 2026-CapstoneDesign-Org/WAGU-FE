import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import { extractAuthTokens, getOAuthAuthorizationUrl } from '../api/wagu';
import { Screen } from '../components/Screen';
import { SocialLoginButton } from '../components/SocialLoginButton';

const KAKAO_ICON_URI =
  'https://www.figma.com/api/mcp/asset/3e07fc75-e90f-457a-94b1-e73929b76494';
const GOOGLE_ICON_URI =
  'https://www.figma.com/api/mcp/asset/412dc6d7-a8ef-4265-8179-1c7e21c3e851';
const NAVER_ICON_URI =
  'https://www.figma.com/api/mcp/asset/3e07fc75-e90f-457a-94b1-e73929b76494';

const socialOptions = [
  { id: 'kakao', label: '카카오 로그인', iconUri: KAKAO_ICON_URI },
  { id: 'google', label: '구글 로그인', iconUri: GOOGLE_ICON_URI },
  { id: 'naver', label: '네이버 로그인', iconUri: NAVER_ICON_URI },
] as const;

type LoginProvider = (typeof socialOptions)[number]['id'];

type OnboardingLoginScreenProps = {
  onLoginSuccess: (
    provider: LoginProvider,
    session: {
      accessToken: string;
      needsProfile?: boolean | null;
      refreshToken: string | null;
    },
  ) => void;
};

export function OnboardingLoginScreen({ onLoginSuccess }: OnboardingLoginScreenProps) {
  const [activeProvider, setActiveProvider] = useState<LoginProvider | null>(null);
  const [isLoadingWebView, setIsLoadingWebView] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);

  const closeLoginModal = () => {
    setActiveProvider(null);
    setIsLoadingWebView(false);
    setLoginError(null);
  };

  const openLoginModal = (provider: LoginProvider) => {
    setIsLoadingWebView(true);
    setLoginError(null);
    setWebViewKey((current) => current + 1);
    setActiveProvider(provider);
  };

  const retryLogin = () => {
    setIsLoadingWebView(true);
    setLoginError(null);
    setWebViewKey((current) => current + 1);
  };

  return (
    <>
      <Screen scrollable={false} contentContainerStyle={styles.container}>
        <View style={styles.heroCircle} />

        <View style={styles.buttonGroup}>
          {socialOptions.map((option) => (
            <SocialLoginButton
              key={option.id}
              iconUri={option.iconUri}
              label={option.label}
              onPress={() => openLoginModal(option.id)}
            />
          ))}
        </View>
      </Screen>

      <Modal
        animationType="slide"
        visible={activeProvider !== null}
        onRequestClose={closeLoginModal}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.backButton} onPress={closeLoginModal}>
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
            <Text style={styles.modalTitle}>소셜 로그인</Text>
          </View>

          {activeProvider ? (
            loginError ? (
              <View style={styles.errorState}>
                <Text style={styles.errorTitle}>로그인 페이지를 열지 못했어요</Text>
                <Text style={styles.errorDescription}>{loginError}</Text>
                <Pressable style={styles.retryButton} onPress={retryLogin}>
                  <Text style={styles.retryButtonLabel}>다시 시도</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.webViewContainer}>
                <WebView
                  key={webViewKey}
                  source={{ uri: getOAuthAuthorizationUrl(activeProvider) }}
                  onLoadStart={() => setIsLoadingWebView(true)}
                  onLoadEnd={() => setIsLoadingWebView(false)}
                  onError={(event) => {
                    setIsLoadingWebView(false);
                    setLoginError(
                      event.nativeEvent.description ||
                        '외부 로그인 페이지에 연결하지 못했어요. 네트워크 상태를 확인해 주세요.',
                    );
                  }}
                  onHttpError={(event) => {
                    setIsLoadingWebView(false);
                    setLoginError(`로그인 서버 응답 오류 (${event.nativeEvent.statusCode})`);
                  }}
                  onNavigationStateChange={(event) => {
                    const tokens = extractAuthTokens(event.url);

                    if (!tokens) {
                      return;
                    }

                    closeLoginModal();
                    onLoginSuccess(activeProvider, {
                      accessToken: tokens.accessToken,
                      needsProfile: tokens.needsProfile,
                      refreshToken: tokens.refreshToken ?? null,
                    });
                  }}
                />

                {isLoadingWebView ? (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FF3B30" />
                    <Text style={styles.loadingLabel}>로그인 페이지를 불러오는 중이에요.</Text>
                  </View>
                ) : null}
              </View>
            )
          ) : null}
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 154,
    paddingBottom: 34,
    paddingHorizontal: 16,
  },
  heroCircle: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#D9D9D9',
    marginBottom: 149,
  },
  buttonGroup: {
    width: '100%',
    gap: 15,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
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
  modalTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: '#000000',
  },
  webViewContainer: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: 14,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF',
  },
  loadingLabel: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  errorDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 22,
    minWidth: 140,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF3B30',
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
});
