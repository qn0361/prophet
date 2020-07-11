import {getNewState} from './reduceState';
import {getNewPhaseState} from './reducePhase';
import {getNewGameState} from './reduceGame';
import {phases} from '../consts';
import {getCircular, getCircularIndex, pullTuple} from '../utils';
import {mapValues, shuffle, without} from 'lodash';
import {deck as defaultDeck} from '../consts';

type GameProps = {
	actors: Id[],
	blinds: [number, number],
	chip: number,
	stacks: Stacks,
};

type Reducer = (state: GameState, action?: Move) => GameState;

const getInitialState = (props: GameProps): GameState => {
	const {actors, blinds, chip, stacks} = props;
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
	const active = [...actors];
	let deck = shuffle(defaultDeck);
	const hands: Hands = actors.reduce((result, actor) => {
		const {tuple, rest} = pullTuple(deck, 2);

		deck = rest;

		return {
			...result,
			[actor]: tuple,
		};
	}, {});

	return {
		acting,
		active,
		actors,
		board: [],
		banks,
		bets,
		blinds,
		chip,
		deck,
		hands,
		folders: {},
		moves: [],
		phase: phases.blind,
		revealed: {},
		stacks,
	};
};

export const getGame = (props: GameProps, subscribers: Listener[]): Game => {
	let state: GameState = getInitialState(props);
	const publish = (state: GameState) => {
		subscribers.forEach((subscriber) => {
			subscriber(state);
		});
	};
	const decorate = (reducer: Reducer): Reducer => {
		return (state: GameState, action: Move) => {
			const result = reducer(state, action);

			setTimeout(() => {
				publish(result);
			}, 0);

			return result;
		};
	};

	const reducer = (state: GameState, action: Move): GameState => {
		return getNewGameState(getNewPhaseState(getNewState(state, action)));
	};

	const publisher = decorate(reducer);

	return {
		getState: () => state,
		dispatch: (action: Move) => {
			state = publisher(state, action);
		},
	};
}
