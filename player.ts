import {Table} from './table';

type IPlayerProps = {
	decide(gameState: PublicGameState, id: Id): Move;
	money: number,
};

export const createPlayer = (props: IPlayerProps) => {
	let id;

	const makeMove = (dispatch: (move: Move) => void, state: PublicGameState) => {
		const move = props.decide(state, id);

		dispatch(move);
	};

	const enter = (table: Table) => {
		table.enter({
			makeMove,
			stack: props.money,
		});
	};

	return {
		enter,
	};
};
