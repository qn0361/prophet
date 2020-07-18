import {getWinChance} from './chances';
import {sum} from './utils';
import {keys, values} from 'lodash';

const getMinBet = (bets: Bets, id: Id) => {
	const maxBet = Math.max.apply(null, ...values(bets).map((bet) => bet || 0));

	return maxBet - (bets[id] || 0);
};

export const mathStrategy = (state: PublicGameState, id: Id): Move => {
	const {acting, banks, bets, board, hands} = state;
	const myHand = hands[id];
	const against = keys(acting).length - 1;
	const minBet = getMinBet(bets, id);
	const needBet = minBet > 0;
	const bank = sum(...values(banks));
	const winBank = bank + minBet;
	const winChance = getWinChance(myHand, against, board);
	const bankChance = minBet / winBank;
	const positive = winChance > bankChance;

	return needBet && positive ? {
		value: minBet,
		type: 'bet',
	} : needBet && !positive ? {
		type: 'fold',
	} : {
		type: 'bet',
		value: winChance * (bank + bank * winChance),
	};
};

export const checkOnlyStrategy = (state: PublicGameState, id: string): Move => {
	const {bets} = state;
	const minBet = getMinBet(bets, id);

	return minBet === 0 ? {
		type: 'bet',
		value: 0,
	} : {
		type: 'fold',
	};
}
