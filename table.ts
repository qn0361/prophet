import {uniqueId, without, omit, pickBy} from 'lodash';
import {getGame} from './game/game';
import {phases} from './consts';
import {getCircularNextIndex} from './utils';

type ITableProps = {
	blinds: [number, number],
	blindTtl: number,
	seats: number,
	shouldRestart: (state: ITableState) => boolean;
};

type ITableState = {
	actors: Id[],
	blinds: [number, number],
	blindAge: number,
	chip: number,
	stacks: {[key: string]: number},
};

type Listener = (dispatch: (move: Move) => void, state: PublicGameState) => void;

type EnterOptions = {
	stack: number,
	makeMove: Listener,
};

export type Table = {
	enter: (options: EnterOptions) => Id,
	leave: (id: Id) => void,
};

export const getTable = (props: ITableProps): Table => {
	const {blinds, blindTtl, seats, shouldRestart} = props;

	let state: ITableState = {
		actors: [],
		blinds,
		blindAge: 0,
		chip: 0,
		stacks: {},
	};

	let game: Game = undefined;
	let gameState: GameState = undefined;
	let subscribers: {id: string, cb: Listener}[] = [];
	let hooks: ((s: ITableState, p: ITableProps) => void)[] = [
		(state: ITableState) => {
			shouldRestart(state) && restart();
		},
	];

	const setState = (s: Partial<ITableState>) => {
		state = {...state, ...s};
		hooks.forEach((hook) => hook(state, props));
	};

	const handleGameOver = (gameState: GameState) => {
		const {stacks} = gameState;
		const actors = state.actors.filter((id) => {
			return stacks[id] >= 0;
		});
		const blindAge = state.blindAge === blindTtl ? 0 : state.blindAge + 1;
		const blinds = state.blindAge === blindTtl ?
			state.blinds.map((blind) => blind * 2) as [number, number] :
			state.blinds;
		const chip = getCircularNextIndex(actors, state.chip);

		setState({actors, blindAge, blinds, chip, stacks});
	};

	const handleGameStateChange = (state: GameState) => {
		if (state.phase === phases.finished) {
			return handleGameOver(state);
		}

		if (state.acting !== gameState.acting) {
			return requestAction(state)
		}

		gameState = state;
	};

	const requestAction = (state: GameState) => {
		const {id: sId, cb} = subscribers.find((subscriber) => {
			return subscriber.id === state.acting;
		});
		const {deck, ...publicState} = state;

		cb(game.dispatch, {
			...publicState,
			hands: pickBy(state.hands, (_, id) => {
				return id === sId || state.revealed[id];
			}),
		});
	};

	const restart = () => {
		const {actors, blinds, chip, stacks} = state;

		game = getGame({
			actors,
			blinds,
			chip,
			stacks,
		}, [handleGameStateChange]);

		gameState = game.getState();

		requestAction(gameState);
	};

	return {
		enter: (options: EnterOptions) => {
			if (state.actors.length >= seats) {
				return;
			}
			const id = uniqueId();
			const {stack, makeMove} = options;

			subscribers = [...subscribers, ({id, cb: makeMove})];

			setState({
				actors: [...state.actors, id],
				stacks: {
					...state.stacks,
					[id]: stack,
				},
			});

			return id;
		},

		leave: (id: string) => {
			subscribers = subscribers.filter(({id: sId}) => sId !== id);

			setState({
				actors: without(state.actors, id),
				stacks: omit(state.stacks, id),
			});
		},
	};
}
