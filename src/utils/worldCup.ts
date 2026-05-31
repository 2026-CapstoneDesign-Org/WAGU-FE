import {
  WorldCupBracketState,
  WorldCupCategory,
  WorldCupEntry,
  WorldCupMatch,
  WorldCupRoundSize,
} from '../types/worldCup';

export const WORLD_CUP_CATEGORY_LABELS: Record<WorldCupCategory, string> = {
  all: '전체 메뉴',
  dessert: '디저트',
  korean: '한식',
  night: '야식',
};

function shuffleEntries(entries: WorldCupEntry[]) {
  const next = [...entries];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function buildMatches(entries: WorldCupEntry[]) {
  const matches: WorldCupMatch[] = [];

  for (let index = 0; index < entries.length; index += 2) {
    matches.push({
      left: entries[index],
      right: entries[index + 1],
    });
  }

  return matches;
}

function buildRoundLabel(size: number) {
  if (size <= 2) {
    return '결승';
  }

  if (size === 4) {
    return '4강';
  }

  if (size === 8) {
    return '8강';
  }

  return `${size}강`;
}

export function buildWorldCupCandidates(
  entries: WorldCupEntry[],
  category: WorldCupCategory,
  roundSize: WorldCupRoundSize,
) {
  const filteredEntries =
    category === 'all' ? entries : entries.filter((entry) => entry.category === category);

  const shuffledEntries = shuffleEntries(filteredEntries);

  if (shuffledEntries.length < roundSize) {
    const fallbackEntries = shuffleEntries(entries).filter(
      (entry) => !shuffledEntries.some((candidate) => candidate.id === entry.id),
    );

    return [...shuffledEntries, ...fallbackEntries].slice(0, roundSize);
  }

  return shuffledEntries.slice(0, roundSize);
}

export function createInitialWorldCupState(
  entries: WorldCupEntry[],
  category: WorldCupCategory,
  roundSize: WorldCupRoundSize,
): WorldCupBracketState {
  const candidates = buildWorldCupCandidates(entries, category, roundSize);

  return {
    currentMatchIndex: 0,
    matches: buildMatches(candidates),
    roundLabel: buildRoundLabel(candidates.length),
    roundSize,
    winners: [],
  };
}

export function getCurrentWorldCupMatch(state: WorldCupBracketState) {
  return state.matches[state.currentMatchIndex] ?? null;
}

export function advanceWorldCup(
  state: WorldCupBracketState,
  winner: WorldCupEntry,
): { champion: WorldCupEntry | null; nextState: WorldCupBracketState | null } {
  const roundWinners = [...state.winners, winner];
  const isLastMatchInRound = state.currentMatchIndex >= state.matches.length - 1;

  if (!isLastMatchInRound) {
    return {
      champion: null,
      nextState: {
        ...state,
        currentMatchIndex: state.currentMatchIndex + 1,
        winners: roundWinners,
      },
    };
  }

  if (roundWinners.length === 1) {
    return {
      champion: roundWinners[0],
      nextState: null,
    };
  }

  return {
    champion: null,
    nextState: {
      currentMatchIndex: 0,
      matches: buildMatches(roundWinners),
      roundLabel: buildRoundLabel(roundWinners.length),
      roundSize: state.roundSize,
      winners: [],
    },
  };
}
