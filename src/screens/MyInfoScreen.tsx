import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  InteractionManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import ArrowRightIcon from '../../assets/icons/arrow-right.svg';
import CameraIcon from '../../assets/icons/camera.svg';

export type LoginProvider = 'kakao' | 'naver' | 'google';

type ProfileImageSelection = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

type MyInfoScreenProps = {
  onBack: () => void;
  onOpenEditNickname?: () => void;
  onUpdateProfileImage?: (selection: ProfileImageSelection) => Promise<string | null>;
  loginProvider?: LoginProvider;
  profileImageUrl?: string | null;
  genderLabel?: string | null;
  birthDateLabel?: string | null;
  nickname?: string;
};

function InfoRow({
  label,
  value,
  right,
}: {
  label: string;
  value: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        {typeof value === 'string' ? <Text style={styles.infoValue}>{value}</Text> : value}
      </View>
      {right}
    </View>
  );
}

function LoginMethodValue({ provider }: { provider: LoginProvider }) {
  if (provider === 'naver') {
    return (
      <View style={styles.loginMethodRow}>
        <View style={[styles.loginBadge, styles.naverBadge]}>
          <Text style={[styles.loginBadgeLabel, styles.naverBadgeLabel]}>N</Text>
        </View>
        <Text style={styles.loginMethodText}>네이버</Text>
      </View>
    );
  }

  if (provider === 'google') {
    return (
      <View style={styles.loginMethodRow}>
        <View style={[styles.loginBadge, styles.googleBadge]}>
          <Text style={[styles.loginBadgeLabel, styles.googleBadgeLabel]}>G</Text>
        </View>
        <Text style={styles.loginMethodText}>구글</Text>
      </View>
    );
  }

  return (
    <View style={styles.loginMethodRow}>
      <View style={[styles.loginBadge, styles.kakaoBadge]}>
        <Text style={[styles.loginBadgeLabel, styles.kakaoBadgeLabel]}>K</Text>
      </View>
      <Text style={styles.loginMethodText}>카카오</Text>
    </View>
  );
}

