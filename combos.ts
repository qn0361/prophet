import {qualities, linked, comboValues, qualityValues} from './consts';
import {groupBy, flatten, values, first, last} from 'lodash';
import {getHighestQualityWeight, swap} from './utils';

const getStraight = (isFalse: (a: Card, b: Card) => boolean) => {
	return (cards: Card[]) => {
		if (cards.length < 5) {
			return false;
		}
		if (first(cards).quality === '2' && last(cards).quality === 'A') {
			cards = [cards[4], ...cards.slice(0, -1)];
		}

		for (let i = 0; i < cards.length; i++) {
			if (!cards[i + 1]) return true;

			const card = cards[i];
			const next = cards[i + 1];

			if (isFalse(card, next)) return false;
		}
	};
}

export const isStraightFlush = getStraight((a, b) => {
	const {quality, suit} = a;
	const {next: nextQuality} = linked[quality];

	return nextQuality !== b.quality || suit !== b.suit;
});

export const isFlush = (cards: Card[]) => {
	if (cards.length < 5) return false;

	let suit = cards[0].suit;

	return cards.every((card) => card.suit === suit);
};

export const isStraight = getStraight((a, b) => {
	const {quality} = a;
	const {next: nextQuality} = linked[quality];

	return nextQuality !== b.quality;
});

