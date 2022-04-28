/**
 * Used to generate seeded pseudo-random numbers. 
 */
export default class RandomSeeded {
  /**
   * The seed. 
   * @private
   */
  _seed = undefined;

  constructor(seed) {
    this._seed = this._xmur3(seed ?? Math.random());
  }

  /**
   * Returns a new pseudo-random number between 0 and 1 (inclusive). 
   * @param {Number | undefined} min Optional. Lower boundary. 
   * @param {Number | undefined} max Optional. Upper boundary. 
   * @returns {Number}
   */
  generate(min, max) {
    const rnd = this._mulberry32(this._seed())();
    if (min !== undefined && max !== undefined) {
      return rnd * (max - min) + min;
    } else if (min !== undefined) {
      return min + rnd;
    } else if (max !== undefined) {
      return Math.min(max, rnd * max);
    } else {
      return rnd;
    }
  }

  /**
   * Generates a seed. 
   * @param {String} str 
   * @see https://stackoverflow.com/a/47593316
   */
  _xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    } return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    }
  }

  /**
   * Generates a seeded random number. 
   * @param {Function<Any>} seed The seed. 
   * @see https://stackoverflow.com/a/47593316
   */
  _mulberry32(seed) {
    return function () {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
}