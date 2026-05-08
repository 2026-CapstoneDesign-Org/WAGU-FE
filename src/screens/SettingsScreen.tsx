import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import ArrowRightIcon from '../../assets/icons/arrow-right.svg';

type SettingsScreenProps = {
  onBack: () => void;
  onLogout?: () => void;
  onOpenDeleteAccount?: () => void;
  onOpenMyInfo?: () => void;
};

type SettingRowProps = {
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

function SettingRow({ label, onPress, right }: SettingRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      {right ?? <ArrowRightIcon width={24} height={24} />}
    </Pressable>
  );
}

function NotificationToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      speed: 20,
      bounciness: 0,
    }).start();
  }, [progress, value]);

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D9D9D9', '#FFB3AE'],
  });

  const thumbTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 19],
  });

  return (
    <Pressable style={styles.togglePressable} onPress={() => onChange(!value)}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              transform: [{ translateX: thumbTranslateX }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

export function SettingsScreen({
  onBack,
  onLogout,
  onOpenDeleteAccount,
  onOpenMyInfo,
}: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>설정</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>일반</Text>
            <View style={styles.sectionRows}>
              <SettingRow label="내 정보" onPress={onOpenMyInfo} />
              <SettingRow
                label="알림 설정"
                right={
                  <NotificationToggle
                    value={notificationsEnabled}
                    onChange={setNotificationsEnabled}
                  />
                }
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>고객센터</Text>
            <View style={styles.sectionRows}>
              <SettingRow label="공지사항" />
              <SettingRow label="1:1 문의하기" />
              <SettingRow label="약관 및 정책" />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계정</Text>
            <View style={styles.sectionRows}>
              <SettingRow label="로그아웃" onPress={onLogout} />
              <SettingRow label="회원탈퇴" onPress={onOpenDeleteAccount} />
            </View>
          </View>
        </ScrollView>
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
    paddingTop: 40,
    paddingBottom: 36,
    gap: 30,
  },
  section: {
    gap: 15,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
    color: '#999999',
  },
  sectionRows: {
    gap: 25,
  },
  row: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    color: '#000000',
  },
  divider: {
    width: '100%',
    height: 5,
    backgroundColor: '#F5F5F5',
  },
  togglePressable: {
    width: 35,
    height: 20,
    justifyContent: 'center',
  },
  toggleTrack: {
    width: 35,
    height: 20,
    borderRadius: 999,
    justifyContent: 'center',
  },
  toggleThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
});
