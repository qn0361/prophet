export const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
export const qualities: Quality[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const linked = qualities.map((quality, index, self) => {
	const last = self.length - 1;
	const isFirst = index === 0;
	const isLast = index === last;

	return {
		quality,
		next: isLast ? self[0] : self[index + 1],
		prev: isFirst ? self[last] : self[index - 1],
	};
});

export const deck: Deck = qualities.reduce((result, quality) => {
	const set: Card[] = suits.map((suit) => ({
		suit,
		quality,
	}));

	return [
		...result,
		...set,
	]
}, []);

export const qualityValues: {[key in Quality]: number} = qualities.reduce((acc, quality, index) => {
	return {
		...acc,
		[quality]: index + 1,
	};
}, {} as any);
export const comboValues = {
	kicker: 1,
	pair: 2,
	twopairs: 3,
	set: 4,
	straight: 5,
	flush: 6,
	fullhouse: 7,
	fourofkind: 8,
	sflush: 9,
};

export const phases: {[key: string]: PhaseValue} = {
	blind: 0,
	flop: 1,
	turn: 2,
	river: 3,
	sharing: 4,
};
