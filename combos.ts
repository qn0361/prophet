import {flatten, groupBy, keys, last, takeRightWhile, values} from 'lodash';
import {comboValues, linked, qualities, qualityValues} from './consts';
import {getHighestQualityWeight} from './utils';


const getStraight = (isTrue: (card: Card, prev: Card) => boolean) => {
	return (sorted: Card[]) => {
		const isNot = {
			is: false,
			combo: undefined,
		};

		if (sorted.length < 5) {
			return isNot;
		}

		const aces = takeRightWhile(sorted, (card: Card) => card.quality === 'A');
		const cards = [...aces, ...sorted];
		let counter = 1;

		for (let i = cards.length - 1; i > 0; i--) {
			const card = cards[i];
			const prev = cards[i - 1];

			if (isTrue(card, prev)) counter += 1;
			else counter = 1;

			if (counter === 5) {
				return {
					is: true,
					combo: cards.slice(i - 1, i - 1 + counter),
				};
			}
		}

		return isNot;
	};
}

export const isStraightFlush = getStraight((card: Card, prev: Card) => {
	const {quality, suit} = card;

	return linked[quality].prev === prev.quality && suit === prev.suit;
});

export const isStraight = getStraight((card: Card, prev: Card) => {
	const {quality} = card;

	return linked[quality].prev === prev.quality;
});

export const isFlush = (cards: Card[]) => {
	const isNot = {
		is: false,
		combo: undefined,
	};

	if (cards.length < 5) {
		return isNot;
	}

	const groups = groupBy(cards, (card) => {
		return card.suit;
	});

	const flushed = keys(groups).find((suit) => {
		return groups[suit].length >= 5;
	});

	return flushed ? {
		is: true,
		combo: groups[flushed].slice(-5),
	} : isNot;
};

export const getHighestCombo = (unsorted: Card[]): ComparableCombo => {
	const cards = unsorted.sort((a, b) => {
		const aIndex = qualities.findIndex((quality) => a.quality === quality);
		const bIndex = qualities.findIndex((quality) => b.quality === quality);

		return aIndex - bIndex;
	});

	const {is: isSflush, combo: sflush} = isStraightFlush(cards);

	if (isSflush) {
		return {
			value: comboValues.sflush,
			qualities: [getHighestQualityWeight(sflush)],
		};
	}

	let fourOfKinds: Card[][] = [];
	let sets: Card[][] = [];
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
	}



	if (fourOfKinds.length > 0) {
		const combo = last(fourOfKinds);
		const comboValue = comboValues['fourofkind'];
		const comboQuality = getHighestQualityWeight(combo);
		const caseKickers = [
			...(sets.length ? last(sets) : []),
			...(pairs.length ? last(pairs) : []),
			...(kickers.length ? last(kickers) : []),
		];

		const kickerQuality = getHighestQualityWeight(caseKickers);

		return {
			value: comboValue,
			qualities: [comboQuality, kickerQuality],
		};
	}

	// got fullhouse
	if (sets.length > 1 || sets.length > 0 && pairs.length > 0) {
		const combo = sets.length > 1 ? [
			...sets[sets.length - 1],
			...sets[sets.length - 2].slice(0, 2),
		] : [
			...sets[sets.length - 1],
			...pairs[pairs.length -1],
		];
		const comboValue = comboValues['fullhouse'];
		const [pair, set] = values(groupBy(combo, (card) => card.quality)).sort((a, b) => a.length - b.length);
		const qualities = [getHighestQualityWeight(set), getHighestQualityWeight(pair)];

		return {
			value: comboValue,
			qualities,
		};
	}

	const {is: isFl, combo: flush} = isFlush(cards);

	if (isFl) {
		return {
			value: comboValues.flush,
			qualities: flush.reverse().map((card) => qualityValues[card.quality]),
		};
	}

	const {is: isSt, combo: straight} = isStraight(cards);

	if (isSt) {
		return {
			value: comboValues.straight,
			qualities: [getHighestQualityWeight(straight)],
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
			qualities: [comboQuality, ...kickerQualities.slice(-2).reverse()],
		};
	}

	// got two pairs
	if (pairs.length > 1) {
		const combo = [...pairs[pairs.length -2], ...pairs[pairs.length - 1]];
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
		const kickerQualities = flatten(kickers).slice(-3).reverse().map((kicker) => {
			return qualityValues[kicker.quality];
		});

		return {
			value: comboValue,
			qualities: [comboQuality, ...kickerQualities],
		}
	}

	return {
		value: comboValues['kicker'],
		qualities: flatten(kickers).slice(-5).reverse().map((kicker) => {
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
