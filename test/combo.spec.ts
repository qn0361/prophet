import {expect} from "chai";
import {isStraight, isStraightFlush, getHighestCombo} from '../combos';
import {minorStraight, straight, minorSflush, sflush, fullhouse} from '../presets';
import {comboValues} from '../consts';
import "mocha";

describe('getHighestCombo', () => {
	it('should recognize straight', () => {
		expect(isStraight(straight)).to.be.equal(true);
	});

	it('should recognize straight from A to 5', () => {
		expect(isStraight(minorStraight)).to.be.equal(true);
	});

	it('should tell fullhouse is not a straight', () => {
		expect(isStraight(fullhouse)).to.be.equal(false);
	})
});

describe('isStraightFlush', () => {
	it('should recognize straight flush', () => {
		expect(isStraightFlush(sflush)).to.be.equal(true);
	});

	it('should recognize straight flush from A to 5', () => {
		expect(isStraightFlush(minorSflush)).to.be.equal(true);
	});
});

describe('getHighestCombo', () => {
	it('kiker', () => {
		const input = [
			{"suit": "spades", "quality": "K"},
			{"suit": "diamonds", "quality": "10"},
			{"suit": "clubs", "quality": "7"},
			{"suit": "hearts", "quality": "2"},
			{"suit": "hearts", "quality": "A"},
			{"suit": "hearts", "quality": "3"},
			{"suit": "hearts", "quality": "4"},
		]
		const output = {
			value: comboValues.kicker,
			qualities: [13, 12, 9, 6, 3],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
	it('pair', () => {
		const input = [
			{"suit": "spades", "quality": "K"},
			{"suit": "diamonds", "quality": "K"},
			{"suit": "clubs", "quality": "7"},
			{"suit": "hearts", "quality": "10"},
			{"suit": "hearts", "quality": "A"},
			{"suit": "hearts", "quality": "3"},
			{"suit": "hearts", "quality": "4"},
		]
		const output = {
			value: comboValues.pair,
			qualities: [12, 13, 9, 6],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
	it('twopairs', () => {
		const input = [
			{"suit": "spades", "quality": "K"},
			{"suit": "diamonds", "quality": "K"},
			{"suit": "clubs", "quality": "10"},
			{"suit": "hearts", "quality": "10"},
			{"suit": "hearts", "quality": "A"},
			{"suit": "hearts", "quality": "3"},
			{"suit": "hearts", "quality": "4"},
		]
		const output = {
			value: comboValues.twopairs,
			qualities: [12, 9, 13],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
	it('set', () => {
		const input = [
			{"suit": "spades", "quality": "K"},
			{"suit": "diamonds", "quality": "K"},
			{"suit": "clubs", "quality": "K"},
			{"suit": "hearts", "quality": "2"},
			{"suit": "hearts", "quality": "A"},
			{"suit": "hearts", "quality": "3"},
			{"suit": "hearts", "quality": "4"},		
		]
		const output = {
			value: comboValues.set,
			qualities: [12, 13, 3],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
	it('straight', () => {
		const input = [
			{"suit": "spades", "quality": "5"},
			{"suit": "diamonds", "quality": "K"},
			{"suit": "clubs", "quality": "K"},
			{"suit": "hearts", "quality": "2"},
			{"suit": "hearts", "quality": "6"},
			{"suit": "hearts", "quality": "3"},
			{"suit": "hearts", "quality": "4"},		
		]
		const output = {
			value: comboValues.straight,
			qualities: [5],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
	it('straight A-5', () => {
		const input = [
			{"suit": "spades", "quality": "5"},
			{"suit": "diamonds", "quality": "K"},
			{"suit": "clubs", "quality": "K"},
			{"suit": "hearts", "quality": "2"},
			{"suit": "hearts", "quality": "A"},
			{"suit": "hearts", "quality": "3"},
			{"suit": "hearts", "quality": "4"},		
		]
		const output = {
			value: comboValues.straight,
			qualities: [4],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
	it('flush', () => {
		const input = [
			{"suit": "hearts", "quality": "7"},
			{"suit": "diamonds", "quality": "K"},
			{"suit": "clubs", "quality": "K"},
			{"suit": "hearts", "quality": "K"},
			{"suit": "hearts", "quality": "A"},
			{"suit": "hearts", "quality": "3"},
			{"suit": "hearts", "quality": "4"},		
		]
		const output = {
			value: comboValues.flush,
			qualities: [13, 12, 6, 3, 2],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
	it('fullhouse', () => {
		const input = [
			{"suit": "hearts", "quality": "7"},
			{"suit": "diamonds", "quality": "K"},
			{"suit": "clubs", "quality": "K"},
			{"suit": "hearts", "quality": "K"},
			{"suit": "hearts", "quality": "A"},
			{"suit": "diamonds", "quality": "7"},
			{"suit": "clubs", "quality": "7"},		
		]
		const output = {
			value: comboValues.fullhouse,
			qualities: [12, 6],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
	it('fourofkind', () => {
		const input = [
			{"suit": "spades", "quality": "7"},
			{"suit": "diamonds", "quality": "K"},
			{"suit": "clubs", "quality": "K"},
			{"suit": "hearts", "quality": "K"},
			{"suit": "hearts", "quality": "7"},
			{"suit": "diamonds", "quality": "7"},
			{"suit": "clubs", "quality": "7"},		
		]
		const output = {
			value: comboValues.fourofkind,
			qualities: [6],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
	it('sflush', () => {
		const input = [
			{"suit": "hearts", "quality": "5"},
			{"suit": "diamonds", "quality": "K"},
			{"suit": "clubs", "quality": "K"},
			{"suit": "hearts", "quality": "2"},
			{"suit": "hearts", "quality": "5"},
			{"suit": "hearts", "quality": "3"},
			{"suit": "hearts", "quality": "4"},		
		]
		const output = {
			value: comboValues.sflush,
			qualities: [4],
		}
		expect(getHighestCombo(input)).to.deep.equal(output);
	})
});
