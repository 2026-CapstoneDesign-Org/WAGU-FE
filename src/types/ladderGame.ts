export type LadderGameSetup = {
  outcomes: string[];
  players: string[];
};

export type LadderBridge = {
  fromColumn: number;
  row: number;
};

export type LadderGameData = {
  bridges: LadderBridge[];
  outcomes: string[];
  players: string[];
  rowCount: number;
};

export type LadderPoint = {
  x: number;
  y: number;
};
