import {keys, values, mapValues, pickBy} from 'lodash';
import {phases} from '../consts';
import {pullTuple, getCircular} from '../utils';

function isLastManStanding(state: GameState): boolean {
	const {actors} = state;
	const folders = keys(state.folders).filter((id) => {
		const value = folders[id];

		return value;
	});

	return folders.length === actors.length - 1;
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

function isNextBB(state: GameState): boolean {
	if (state.phase !== phases.blind) return false;

	const {actors, acting, bets, blinds, chip} = state;
	const isBBActing = getCircular(actors, chip + 2) === acting;
	const isMaxBetBb = Math.max(...values(bets)) === blinds[1];

	return isBBActing && isMaxBetBb;
}

function isNextPhase(state: GameState): boolean {
	if (state.active.length === 1) return true;

	const {bets, stacks} = state;
	const areEqualBets = areBetsMade(values(bets), values(stacks));
	const isAllIns = values(stacks).every((stack) => stack <= 0);

	return (areEqualBets && !isNextBB(state)) || isAllIns;
}

function reduceDeckBoard(state: GameState) {
	const {board, deck, phase} = state;
	const amount = phase === phases.blind ? 3 :
		phase === phases.river ? 0 : 1;
	const {tuple, rest} = pullTuple(deck, amount);

	return {
		board: [...board, ...tuple],
		deck: rest,
	};
}

function reduceRevealed(state: GameState) {
	if (state.phase !== phases.river) {
		return state.revealed;
	}

	const {active, bets, actors, folders, stacks} = state;

	const areEqualBets = areBetsMade(values(bets), values(stacks));
	const isAllIns = values(stacks).every((stack) => stack <= 0);
	const isOnlyActive = active.length === 1;

	return areEqualBets || isAllIns || isOnlyActive ? mapValues(pickBy(actors, (_, id) => {
		return !folders[id];
	}), () => true) : state.revealed;
}

export function getNewPhaseState(state: GameState): GameState {
	// all folded, proceed to sharing
	if (isLastManStanding(state)) return {
		...state,
		phase: phases.sharing,
	}

	// recursion exit condition
	if (state.phase === phases.sharing) {
		return state;
	}

	if (!isNextPhase(state)) return state;

	const bets = mapValues(state.bets, () => null);
	const phase = state.phase + 1 as PhaseValue;
	const {deck, board} = reduceDeckBoard(state);
	const nextPhaseState = {
		...state,
		board,
		bets,
		deck,
		phase,
		revealed: reduceRevealed(state),
	};

	// have to recursively run through every phase in case of all-ins
	return state.active.length === 1 ? getNewPhaseState(nextPhaseState) : nextPhaseState;
}
