export type AiReservationRestaurantInfo = {
  address?: string;
  category?: string;
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
export type AiReservationMockMode = 'auto' | AiReservationStatus;

export type AiReservationResult = {
  detail?: string;
  status: AiReservationStatus;
  summary: string;
  title: string;
};
