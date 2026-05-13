import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';

const WAGU_HERO_IMAGE = require('../../assets/WAGU.png');

const socialOptions = [
  {
    id: 'kakao',
    label: '카카오로 로그인',
    buttonBackgroundColor: '#FEE500',
    buttonBorderColor: '#FEE500',
    iconBackgroundColor: 'transparent',
    iconLabel: '톡',
    iconTextColor: '#191600',
    iconVariant: 'plain',
    labelColor: '#191600',
  },
  {
    id: 'google',
    label: '구글로 로그인',
    buttonBackgroundColor: '#FFFFFF',
    buttonBorderColor: '#DDDDDD',
    iconBackgroundColor: 'transparent',
    iconLabel: 'G',
    iconTextColor: '#4285F4',
    iconVariant: 'plain',
    labelColor: '#2A2A2A',
  },
  {
    id: 'naver',
    label: '네이버로 로그인',
    buttonBackgroundColor: '#03C75A',
    buttonBorderColor: '#03C75A',
    iconBackgroundColor: 'transparent',
    iconLabel: 'N',
    iconTextColor: '#FFFFFF',
    iconVariant: 'plain',
    labelColor: '#FFFFFF',
  },
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

export function OnboardingLoginScreen({
  onLoginSuccess,
}: OnboardingLoginScreenProps) {
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
        <View style={styles.heroSection}>
          <Image
            source={WAGU_HERO_IMAGE}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <Text style={styles.headline}>환영합니다</Text>
          <Text style={styles.subtitle}>간편하게 로그인하고 시작하세요</Text>
        </View>

        <View style={styles.buttonGroup}>
          {socialOptions.map((option) => (
            <SocialLoginButton
              key={option.id}
              buttonBackgroundColor={option.buttonBackgroundColor}
              buttonBorderColor={option.buttonBorderColor}
              iconBackgroundColor={option.iconBackgroundColor}
              iconLabel={option.iconLabel}
              iconTextColor={option.iconTextColor}
              iconVariant={option.iconVariant}
              label={option.label}
              labelColor={option.labelColor}
              onPress={() => openLoginModal(option.id)}
            />
          ))}
        </View>

        <Text style={styles.loginFooterText}>
          로그인하면 WAGU의 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </Text>
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
                        '로그인 페이지에 연결하지 못했어요. 네트워크 상태를 확인해 주세요.',
                    );
                  }}
                  onHttpError={(event) => {
                    setIsLoadingWebView(false);
                    setLoginError(
                      `로그인 서버 응답 오류 (${event.nativeEvent.statusCode})`,
                    );
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
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingLabel}>
                      로그인 페이지를 불러오는 중이에요.
                    </Text>
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
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 32,
  },
  heroSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 144,
    height: 144,
  },
  headline: {
    marginTop: 34,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '800',
    color: '#2D2D2D',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#8A8A8A',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 36,
    gap: 14,
  },
  loginFooterText: {
    marginTop: 20,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    color: '#A0A0A0',
    textAlign: 'center',
    paddingHorizontal: 6,
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.text,
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
  loadingLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.text,
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
    color: colors.text,
    textAlign: 'center',
  },
  errorDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 22,
    minWidth: 140,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
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
