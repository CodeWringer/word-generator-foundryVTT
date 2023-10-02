/**
 * Represents the abstract base class for all strategies. 
 * 
 * @abstract
 */
export default class AbstractStrategyDefinition {
  /**
   * Returns the definition's id. 
   * 
   * @type {String}
   * @readonly
   */
  get id() { throw new Error("Not implemented"); }

  /**
   * Returns the definition's localized name. 
   * 
   * @type {String}
   * @readonly
   */
  get localizedName() { throw new Error("Not implemented"); }
  
  /**
   * Returns a new instance of **this type**, with the given arguments applied. 
   * 
   * @param {Object} settings The arguments object that represents the settings to apply to the new instance. 
   * 
   * @returns {AbstractStrategyDefinition}
   * 
   * @abstract
   */
  newInstance(settings) {
    throw new Error("Not implemented");
  }
}
