export type AiReservationRestaurantInfo = {
  address?: string;
  category?: string;
  id: number;
  name: string;
  phone?: string;
};

export type AiReservationDraft = {
  bookerName: string;
  bookerPhone: string;
  hour24: number;
  minute: number;
  partySize: number;
  requestNote?: string;
  reservationDate: string;
  reservationDateLabel: string;
  reservationTime: string;
  reservationTimeLabel: string;
  restaurant: AiReservationRestaurantInfo;
};

export type AiReservationStatus = 'confirmed' | 'rejected' | 'no-answer';
export type AiReservationLiveStatus =
  | AiReservationStatus
  | 'canceled'
  | 'needs-confirmation';

export type AiReservationResult = {
  detail?: string;
  status: AiReservationLiveStatus;
  summary: string;
  title: string;
};
