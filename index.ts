import {range, shuffle} from "lodash";
import {deck} from "./consts";
import {getHighestCombo, compareCombos} from './combos';
import {pullTuple} from "./utils";

const run = (yours: Hand, against: number = 1, flopped: Card[] = []): number[] => {
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

const getWinChance = (hand: Hand, against: number = 1, board: Card[] = []) => {
  console.time("calculating probability");

  let wins = 0;
  for (let i = 0; i < tries; i++) {
    const winners = run(hand, against, board);
    if (winners.includes(0)) wins++;
  }

  console.timeEnd("calculating probability");

  return wins / tries;
};

const hand: Hand = [
  {quality: '2', suit: 'spades'},
  {quality: '7', suit: 'hearts'},
];

console.log(getWinChance(hand));
