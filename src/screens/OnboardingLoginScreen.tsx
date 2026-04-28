import { StyleSheet, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SocialLoginButton } from '../components/SocialLoginButton';

const KAKAO_ICON_URI =
  'https://www.figma.com/api/mcp/asset/3e07fc75-e90f-457a-94b1-e73929b76494';
const GOOGLE_ICON_URI =
  'https://www.figma.com/api/mcp/asset/412dc6d7-a8ef-4265-8179-1c7e21c3e851';

const socialOptions = [
  { id: 'kakao', label: '카카오 로그인', iconUri: KAKAO_ICON_URI },
  { id: 'google', label: '구글 로그인', iconUri: GOOGLE_ICON_URI },
  { id: 'naver', label: '네이버 로그인', iconUri: KAKAO_ICON_URI },
] as const;

type LoginProvider = (typeof socialOptions)[number]['id'];

type OnboardingLoginScreenProps = {
  onSelectLogin: (provider: LoginProvider) => void;
};

export function OnboardingLoginScreen({ onSelectLogin }: OnboardingLoginScreenProps) {
  return (
    <Screen scrollable={false} contentContainerStyle={styles.container}>
      <View style={styles.heroCircle} />

      <View style={styles.buttonGroup}>
        {socialOptions.map((option) => (
          <SocialLoginButton
            key={option.id}
            iconUri={option.iconUri}
            label={option.label}
            onPress={() => onSelectLogin(option.id)}
          />
        ))}
      </View>
    </Screen>
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
});
