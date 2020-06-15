import {omit, keys, values, mapValues, pick, omitBy, random, shuffle} from 'lodash';
import {deck as defaultDeck, phases} from './consts';
import {pullTuple, sum, pickByIndex, sumValues, getCircularIndex, getCircular} from './utils';
import {getHighestCombo, compareCombos} from './combos';

function getCircularNextIndex(arr: any[], index: number) {
	const n = arr.length;
	const i = index + 1;

	return (i % n + n) % n;
}

function getCircularNext(arr: any[], index: number) {
	const n = arr.length;
	const i = index + 1;

	return arr[(i % n + n) % n];
}

function areBetsMade(bets: number[], stacks: number[]) {
	if (bets.length === 0) return true;
	if (bets.some(bet => bet === null)) return false;

	let last = bets[0];

	for (let i = 1; i < bets.length; i++) {
		if (bets[i] !== last && stacks[i] !== 0) return false;
		last = bets[i];
	}

	return true;
}

export function share(state: State): Stacks {
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

function isNextBB(state: State): boolean {
	if (state.phase !== phases.blind) return false;

	const {actors, acting, bets, blinds, chip} = state;
	const isBBActing = getCircular(actors, chip + 2) === acting;
	const isMaxBetBb = Math.max(...values(bets)) === blinds[1];

	return isBBActing && isMaxBetBb;
}

function isNextGame(state: State): boolean {
	return state.phase === phases.sharing;
}

function getNewGameState(state: State): State {
	if (!isNextGame(state)) return state;

	let deck = shuffle(defaultDeck);
	const stacks = sumValues(state.stacks, share(state));
	const actors = state.actors.filter((actor) => {
		return stacks[actor] > 0;
	});
	// TODO: make chip depend on seats, not actors
	const chip = getCircularNextIndex(state.actors, state.chip)
	const blinds = state.blinds.map((value) => value * 2) as [number, number];
	const hands: Hands = actors.reduce((result, actor) => {
		const {tuple, rest} = pullTuple(deck, 2);

		deck = rest;

		return {
			...result,
			[actor]: tuple,
		};
	}, {});
	const acting = getCircular(actors, chip + 2);
	const banks = actors.reduce((result, actor, index) => {
		const isSmallBlind = index === getCircularIndex(actors, chip);
		const isBigBlind = index === getCircularIndex(actors, chip + 1);
		const stack = stacks[actor];
		const value = isSmallBlind ? Math.min(stack, blinds[0]) :
			isBigBlind ? Math.min(stack, blinds[1]) : 0;

		return {
			...result,
			[actor]: value,
		};
	}, {});
	const bets = mapValues(banks, (bank) => bank || null);

	// TODO: replace with default state
	return {
		acting,
		active: [...actors],
		actors,
		banks,
		bets,
		blinds,
		board: [],
		chip,
		deck,
		folders: {},
		hands,
		moves: [],
		phase: phases.blind,
		stacks,
	};
}

function isNextPhase(state: State): boolean {
	if (state.active.length === 1) return true;

	const {bets, stacks} = state;
	const areEqualBets = areBetsMade(values(bets), values(stacks));
	const isAllIns = values(stacks).every((stack) => stack <= 0);

	return (areEqualBets && !isNextBB(state)) || isAllIns;
}

function reduceDeckBoard(state: State) {
	const {board, deck, phase} = state;
	const amount = phase === phases.blind ? 3 :
		phase === phases.river ? 0 : 1;
	const {tuple, rest} = pullTuple(deck, amount);

	return {
		board: [...board, ...tuple],
		deck: rest,
	};
}

function getNewPhaseState(state: State): State {
	if (!isNextPhase(state)) return state;

	const bets = mapValues(state.bets, () => null);
	const phase = state.phase + 1 as PhaseValue;
	const {deck, board} = reduceDeckBoard(state);

	return {
		...state,
		board,
		bets,
		deck,
		phase,
	};
}

function reduceActing(state: State, move: Move) {
	const {active, acting} = state;
	const index = active.findIndex((i) => i === acting);

	return getCircularNext(active, index);
}

function reduceActive(state: State, move: Move) {
	const {active, acting, stacks} = state;
	const {type, value} = move;
	const without = active.filter(a => a !== acting);

	if (type === 'fold') {
		return without;
	}
	const activeStack = stacks[acting];
	const isAllIn = activeStack === value;

	return isAllIn ? without : active;
}

function reduceBanks(state: State, move: Move): Banks {
	const {acting, banks} = state;
	const {type, value} = move;

	return type === 'fold' ? banks : {
		...banks,
		[acting]: banks[acting] += value,
	};
}

function reduceFolders(state: State, move: Move): Folders {
	const {acting, folders} = state;
	const {type} = move;

	return type === 'fold' ? {
		...folders,
		[acting]: true,
	} : folders;
}

function reduceBets(state: State, move: Move): Bets {
	const {acting, bets} = state;
	const {type, value = 0} = move;

	return type === 'bet' ? {
		...bets,
		[acting]: bets[acting] + value,
	} : {
		...bets,
		[acting]: null,
	};
}

function reduceStacks(state: State, move: Move): Stacks {
	const {acting, stacks} = state;
	const {value = 0} = move;

	return {
		...stacks,
		[acting]: stacks[acting] - value,
	};
}

function reduceMoves(state: State, move: Move): Move[] {
	return [...state.moves, move];
}

function getNewState(state: State, move: Move): State {
	return {
		...state,
		acting: reduceActing(state, move),
		active: reduceActive(state, move),
		banks: reduceBanks(state, move),
		bets: reduceBets(state, move),
		folders: reduceFolders(state, move),
		moves: reduceMoves(state, move),
		stacks: reduceStacks(state, move),
	};
}

export const reducer = (state: State, action: Move): State => {
	return getNewGameState(getNewPhaseState(getNewState(state, action)));
};

export const game = (opts: any) => {
	let players = [];

	let options = {
		seats: 2,
		blinds: [25, 50],
		...opts,
	};

	let state = {
		acting: 0,
		actors: [],
		banks: [],
		blinds: options.blinds,
		board: [],
		chip: 0,
		moves: [],
		phase: phases.blind,
	};
}
