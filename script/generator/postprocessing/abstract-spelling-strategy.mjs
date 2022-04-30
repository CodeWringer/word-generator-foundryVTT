/**
 * Represents a strategy for rules of how to spell a given word. 
 * 
 * E. g. capitalization could be controlled via a concrete implementation of this class. 
 * @abstract
 */
export default class AbstractSpellingStrategy {
  /**
   * Returns a word, based on the given word with the applied spelling rules. 
   * @param {String} word A word to apply the spelling rules to. 
   * @returns {String} The modified word. 
   */
  apply(word) {
    throw new Error("Not implemented");
  }

  /**
   * Returns the current settings of this spelling strategy. 
   * @returns {Object}
   */
  getSettings() {
    throw new Error("Not implemented");
  }
}
