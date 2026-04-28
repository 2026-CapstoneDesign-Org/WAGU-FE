import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';

type DeleteAccountScreenProps = {
  onBack: () => void;
  onSubmit?: () => void;
};

export function DeleteAccountScreen({
  onBack,
  onSubmit,
}: DeleteAccountScreenProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>탈퇴하기</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.iconPlaceholder} />

          <Text style={styles.title}>WAGU 탈퇴 전 확인하세요</Text>
          <Text style={styles.description}>
            탈퇴하시면 모든 데이터는 복구가 불가능합니다.
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningItem}>• 리뷰, 프로필 등 모든 정보가 삭제됩니다.</Text>
            <Text style={styles.warningItem}>• 재가입 시에도 복구되지 않습니다.</Text>
          </View>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => setAgreed((current) => !current)}
          >
            <View style={styles.checkbox}>
              {agreed ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </View>
            <Text style={[styles.checkboxLabel, agreed && styles.checkboxLabelChecked]}>
              안내사항을 모두 확인하였으며, 이에 동의합니다.
            </Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={[
              styles.submitButton,
              agreed && styles.submitButtonEnabled,
            ]}
            disabled={!agreed}
            onPress={onSubmit}
          >
            <Text style={[styles.submitButtonLabel, agreed && styles.submitButtonLabelEnabled]}>
              탈퇴하기
            </Text>
          </Pressable>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    fontWeight: '500',
    color: '#000000',
  },
  content: {
    alignItems: 'center',
    paddingTop: 44,
  },
  iconPlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD8D8',
    backgroundColor: '#FDF1F1',
  },
  title: {
    marginTop: 25,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#000000',
    textDecorationLine: 'underline',
    textDecorationColor: '#000000',
  },
  description: {
    marginTop: 25,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#000000',
  },
  warningBox: {
    width: '100%',
    marginTop: 25,
    backgroundColor: '#F7F7F7',
    borderLeftWidth: 3,
    borderLeftColor: '#FF0000',
    paddingLeft: 9,
    paddingRight: 12,
    paddingVertical: 16,
    gap: 10,
  },
  warningItem: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#000000',
  },
  checkboxRow: {
    width: '100%',
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxMark: {
    fontSize: 13,
    lineHeight: 13,
    fontWeight: '600',
    color: '#FF0000',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#B5B5B5',
  },
  checkboxLabelChecked: {
    color: '#000000',
  },
  divider: {
    width: '100%',
    height: 1,
    marginTop: 22,
    backgroundColor: '#F5F5F5',
  },
  submitButton: {
    width: 124,
    height: 46,
    marginTop: 26,
    borderRadius: 25,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.55,
  },
  submitButtonEnabled: {
    opacity: 1,
    backgroundColor: '#FF0000',
  },
  submitButtonLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#000000',
  },
  submitButtonLabelEnabled: {
    color: '#FFFFFF',
  },
});
