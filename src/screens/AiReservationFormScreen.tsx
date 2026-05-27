import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import {
  AiReservationDraft,
  AiReservationMockMode,
  AiReservationRestaurantInfo,
} from '../types/aiReservation';

type AiReservationFormScreenProps = {
  initialBookerPhone?: string;
  initialDraft?: AiReservationDraft | null;
  mockMode?: AiReservationMockMode;
  onBack: () => void;
  onChangeMockMode?: (mode: AiReservationMockMode) => void;
  onSubmit: (draft: AiReservationDraft) => void;
  restaurant: AiReservationRestaurantInfo;
};

type DateOption = {
  label: string;
  value: string;
};

const MINUTE_OPTIONS = [0, 10, 20, 30, 40, 50];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MOCK_MODE_OPTIONS: Array<{ label: string; value: AiReservationMockMode }> = [
  { label: '자동', value: 'auto' },
  { label: '성공', value: 'confirmed' },
  { label: '실패', value: 'rejected' },
  { label: '연결 실패', value: 'no-answer' },
];

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatTimeLabel(hour24: number, minute: number) {
  const meridiem = hour24 >= 12 ? '오후' : '오전';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${meridiem} ${hour12}시 ${String(minute).padStart(2, '0')}분`;
}

function buildInitialTime() {
  const now = new Date();
  const initial = new Date(now.getTime() + 60 * 60 * 1000);
  initial.setMinutes(Math.ceil(initial.getMinutes() / 10) * 10, 0, 0);

  if (initial.getMinutes() === 60) {
    initial.setHours(initial.getHours() + 1);
    initial.setMinutes(0, 0, 0);
  }

  return {
    hour24: initial.getHours(),
    minute: initial.getMinutes(),
  } as const;
}

function buildDateOptions() {
  const today = new Date();
  const options: DateOption[] = [];

  for (let offset = 0; offset < 14; offset += 1) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + offset);

    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const date = String(nextDate.getDate()).padStart(2, '0');
    const weekday = WEEKDAY_LABELS[nextDate.getDay()];
    const relativeLabel = offset === 0 ? '오늘' : offset === 1 ? '내일' : '';

    options.push({
      label: `${month}월 ${date}일 (${weekday})${relativeLabel ? ` · ${relativeLabel}` : ''}`,
      value: `${year}-${month}-${date}`,
    });
  }

  return options;
}

export function AiReservationFormScreen({
  initialBookerPhone = '',
  initialDraft,
  mockMode = 'auto',
  onBack,
  onChangeMockMode,
  onSubmit,
  restaurant,
}: AiReservationFormScreenProps) {
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const defaultTime = useMemo(() => buildInitialTime(), []);

  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    initialDraft?.reservationDate ?? dateOptions[0]?.value ?? '',
  );
  const [hour24, setHour24] = useState(initialDraft?.hour24 ?? defaultTime.hour24);
  const [minute, setMinute] = useState(initialDraft?.minute ?? defaultTime.minute);
  const [bookerName, setBookerName] = useState(initialDraft?.bookerName ?? '');
  const [bookerPhone, setBookerPhone] = useState(
    initialDraft?.bookerPhone ?? formatPhoneNumber(initialBookerPhone),
  );
  const [partySize, setPartySize] = useState(initialDraft?.partySize ?? 2);

  const selectedDateOption =
    dateOptions.find((option) => option.value === selectedDate) ?? dateOptions[0];
  const reservationTimeLabel = formatTimeLabel(hour24, minute);
  const reservationTime = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const phoneDigits = bookerPhone.replace(/\D/g, '');
  const canSubmit =
    Boolean(selectedDateOption?.value) &&
    bookerName.trim().length > 0 &&
    phoneDigits.length >= 10 &&
    partySize > 0;

  const handleSubmit = () => {
    if (!selectedDateOption || !canSubmit) {
      return;
    }

    onSubmit({
      bookerName: bookerName.trim(),
      bookerPhone,
      hour24,
      minute,
      partySize,
      requestNote: initialDraft?.requestNote,
      reservationDate: selectedDateOption.value,
      reservationDateLabel: selectedDateOption.label,
      reservationTime,
      reservationTimeLabel,
      restaurant,
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>AI 예약</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>AI 전화 예약</Text>
            <Text style={styles.heroDescription}>
              예약 정보를 남기면 AI가 매장에 대신 전화해드려요
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>예약 정보</Text>

            <Pressable
              style={styles.selectorField}
              onPress={() => setIsDateModalVisible(true)}
            >
              <View style={styles.selectorCopy}>
                <Text style={styles.fieldLabel}>예약 날짜</Text>
                <Text style={styles.selectorValue}>{selectedDateOption?.label}</Text>
              </View>
              <Text style={styles.selectorAction}>변경</Text>
            </Pressable>

            <Pressable
              style={styles.selectorField}
              onPress={() => setIsTimeModalVisible(true)}
            >
              <View style={styles.selectorCopy}>
                <Text style={styles.fieldLabel}>예약 시간</Text>
                <Text style={styles.selectorValue}>{reservationTimeLabel}</Text>
              </View>
              <Text style={styles.selectorAction}>변경</Text>
            </Pressable>

            <View style={styles.inputField}>
              <Text style={styles.fieldLabel}>예약자명</Text>
              <TextInput
                value={bookerName}
                onChangeText={setBookerName}
                placeholder="예약자 이름을 입력해 주세요"
                placeholderTextColor="#AAAAAA"
                style={styles.input}
              />
            </View>

            <View style={styles.inputField}>
              <Text style={styles.fieldLabel}>전화번호</Text>
              <TextInput
                value={bookerPhone}
                onChangeText={(text) => setBookerPhone(formatPhoneNumber(text))}
                placeholder="010-0000-0000"
                placeholderTextColor="#AAAAAA"
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.partyField}>
              <Text style={styles.fieldLabel}>인원 수</Text>
              <View style={styles.partyStepper}>
                <Pressable
                  style={styles.partyButton}
                  onPress={() => setPartySize((current) => Math.max(1, current - 1))}
                >
                  <Text style={styles.partyButtonLabel}>-</Text>
                </Pressable>
                <Text style={styles.partyCount}>{partySize}명</Text>
                <Pressable
                  style={styles.partyButton}
                  onPress={() => setPartySize((current) => Math.min(12, current + 1))}
                >
                  <Text style={styles.partyButtonLabel}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {__DEV__ ? (
            <View style={styles.devSection}>
              <Text style={styles.devTitle}>개발용 결과 선택</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.devChipRow}>
                  {MOCK_MODE_OPTIONS.map((option) => {
                    const isActive = option.value === mockMode;

                    return (
                      <Pressable
                        key={option.value}
                        style={[styles.devChip, isActive && styles.devChipActive]}
                        onPress={() => onChangeMockMode?.(option.value)}
                      >
                        <Text style={[styles.devChipLabel, isActive && styles.devChipLabelActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>안내</Text>
            <Text style={styles.noticeItem}>
              입력한 정보를 바탕으로 AI가 매장에 자동으로 전화해 예약 가능 여부를 확인해요.
            </Text>
            <Text style={styles.noticeItem}>
              매장 상황에 따라 예약이 확정되지 않을 수 있고, 결과는 통화 후 바로 알려드릴게요.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            disabled={!canSubmit}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonLabel}>AI에게 예약 맡기기</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={isDateModalVisible}
        onRequestClose={() => setIsDateModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsDateModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>예약 날짜 선택</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetList}
            >
              {dateOptions.map((option) => {
                const isActive = option.value === selectedDate;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.sheetOption, isActive && styles.sheetOptionActive]}
                    onPress={() => {
                      setSelectedDate(option.value);
                      setIsDateModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.sheetOptionLabel,
                        isActive && styles.sheetOptionLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={isTimeModalVisible}
        onRequestClose={() => setIsTimeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsTimeModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>예약 시간 선택</Text>

            <View style={styles.timeSection}>
              <Text style={styles.timeSectionTitle}>시</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {HOUR_OPTIONS.map((option) => {
                    const isActive = option === hour24;
                    return (
                      <Pressable
                        key={option}
                        style={[styles.valueChip, isActive && styles.valueChipActive]}
                        onPress={() => setHour24(option)}
                      >
                        <Text
                          style={[
                            styles.valueChipLabel,
                            isActive && styles.valueChipLabelActive,
                          ]}
                        >
                          {option}시
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.timeSection}>
              <Text style={styles.timeSectionTitle}>분</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {MINUTE_OPTIONS.map((option) => {
                    const isActive = option === minute;
                    return (
                      <Pressable
                        key={option}
                        style={[styles.valueChip, isActive && styles.valueChipActive]}
                        onPress={() => setMinute(option)}
                      >
                        <Text
                          style={[
                            styles.valueChipLabel,
                            isActive && styles.valueChipLabelActive,
                          ]}
                        >
                          {String(option).padStart(2, '0')}분
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <Pressable
              style={styles.sheetConfirmButton}
              onPress={() => setIsTimeModalVisible(false)}
            >
              <Text style={styles.sheetConfirmButtonLabel}>확인</Text>
            </Pressable>
          </Pressable>
        </Pressable>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
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
    color: '#111111',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 18,
  },
  heroCard: {
    borderRadius: 26,
    backgroundColor: '#FFF5F3',
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 8,
  },
  heroEyebrow: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FF3B30',
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: '#555555',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111111',
  },
  selectorField: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectorCopy: {
    flex: 1,
    gap: 5,
  },
  fieldLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  selectorValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#111111',
  },
  selectorAction: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FF3B30',
  },
  inputField: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#111111',
    paddingVertical: 0,
  },
  partyField: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  partyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyButtonLabel: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '600',
    color: '#111111',
  },
  partyCount: {
    minWidth: 54,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  noticeBox: {
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  noticeTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#111111',
  },
  noticeItem: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    color: '#666666',
  },
  devSection: {
    gap: 10,
  },
  devTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#111111',
  },
  devChipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  devChip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devChipActive: {
    borderColor: '#FFBDB8',
    backgroundColor: '#FFF1EF',
  },
  devChipLabel: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: '#555555',
  },
  devChipLabelActive: {
    color: '#FF3B30',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.35,
  },
  submitButtonLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 17, 17, 0.24)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '72%',
  },
  sheetTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
  },
  sheetList: {
    gap: 10,
  },
  sheetOption: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  sheetOptionActive: {
    borderColor: '#FFBDB8',
    backgroundColor: '#FFF1EF',
  },
  sheetOptionLabel: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: '#333333',
  },
  sheetOptionLabelActive: {
    color: '#FF3B30',
    fontWeight: '700',
  },
  timeSection: {
    gap: 10,
    marginBottom: 18,
  },
  timeSectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#444444',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  valueChip: {
    minWidth: 72,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueChipActive: {
    borderColor: '#FFBDB8',
    backgroundColor: '#FFF1EF',
  },
  valueChipLabel: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: '#444444',
  },
  valueChipLabelActive: {
    color: '#FF3B30',
  },
  sheetConfirmButton: {
    marginTop: 6,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetConfirmButtonLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
