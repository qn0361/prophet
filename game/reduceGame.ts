import {omit, keys, values, mapValues, pick, omitBy, random, shuffle} from 'lodash';
import {deck as defaultDeck, phases} from '../consts';
import {pullTuple, sum, pickByIndex, sumValues, getCircularIndex, getCircular, getCircularNextIndex} from '../utils';
import {getHighestCombo, compareCombos} from '../combos';

export function share(state: GameState): Stacks {
	const {banks, folders, board, hands} = state;
	let between: {[key: string]: boolean} = mapValues(omit(banks, keys(folders)), () => true);
	let shares: Banks = mapValues(banks, () => 0);
	let unshared: Banks = {...banks};

	while (sum(...values(unshared)) > 0) {
		const betweenHands = pick(hands, keys(between));
		const combos =  keys(betweenHands).reduce((acc, id) => {
			const hand = betweenHands[id];

			return [
				...acc,
				{id, value: getHighestCombo([...hand, ...board])},
			];
		}, []);
		const winIndexes = compareCombos(combos.map((combo) => combo.value));
		const winIds = pickByIndex(combos, winIndexes).map(({id}) => id);
		const shareToTake: number = Math.min(...values(pick(unshared, winIds)));
		let shareAmount = 0;

		keys(unshared).forEach((id) => {
			const value = unshared[id];
			const toBeTaken = Math.min(value, shareToTake);

			shareAmount += toBeTaken;
			unshared[id] -= toBeTaken;
		});
		const eachShare = Math.floor(shareAmount / winIds.length);
		const remainder = shareAmount % winIds.length;
		const luckyOne = remainder ? random(0, winIds.length - 1) : -1;

		shares = sumValues(shares, winIds.reduce((roundShare, id, index) => {
			return {
				...roundShare,
				[id]: index === luckyOne ? eachShare + remainder : eachShare,
			};
		}, {}));

		between = omitBy(between, (__, id) => {
			const value = unshared[id];

			return value <= 0;
		});
	}

	return shares;
}



function isNextGame(state: GameState): boolean {
	return state.phase === phases.sharing;
}

export function getNewGameState(state: GameState): GameState {
	if (!isNextGame(state)) return state;

	const stacks = sumValues(state.stacks, share(state));

	// TODO: replace with default state
	return {
		...state,
		stacks,
	};
}