export const getHighestCombo = (unsorted: Card[]): ComparableCombo => {
	const cards = unsorted.sort((a, b) => {
		const aIndex = qualities.findIndex((quality) => a.quality === quality);
		const bIndex = qualities.findIndex((quality) => b.quality === quality);

		return aIndex - bIndex;
	});
	let straightFlushes: Card[][] = [];
	let flushes: Card[][] = [];
	let straights: Card[][] = [];
	let fourOfKinds: Card[][] = [];
	let fullHouses: Card[][] = [];
	let sets: Card[][] = [];
	let twoPairss: Card[][] = [];
	let pairs: Card[][] = [];
	let kickers: Card[][] = [];
	let ofSameQualities = [cards[0]];

	for (let i = 0; i < cards.length; i++) {
		const card = cards[i];

		if (i > 0) {
			let lastSame = last(ofSameQualities);
			const sameQuality = lastSame.quality === card.quality;
			const lastCard = i === cards.length - 1;

			const commit = () => {
				const gotFourOfKind = ofSameQualities.length === 4;
				const gotSet = ofSameQualities.length === 3;
				const gotPair = ofSameQualities.length === 2;
				const gotKicker = ofSameQualities.length === 1;

				if (gotFourOfKind) {
					fourOfKinds = [...fourOfKinds, ofSameQualities];
				}
				if (gotSet) {
					sets = [...sets, ofSameQualities];
				}
				if (gotPair) {
					pairs = [...pairs, ofSameQualities];
				}
				if (gotKicker) {
					kickers = [...kickers, ofSameQualities];
				}

				ofSameQualities = [card];
			}

			if (sameQuality) {
				ofSameQualities = [...ofSameQualities, card];
			}

			if (!sameQuality) {
				commit();
			};

			if (lastCard) {
				commit();
			}
		}
		const fiveTuple = cards.slice(i, i + 5);
		const gotStraightFlush = isStraightFlush(fiveTuple);
		const gotFlush = isFlush(fiveTuple);
		const gotStraight = isStraight(fiveTuple);

		 if (gotStraightFlush) straightFlushes = [fiveTuple];
		 else if (gotFlush) flushes = [fiveTuple];
		 else if (gotStraight) straights = [fiveTuple];
	}

	// combining fullHouses and two pairs
	const gotFullHouse = sets.length > 0 && pairs.length > 0;
	if (gotFullHouse) {
		fullHouses = [[...sets[sets.length - 1], ...pairs[pairs.length -1]]];
		sets = [];
		pairs = [];
	}

	const gotTwoPairs = pairs.length > 1;
	if (gotTwoPairs) {
		twoPairss = [[...pairs[pairs.length -2], ...pairs[pairs.length - 1]]];
		pairs = [];
	}

	if (straightFlushes.length > 0) {
		const combo = straightFlushes[0];

		return {
			value: comboValues['sflush'],
			qualities: [getHighestQualityWeight(combo)],
		};
	}

	if (fourOfKinds.length > 0) {
		const combo = last(fourOfKinds);
		const comboValue = comboValues['fourofkind'];
		const comboQuality = getHighestQualityWeight(combo);
		const kickerQuality = getHighestQualityWeight(last(kickers));

		return {
			value: comboValue,
			qualities: [comboQuality, kickerQuality],
		};
	}

	if (fullHouses.length > 0) {
		const combo = fullHouses[0];
		const comboValue = comboValues['fullhouse'];
		const [pair, set] = values(groupBy(combo, (card) => card.quality)).sort((a, b) => a.length - b.length);
		const qualities = [getHighestQualityWeight(set), getHighestQualityWeight(pair)];

		return {
			value: comboValue,
			qualities,
		};
	}

	if (flushes.length > 0) {
		const combo = last(flushes);
		const comboValue = comboValues['flush'];
		const comboQuality = getHighestQualityWeight(combo);

		return {
			value: comboValue,
			qualities: [comboQuality],
		};
	}

	if (straights.length > 0) {
		const combo = last(straights);
		const comboValue = comboValues['straight'];
		const comboQuality = getHighestQualityWeight(combo);

		return {
			value: comboValue,
			qualities: [comboQuality],
		};
	}

	if (sets.length) {
		const combo = last(sets);
		const comboValue = comboValues['set'];
		const comboQuality = getHighestQualityWeight(combo);
		const kickerQualities = flatten(kickers).map((kicker) => {
			return qualityValues[kicker.quality];
		});

		return {
			value: comboValue,
			qualities: [comboQuality, ...kickerQualities.slice(-2)],
		};
	}

	if (twoPairss.length > 0) {
		const combo = last(twoPairss);
		const comboValue = comboValues['twopairs'];
		const quality1 = getHighestQualityWeight(combo.slice(2));
		const quality2 = getHighestQualityWeight(combo.slice(0, 2));
		const kickerQuality = getHighestQualityWeight(flatten(kickers));

		return {
			value: comboValue,
			qualities: [quality1, quality2, kickerQuality],
		};
	}

	if (pairs.length > 0) {
		const combo = last(pairs);
		const comboValue = comboValues['pair'];
		const comboQuality = getHighestQualityWeight(combo);
		const kickerQualities = flatten(kickers).slice(-3).map((kicker) => {
			return qualityValues[kicker.quality];
		});

		return {
			value: comboValue,
			qualities: [comboQuality, ...kickerQualities],
		}
	}

	return {
		value: comboValues['kicker'],
		qualities: flatten(kickers).slice(-5).map((kicker) => {
			return qualityValues[kicker.quality];
		}),
	}
};

export const compareTwoCombos = (a: ComparableCombo, b: ComparableCombo): number => {
	if (a.value > b.value) {
		return 1;
	} else if (b.value > a.value) {
		return -1;
	} else {
		for (let i = 0; i < a.qualities.length; i++) {
			const aQuality = a.qualities[i];
			const bQuality = b.qualities[i];

			if (aQuality > bQuality) return 1;
			if (aQuality < bQuality) return -1;
		}

		return 0;
	}
}
export const compareCombos = (combos: ComparableCombo[]): number[] => {
	let winners = [0];

	for (let i = 1; i < combos.length; i++) {
		const combo = combos[i];
		const duels = winners.map((index) => {
			return compareTwoCombos(combo, combos[index]);
		});
		const isWin = duels.every((duel) => duel > 0);
		const isTie = duels.every((duel) => duel === 0);

		if (isWin) winners = [i];
		if (isTie) winners.push(i);
	}

	return winners;
};
