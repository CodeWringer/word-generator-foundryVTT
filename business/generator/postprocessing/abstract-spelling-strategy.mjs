/**
 * Represents a strategy for rules of how to spell a given word. 
 * 
 * E. g. capitalization could be controlled via a concrete implementation of this class. 
 * 
 * Implementing types **must** override these methods:
 * * `getDefinitionID`
 * * `getHumanReadableName`
 * * `apply`
 * * `getSettings`
 * 
 * @abstract
 */
export default class AbstractSpellingStrategy {
  /**
   * Returns the ID by which to uniquely identify this spelling strategy's **definition**. 
   * 
   * This is **not** meant to be the ID of an instance, but rather, of the 'type' of definition this represents. 
   * 
   * @returns {String} ID of this spelling strategy's definition. 
   */
  getDefinitionID() {
    throw new Error("Not implemented");
  }
  
  /**
   * Returns a human readable name to display as the name of this type of spelling strategy. 
   * 
   * This is **not** meant to be the name of an instance, but rather, of the 'type' of definition this represents. 
   * 
   * @returns {String} Human readable name of this spelling strategy's definition. 
   */
  getHumanReadableName() {
    throw new Error("Not implemented");
  }

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
   * @returns {Array<StrategySettings>}
   */
  getSettings() {
    throw new Error("Not implemented");
  }

  /**
   * Returns a new instance of **this type**, with the given arguments applied. 
   * 
   * @param {Object} args The arguments object that represents the settings to apply to the new instance. 
   * 
   * @returns {AbstractSpellingStrategy}
   * 
   * @abstract
   */
  newInstanceWithArgs(args) {
    throw new Error("Not implemented");
  }
}