export function MyInfoScreen({
  onBack,
  onOpenEditNickname,
  onUpdateProfileImage,
  loginProvider = 'kakao',
  profileImageUrl,
  genderLabel,
  birthDateLabel,
  nickname = '먹부림',
}: MyInfoScreenProps) {
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const sheetProgress = useRef(new Animated.Value(0)).current;
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
    };
  }, []);

  const openProfileSheet = () => {
    setIsSheetVisible(true);
    Animated.timing(sheetProgress, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const closeProfileSheet = (afterClose?: () => void) => {
    Animated.timing(sheetProgress, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setIsSheetVisible(false);
      afterClose?.();
    });
  };

  const runAfterSheetClose = (fn: () => void) => {
    closeProfileSheet(() => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }

      InteractionManager.runAfterInteractions(() => {
        actionTimeoutRef.current = setTimeout(() => {
          fn();
          actionTimeoutRef.current = null;
        }, 40);
      });
    });
  };

  const handleOpenGallery = async () => {
    if (isUploadingProfileImage) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한 필요', '갤러리에서 사진을 선택하려면 사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const asset = result.assets[0];
      const previousImageUri = profileImageUri;

      setProfileImageUri(asset.uri);

      if (!onUpdateProfileImage) {
        return;
      }

      try {
        setIsUploadingProfileImage(true);
        const uploadedImageUrl = await onUpdateProfileImage({
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          uri: asset.uri,
        });
        setProfileImageUri(uploadedImageUrl ?? asset.uri);
      } catch (error) {
        setProfileImageUri(previousImageUri);
        Alert.alert(
          '업로드 실패',
          error instanceof Error && error.message
            ? error.message
            : '프로필 사진을 업로드하지 못했어요.',
        );
      } finally {
        setIsUploadingProfileImage(false);
      }
    }
  };

  const handleOpenCamera = async () => {
    if (isUploadingProfileImage) {
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const asset = result.assets[0];
      const previousImageUri = profileImageUri;

      setProfileImageUri(asset.uri);

      if (!onUpdateProfileImage) {
        return;
      }

      try {
        setIsUploadingProfileImage(true);
        const uploadedImageUrl = await onUpdateProfileImage({
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          uri: asset.uri,
        });
        setProfileImageUri(uploadedImageUrl ?? asset.uri);
      } catch (error) {
        setProfileImageUri(previousImageUri);
        Alert.alert(
          '업로드 실패',
          error instanceof Error && error.message
            ? error.message
            : '프로필 사진을 업로드하지 못했어요.',
        );
      } finally {
        setIsUploadingProfileImage(false);
      }
    }
  };

  const backdropOpacity = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sheetTranslateY = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [280, 0],
  });

  const displayProfileImageUri = profileImageUri ?? profileImageUrl ?? null;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>내 정보</Text>
        </View>

        <View style={styles.profileSection}>
          <Pressable style={styles.profileBox} onPress={openProfileSheet}>
            {displayProfileImageUri ? (
              <Image source={{ uri: displayProfileImageUri }} style={styles.profileImage} />
            ) : null}
            <View style={styles.cameraButton}>
              <CameraIcon width={18} height={18} />
            </View>
          </Pressable>
        </View>

        <View style={styles.infoSection}>
          <Pressable onPress={onOpenEditNickname}>
            <InfoRow
              label="닉네임"
              value={nickname}
              right={<ArrowRightIcon width={24} height={24} />}
            />
          </Pressable>

          <InfoRow
            label="로그인 방식"
            value={<LoginMethodValue provider={loginProvider} />}
          />
          <InfoRow label="전화번호" value="010-1234-5678" />
          <InfoRow label="성별" value={genderLabel ?? '여성'} />
          <InfoRow label="생일" value={birthDateLabel ?? '2002년 6월 1일'} />
        </View>
      </View>

      <Modal
        transparent
        visible={isSheetVisible}
        animationType="none"
        onRequestClose={() => closeProfileSheet()}
      >
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeProfileSheet()} />

          <Animated.View
            style={[
              styles.sheetWrap,
              {
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.sheetGroup}>
              <Text style={styles.sheetTitle}>프로필 사진 설정</Text>

              <Pressable
                style={styles.sheetAction}
                onPress={() => runAfterSheetClose(() => void handleOpenGallery())}
              >
                <Text style={styles.sheetActionLabel}>앨범에서 사진 선택</Text>
              </Pressable>

              <View style={styles.sheetDivider} />

              <Pressable
                style={styles.sheetAction}
                onPress={() => runAfterSheetClose(() => void handleOpenCamera())}
              >
                <Text style={styles.sheetActionLabel}>사진 촬영</Text>
              </Pressable>

              {profileImageUri ? (
                <>
                  <View style={styles.sheetDivider} />
                  <Pressable
                    style={styles.sheetAction}
                    onPress={() => runAfterSheetClose(() => setProfileImageUri(null))}
                  >
                    <Text style={styles.sheetActionLabel}>기본 프로필로 변경</Text>
                  </Pressable>
                </>
              ) : null}
            </View>

            <Pressable style={styles.cancelButton} onPress={() => closeProfileSheet()}>
              <Text style={styles.cancelButtonLabel}>취소</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
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
  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  profileBox: {
    width: 100,
    height: 100,
    borderRadius: 6,
    overflow: 'visible',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  cameraButton: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    paddingTop: 1,
    gap: 10,
  },
  infoRow: {
    width: '100%',
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  infoCopy: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: '#999999',
  },
  infoValue: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#000000',
  },
  loginMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoBadge: {
    backgroundColor: '#FFE500',
  },
  naverBadge: {
    backgroundColor: '#03C75A',
  },
  googleBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  loginBadgeLabel: {
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '700',
  },
  kakaoBadgeLabel: {
    color: '#0A0A0A',
  },
  naverBadgeLabel: {
    color: '#FFFFFF',
  },
  googleBadgeLabel: {
    color: '#4285F4',
  },
  loginMethodText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#000000',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
  },
  sheetWrap: {
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  sheetGroup: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  sheetTitle: {
    paddingTop: 18,
    paddingBottom: 14,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#7D7D7D',
    textAlign: 'center',
  },
  sheetAction: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheetActionLabel: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    color: '#000000',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#EFEFEF',
  },
  cancelButton: {
    marginTop: 8,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonLabel: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#000000',
  },
});
