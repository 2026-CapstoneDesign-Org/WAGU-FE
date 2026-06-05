import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import ArrowLeftIcon from '../../../assets/icons/arrow-left.svg';
import { AiReservationDraft, AiReservationResult } from '../../types/aiReservation';

type AiReservationResultScreenProps = {
  draft: AiReservationDraft;
  onBack: () => void;
  onGoHome: () => void;
  onRetry: () => void;
  result: AiReservationResult;
};

function StatusSymbol({ status }: { status: AiReservationResult['status'] }) {
  if (status === 'confirmed') {
    return (
      <View style={[styles.statusSymbol, styles.statusSymbolConfirmed]}>
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 12.5L9.5 17L19 7.5"
            stroke="#138A4C"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    );
  }

  if (status === 'rejected') {
    return (
      <View style={[styles.statusSymbol, styles.statusSymbolRejected]}>
        <Text style={[styles.statusSymbolText, styles.statusSymbolTextRejected]}>!</Text>
      </View>
    );
  }

  if (status === 'needs-confirmation') {
    return (
      <View style={[styles.statusSymbol, styles.statusSymbolNeedsConfirmation]}>
        <Text style={[styles.statusSymbolText, styles.statusSymbolTextNeedsConfirmation]}>?</Text>
      </View>
    );
  }

  if (status === 'canceled') {
    return (
      <View style={[styles.statusSymbol, styles.statusSymbolCanceled]}>
        <Text style={[styles.statusSymbolText, styles.statusSymbolTextCanceled]}>-</Text>
      </View>
    );
  }

  return (
    <View style={[styles.statusSymbol, styles.statusSymbolNoAnswer]}>
      <Text style={[styles.statusSymbolText, styles.statusSymbolTextNoAnswer]}>...</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getStatusAccent(status: AiReservationResult['status']) {
  if (status === 'rejected' || status === 'canceled') {
    return {
      button: '#FF0000',
    };
  }

  if (status === 'needs-confirmation') {
    return {
      button: '#D85A3A',
    };
  }

  return {
    button: status === 'confirmed' ? '#111111' : '#FF0000',
  };
}

export function AiReservationResultScreen({
  draft,
  onBack,
  onGoHome,
  result,
}: AiReservationResultScreenProps) {
  const accent = getStatusAccent(result.status);
  const isConfirmed = result.status === 'confirmed';

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon width={24} height={24} />
          </Pressable>
          <Text style={styles.headerTitle}>AI 예약 결과</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <StatusSymbol status={result.status} />

          <Text style={styles.title}>{result.title}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.restaurantName}>{draft.restaurant.name}</Text>
            <View style={styles.infoList}>
              <InfoRow label="예약 상태" value={isConfirmed ? '예약 완료' : result.title} />
              <InfoRow label="예약 날짜" value={draft.reservationDateLabel} />
              <InfoRow label="예약 시간" value={draft.reservationTimeLabel} />
              <InfoRow label="인원 수" value={`${draft.partySize}명`} />
              <InfoRow label="예약자명" value={draft.bookerName} />
              <InfoRow label="연락처" value={draft.bookerPhone} />
              {draft.restaurant.phone ? (
                <InfoRow label="매장 번호" value={draft.restaurant.phone} />
              ) : null}
            </View>
            {draft.requestNote ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>요청사항</Text>
                <Text style={styles.noteValue}>{draft.requestNote}</Text>
              </View>
            ) : null}
            {!isConfirmed && result.detail ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>통화 결과</Text>
                <Text style={styles.noteValue}>{result.detail}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.bottomBar}>
          {!isConfirmed ? (
            <Pressable
              style={[styles.primaryButton, { backgroundColor: accent.button }]}
              onPress={onGoHome}
            >
              <Text style={styles.primaryButtonLabel}>홈으로</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.secondaryButton, styles.secondaryButtonSuccess]}
              onPress={onBack}
            >
              <Text style={[styles.secondaryButtonLabel, styles.secondaryButtonLabelSuccess]}>
                확인
              </Text>
            </Pressable>
          )}
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSymbol: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  statusSymbolConfirmed: {
    backgroundColor: '#EAF8EF',
  },
  statusSymbolRejected: {
    backgroundColor: '#FFF1EF',
  },
  statusSymbolNoAnswer: {
    backgroundColor: '#FFF4E8',
  },
  statusSymbolNeedsConfirmation: {
    backgroundColor: '#FFF4E8',
  },
  statusSymbolCanceled: {
    backgroundColor: '#F4F4F4',
  },
  statusSymbolText: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
  },
  statusSymbolTextRejected: {
    color: '#FF0000',
  },
  statusSymbolTextNoAnswer: {
    color: '#D85A3A',
  },
  statusSymbolTextNeedsConfirmation: {
    color: '#D85A3A',
  },
  statusSymbolTextCanceled: {
    color: '#666666',
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    marginTop: 24,
    borderRadius: 24,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  restaurantName: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: '#111111',
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'right',
  },
  noteBox: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  noteLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#666666',
  },
  noteValue: {
    fontSize: 14,
    lineHeight: 21,
    color: '#222222',
  },
  bottomBar: {
    paddingTop: 12,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonSuccess: {
    backgroundColor: '#111111',
  },
  secondaryButtonLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  secondaryButtonLabelSuccess: {
    color: '#FFFFFF',
  },
});