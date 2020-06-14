import { range, shuffle, isEqual } from "lodash";
import { deck } from "./consts";
import { getHighestCombo, compareCombos, compareTwoCombos } from "./combos";
import { sflush, fourofkind, pair, set } from "./presets";
import { pullTuple } from "./utils";
import { share } from "./game";

const run = (yours: Hand, against: number, flopped: Card[] = []): number[] => {
  const known = [...yours, ...flopped];
  const filtered = deck.filter((card) => {
    return !known.some((knownCard) => {
      return knownCard.quality === card.quality && knownCard.suit === card.suit;
    });
  });
  let gamedeck = shuffle(filtered);
  const pull = (amount: number) => {
    const { tuple, rest } = pullTuple(gamedeck, amount);
    gamedeck = rest;

    return tuple;
  };
  const otherHands = range(0, against).map(() => {
    return pull(2);
  });
  const board = [...flopped, ...pull(5 - flopped.length)];
  const sevenSizedHands: Card[][] = [yours, ...otherHands].map((hand) => {
    return [...hand, ...board];
  });
  const combos = sevenSizedHands.map(getHighestCombo);

  return compareCombos(combos);
};

const tries = 50_000;

const getWinChance = (hand: Hand, against: number, board: Card[]) => {
  console.time("calculating probability");

  let wins = 0;
  for (let i = 0; i < tries; i++) {
    const winners = run(hand, against, board);
    if (winners.includes(0)) wins++;
  }

  console.timeEnd("calculating probability");

  return wins / tries;
};

const input = {
  hands: {
    "1": [
      { suit: "clubs", quality: "2" },
      { suit: "diamonds", quality: "7" },
    ],
    "2": [
      { suit: "spades", quality: "Q" },
      { suit: "diamonds", quality: "Q" },
    ],
  },
  banks: {
    "1": 200,
    "2": 200,
  },
  board: [
    { suit: "spades", quality: "K" },
    { suit: "diamonds", quality: "K" },
    { suit: "clubs", quality: "K" },
    { suit: "hearts", quality: "K" },
    { suit: "hearts", quality: "A" },
  ],
  folders: {
    "1": true,
  },
};

console.log(share(input as any));
