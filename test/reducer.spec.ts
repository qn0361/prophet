import {reducer} from "../game";
import {deck as defaultDeck, phases} from '../consts';
import {expect} from "chai";
import {pullTuple} from '../utils';
import {omit} from 'lodash';
import "mocha";

const {tuple: hand1, rest: pulledDeck} = pullTuple(defaultDeck, 2);
const {tuple: hand2, rest: startDeck} = pullTuple(pulledDeck, 2);

const getValuableProps = (state) => {
	const unnecessaryKeys = ['deck', 'board', 'moves'];

	return omit(state, unnecessaryKeys);
}

let state = {
	acting: '1',
	active: ['1', '2'],
	actors: ['1', '2'],
	banks: {'1': 25, '2': 50},
	bets: {'1': 25, '2': 50},
	blinds: [25, 50],
	board: [],
	chip: 1,
	deck: startDeck,
	folders: {},
	hands: {'1': hand1, '2': hand2},
	moves: [],
	phase: phases.blind,
	stacks: {'1': 975, '2': 950},
};

function* getState() {
	const defaultBets = {'1': null, '2': null};

	yield ['should let bb player make his bet', {
		type: 'bet', value: 25,
	}, state = {
		...state,
		acting: '2',
		banks: {'1': 50, '2': 50},
		bets: {'1': 50, '2': 50},
		stacks: {'1': 950, '2': 950},
	}];

	yield  ['should proceed to flop', {
		type: 'bet', value: 0,
	}, state = {
		...state,
		acting: '1',
		bets: {...defaultBets},
		phase: phases.flop,
	}];

	yield  ['should handle ordinary check', {
		type: 'bet', value: 0,
	}, state = {
		...state,
		acting: '2',
		bets: {...state.bets, '1': 0},
	}];

	yield ['should proceed to turn', {
		type: 'bet', value: 0
	}, state = {
		...state,
		acting: '1',
		bets: {...defaultBets},
		phase: phases.turn,
	}];
}


describe('reducer function', () => {
	const states = getState();

	let prev = state;

	for (const [description, move, expected] of states) {
		it(description, () => {
			const actual = getValuableProps(reducer(prev, move));
			const expctd = getValuableProps(expected);

			expect(actual).to.deep.equal(expctd);
			prev = expected;
		});
	}
});
