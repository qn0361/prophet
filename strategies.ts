import {getWinChance} from './chances';
import {sum} from './utils';
import {keys, random, values} from 'lodash';

const getMinBet = (bets: Bets, id: Id) => {
	const maxBet = Math.max.apply(null, ...values(bets).map((bet) => bet || 0));

	return maxBet - (bets[id] || 0);
};

/**
 *  @param {number} tightness [0, Infinity] (0 — totally loose, Infinity — never goes in, 0.8 — 1.2 values are normal)
 * 	@param {number} sanity [0, 1] -- (0 — decisions are made totally on chances, 1 — on luck)
 * */
export const createMathStrategy = (tightness: number, sanity: number) => {
	const getPersonalBankChance = (bankChance: number) => {
		const coin = random(-sanity, sanity, true) * bankChance;

		return Math.floor(bankChance * tightness + coin);
	};

	const getPersonalRaiseValue = (winChance: number, bank: number) => {
		const coin = random(-sanity, sanity, true) * winChance * bank;
		const mathBasedBet = winChance * (bank + bank * winChance);

		return Math.floor(mathBasedBet / tightness + coin);
	};

	return (state: PublicGameState, id: Id): Move => {
		const {acting, banks, bets, board, hands} = state;
		const myHand = hands[id];
		const against = keys(acting).length - 1;
		const minBet = getMinBet(bets, id);
		const needBet = minBet > 0;
		const bank = sum(...values(banks));
		const winBank = bank + minBet;
		const winChance = getWinChance(myHand, against, board);
		const bankChance = minBet / winBank;
		const positive = winChance > getPersonalBankChance(bankChance);

		return needBet && positive ? {
			value: minBet,
			type: 'bet',
		} : needBet && !positive ? {
			type: 'fold',
		} : {
			type: 'bet',
			value: getPersonalRaiseValue(winChance, bank),
		};
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
