export type SnailRaceRacer = {
  color: string;
  currentBurst: number;
  burstTicksRemaining: number;
  id: string;
  label: string;
  lateKickBias: number;
  paceBias: number;
  progress: number;
  speed: number;
};

export type SnailRaceResult = {
  color: string;
  id: string;
  label: string;
  rank: number;
};
