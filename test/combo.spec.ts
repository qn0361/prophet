import {expect} from "chai";
import {isStraight, isStraightFlush} from '../combos';
import {minorStraight, straight, minorSflush, sflush, fullhouse} from '../presets';
import "mocha";

describe('isStraight', () => {
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
