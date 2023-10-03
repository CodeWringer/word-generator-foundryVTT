/**
 * Used to generate seeded pseudo-random numbers. 
 * @see https://stackoverflow.com/a/47593316 Credit goes to user 'bryc', whose code this is based on. 
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
   * Returns a new pseudo-random number between min and max (inclusive). 
   * 
   * @param {Number | undefined} min Optional. Lower boundary. 
   * * default `0`
   * @param {Number | undefined} max Optional. Upper boundary. 
   * * default `1`
   * 
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
   * Generates and returns an ID, in the form of a string, with the given 
   * length in characters. 
   * 
   * @param {Number} length The string length to generate. 
   * 
   * @returns {String} The generated ID. 
   */
  randomID(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const result = [];
    for (let count = 0; count < length; count++) {
      const charIndex = parseInt(this.generate(0, chars.length - 1));
      result.push(chars[charIndex]);
    }
    return result.join("");
  }

  /**
   * Generates a seed. 
   * 
   * @param {String} str 
   * 
   * @returns {Number}
   * 
   * @private
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
   * 
   * @param {Function<Any>} seed The seed. 
   * 
   * @returns {Number}
   * 
   * @private
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