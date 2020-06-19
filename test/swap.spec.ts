import { expect } from "chai";
import {swap} from '../utils';
import "mocha";

describe('swap', () => {
	it('should swap array elements', () => {
		const initial = [1, 2, 3];
		const expected = [3, 2, 1];

		swap(initial, 0, 2);

		expect(initial).to.deep.equal(expected);
	});
});
