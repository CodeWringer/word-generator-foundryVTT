import AbstractStrategy from "../common/abstract-strategy.mjs";

/**
 * Represents a strategy for rules of how to spell a given word. 
 * 
 * E. g. capitalization could be controlled via a concrete implementation of this class. 
 * 
 * @extends AbstractStrategy
 * @abstract
 */
export default class AbstractSpellingStrategy extends AbstractStrategy {
  /**
   * Returns a word, based on the given word with the applied spelling rules. 
   * 
   * @param {String} word A word to apply the spelling rules to. 
   * 
   * @returns {String} The modified word. 
   * 
   * @async
   */
  async apply(word) {
    throw new Error("Not implemented");
  }
}
