import {qualityValues} from './consts';
import {pick, values, assignWith, last} from 'lodash';

export const {combination, bigCombination} = (function () {
    'use strict';
    /* combinatory arithmetics */
    var P = function(m, n) {
        if (n % 1 !== 0) throw new RangeError;
        var p = 1;
        while (n--) p *= m--;
        return p;
    };
    var C = function(m, n) {
        if (n > m) {
            return 0;
        }
        return P(m, n) / P(n, n);
    };
    /* common methods */
    var addProperties = function(dst, src) {
        Object.keys(src).forEach(function(p) {
            Object.defineProperty(dst, p, {
                value: src[p],
                configurable: p == 'next'
            });
        });
    };
    var hideProperty = function(o, p) {
        Object.defineProperty(o, p, {
            writable: true
        });
    };
    var toArray = function(f) {
        var e, result = [];
        this.init();
        while (e = this.next()) result.push(f ? f(e) : e);
        this.init();
        return result;
    };
    var common = {
        toArray: toArray,
        map: toArray,
        forEach: function(f) {
            var e;
            this.init();
            while (e = this.next()) f(e);
            this.init();
        },
        filter: function(f) {
            var e, result = [];
            this.init();
            while (e = this.next()) if (f(e)) result.push(e);
            this.init();
            return result;
        },
        find: function(f) {
            var e, result;
            this.init();
            while (e = this.next()) {
                if (f(e)) {
                    result = e;
                    break;
                }
            }
            this.init();
            return result;
        },
        reduce: function(reducer, result) {
            // return this.toArray().reduce(reducer, init);
            this.init();
            var index = 0;
            if (arguments.length < 2) {
                result = this.next();
                index += 1;
            }
            var length = this.length;
            while(index < length) {
                result = reducer(result, this.next(), index, this);
                index += 1;
            }
            return result;
        },
        lazyMap: function(f) {
            this._lazyMap = f;
            return this;
        },
        lazyFilter: function(f) {
            Object.defineProperty(this, 'next', {
                writable: true
            });
            if (typeof f !== 'function') {
                this.next = this._next;
            } else {
                if (typeof (this._next) !== 'function') {
                    this._next = this.next;
                }
                var _next = this._next.bind(this);
                this.next = (function() {
                    var e;
                    while (e = _next()) {
                        if (f(e))
                            return e;
                    }
                    return e;
                }).bind(this);
            }
            Object.defineProperty(this, 'next', {
                writable: false
            });
            return this;
        }

    };
    /* combination */
    var nextIndex = function(n) {
        var smallest = n & -n,
            ripple = n + smallest,
            new_smallest = ripple & -ripple,
            ones = ((new_smallest / smallest) >> 1) - 1;
        return ripple | ones;
    };
    var combination = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var first = (1 << nelem) - 1,
            size = C(ary.length, nelem),
            maxIndex = 1 << ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                this.index = first;
            },
            next: function() {
                if (this.index >= maxIndex) return;
                var i = 0,
                    n = this.index,
                    result = [];
                for (; n; n >>>= 1, i++) {
                    if (n & 1) result[result.length] = this[i];
                }

                this.index = nextIndex(this.index);
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* bigcombination */
    var bigNextIndex = function(n, nelem) {

        var result = n;
        var j = nelem;
        var i = 0;
        for (i = result.length - 1; i >= 0; i--) {
            if (result[i] == 1) {
                j--;
            } else {
                break;
            }
        }
        if (j == 0) {
            // Overflow
            result[result.length] = 1;
            for (var k = result.length - 2; k >= 0; k--) {
                result[k] = (k < nelem-1)?1:0;
            }
        } else {
            // Normal

            // first zero after 1
            var i1 = -1;
            var i0 = -1;
            for (var i = 0; i < result.length; i++) {
                if (result[i] == 0 && i1 != -1) {
                    i0 = i;
                }
                if (result[i] == 1) {
                    i1 = i;
                }
                if (i0 != -1 && i1 != -1) {
                    result[i0] = 1;
                    result[i1] = 0;
                    break;
                }
            }

            j = nelem;
            for (var i = result.length - 1; i >= i1; i--) {
                if (result[i] == 1)
                    j--;
            }
            for (var i = 0; i < i1; i++) {
                result[i] = (i < j)?1:0;
            }
        }

        return result;

    };
    var buildFirst = function(nelem) {
        var result = [];
        for (var i = 0; i < nelem; i++) {
            result[i] = 1;
        }
        result[0] = 1;
        return result;
    };
    var bigCombination = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var first = buildFirst(nelem),
            size = C(ary.length, nelem),
            maxIndex = ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                this.index = first.concat();
            },
            next: function() {
                if (this.index.length > maxIndex) return;
                var i = 0,
                    n = this.index,
                    result = [];
                for (var j = 0; j < n.length; j++, i++) {
                    if (n[j])
                        result[result.length] = this[i];
                }
                bigNextIndex(this.index, nelem);
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* Cartesian Product */

    /* export */
    return {combination, bigCombination};
})();

export const getHighestQuality = (sorted: Card[]): Quality => {
    try {
        return last(sorted).quality;
    } catch {

    }
}

export const pullTuple = (deck: Deck, amount: number) => {
	let rest = [...deck];
	let tuple: Card[] = [];

	for (let i = 0; i < amount; i++) {
		const min = 0;
		const max = rest.length - 1;
		const index = Math.floor(Math.random() * (+max - +min)) + +min;
		const pulled = rest[index];

		tuple = [...tuple, pulled];
		rest = [...rest.slice(0, index), ...rest.slice(index + 1)];
	}

	return {
		rest: rest,
		tuple: tuple,
	};
};

export function getCircularNextIndex(arr: any[], index: number) {
	const n = arr.length;
	const i = index + 1;

	return (i % n + n) % n;
}

export function getCircularNext(arr: any[], index: number) {
	const n = arr.length;
	const i = index + 1;

	return arr[(i % n + n) % n];
}

export function getCircular<T extends unknown>(arr: T[], i: number): T {
    const n = arr.length;

    return arr[(i % n + n) % n];
}

export function getCircularIndex(arr: any[], i: number) {
	const n = arr.length;

	return (i % n + n) % n
}

export function sum(...nums: number[]): number {
    return nums.reduce((acc, current) => {
        return acc + current;
    }, 0);
}

export function sumValues(...objs: {[key: string] : number}[]): {[key: string]: number} {
    const customizer = (sourceValue = 0, targetValue = 0) => {
        return sourceValue + targetValue;
    };

    return (assignWith as any)(...objs, customizer);
}

export function pickByIndex<T extends unknown>(a: T[], indexes: number[]) {
    return values(pick(a, indexes));
}

export const getHighestQualityWeight = (sorted: Card[]): number => {
    return qualityValues[getHighestQuality(sorted)];
}

export const swap = <T extends unknown>(a: T[], i: number, j: number) => {
    [a[i], a[j]] = [a[j], a[i]];

    return a;
}
