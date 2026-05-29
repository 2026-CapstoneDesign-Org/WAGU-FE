import { LadderBridge, LadderGameData, LadderGameSetup, LadderPoint } from '../types/ladderGame';

export const LADDER_MIN_ITEMS = 2;
export const LADDER_MAX_ITEMS = 8;

function clampItemCount(count: number) {
  return Math.max(LADDER_MIN_ITEMS, Math.min(LADDER_MAX_ITEMS, count));
}

function buildRowCount(columnCount: number) {
  return Math.max(8, columnCount * 2 + 2);
}

function generateBridges(columnCount: number, rowCount: number) {
  const bridges: LadderBridge[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    let previousLinkedColumn = -2;

    for (let column = 0; column < columnCount - 1; column += 1) {
      if (column === previousLinkedColumn + 1) {
        continue;
      }

      if (Math.random() < 0.42) {
        bridges.push({ fromColumn: column, row });
        previousLinkedColumn = column;
      }
    }
  }

  if (bridges.length === 0 && columnCount > 1) {
    bridges.push({
      fromColumn: Math.floor(Math.random() * (columnCount - 1)),
      row: Math.floor(Math.random() * rowCount),
    });
  }

  return bridges;
}

export function buildLadderSetup(playerCount: number): LadderGameSetup {
  const count = clampItemCount(playerCount);

  return {
    outcomes: Array.from({ length: count }, () => ''),
    players: Array.from({ length: count }, (_, index) => String(index + 1)),
  };
}

export function buildLadderGame(setup: LadderGameSetup): LadderGameData {
  const columnCount = clampItemCount(setup.players.length);
  const rowCount = buildRowCount(columnCount);

  return {
    bridges: generateBridges(columnCount, rowCount),
    outcomes: setup.outcomes.slice(0, columnCount),
    players: setup.players.slice(0, columnCount),
    rowCount,
  };
}

export function getLadderOutcomeIndex(game: LadderGameData, startColumn: number) {
  let currentColumn = startColumn;

  for (let row = 0; row < game.rowCount; row += 1) {
    const forwardBridge = game.bridges.find(
      (bridge) => bridge.row === row && bridge.fromColumn === currentColumn,
    );

    if (forwardBridge) {
      currentColumn += 1;
      continue;
    }

    const backwardBridge = game.bridges.find(
      (bridge) => bridge.row === row && bridge.fromColumn === currentColumn - 1,
    );

    if (backwardBridge) {
      currentColumn -= 1;
    }
  }

  return currentColumn;
}

export function buildLadderPathPoints(
  game: LadderGameData,
  startColumn: number,
  columnXs: number[],
  rowGap: number,
  tailLength = 0,
): LadderPoint[] {
  let currentColumn = startColumn;
  const points: LadderPoint[] = [{ x: columnXs[currentColumn], y: 0 }];

  for (let row = 0; row < game.rowCount; row += 1) {
    const y = (row + 1) * rowGap;
    points.push({ x: columnXs[currentColumn], y });

    const forwardBridge = game.bridges.find(
      (bridge) => bridge.row === row && bridge.fromColumn === currentColumn,
    );

    if (forwardBridge) {
      currentColumn += 1;
      points.push({ x: columnXs[currentColumn], y });
      continue;
    }

    const backwardBridge = game.bridges.find(
      (bridge) => bridge.row === row && bridge.fromColumn === currentColumn - 1,
    );

    if (backwardBridge) {
      currentColumn -= 1;
      points.push({ x: columnXs[currentColumn], y });
    }
  }

  if (tailLength > 0) {
    points.push({
      x: columnXs[currentColumn],
      y: game.rowCount * rowGap + tailLength,
    });
  }

  return points;
}

export function buildSvgPath(points: LadderPoint[]) {
  if (points.length === 0) {
    return '';
  }

  return points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(' ');
}

export function measurePathLength(points: LadderPoint[]) {
  let total = 0;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    total += Math.hypot(current.x - previous.x, current.y - previous.y);
  }

  return total;
}
