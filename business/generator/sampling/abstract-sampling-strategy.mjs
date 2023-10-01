/**
 * A sampling strategy is responsible for providing a sample set. 
 * 
 * Implementing types **must** override these methods:
 * * `getDefinitionID`
 * * `getHumanReadableName`
 * * `getSettings`
 * * `newInstanceWithArgs`
 * * `getSamples`
 * 
 * @abstract
 */
export default class AbstractSamplingStrategy {
  /**
   * Returns the ID by which to uniquely identify this sampling strategy's **definition**. 
   * 
   * This is **not** meant to be the ID of an instance, but rather, of the 'type' of definition this represents. 
   * 
   * @returns {String} ID of this sampling strategy's definition. 
   * 
   * @abstract
   */
  getDefinitionID() {
    throw new Error("Not implemented");
  }
  
  /**
   * Returns a human readable name to display as the name of this type of sampling strategy. 
   * 
   * This is **not** meant to be the name of an instance, but rather, of the 'type' of definition this represents. 
   * 
   * @returns {String} Human readable name of this sampling strategy's definition. 
   * 
   * @abstract
   */
  getHumanReadableName() {
    throw new Error("Not implemented");
  }

  /**
   * Returns the current settings of this sampling strategy. 
   * 
   * @returns {Array<StrategySettings>}
   * 
   * @abstract
   */
  getSettings() {
    throw new Error("Not implemented");
  }
  
  /**
   * Returns a new instance of **this type**, with the given arguments applied. 
   * 
   * @param {Object} args 
   * 
   * @returns {AbstractSamplingStrategy}
   * 
   * @abstract
   */
  newInstanceWithArgs(args) {
    throw new Error("Not implemented");
  }
  
  /**
   * Returns a sample set. 
   * 
   * @returns {Array<String>}
   * 
   * @abstract
   */
  getSamples() {
    throw new Error("Not implemented");
  }
}
