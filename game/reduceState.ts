import {getCircularNext} from '../utils';

function reduceActing(state: GameState, __: Move) {
	const {active, acting} = state;
	const index = active.findIndex((i) => i === acting);

	return getCircularNext(active, index);
}

function reduceActive(state: GameState, move: Move) {
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

function reduceBanks(state: GameState, move: Move): Banks {
	const {acting, banks} = state;
	const {type, value} = move;

	return type === 'fold' ? banks : {
		...banks,
		[acting]: banks[acting] += value,
	};
}

function reduceFolders(state: GameState, move: Move): Folders {
	const {acting, folders} = state;
	const {type} = move;

	return type === 'fold' ? {
		...folders,
		[acting]: true,
	} : folders;
}

function reduceBets(state: GameState, move: Move): Bets {
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

function reduceStacks(state: GameState, move: Move): Stacks {
	const {acting, stacks} = state;
	const {value = 0} = move;

	return {
		...stacks,
		[acting]: stacks[acting] - value,
	};
}

function reduceMoves(state: GameState, move: Move): Move[] {
	return [...state.moves, move];
}

export function getNewState(state: GameState, move: Move): GameState {
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
