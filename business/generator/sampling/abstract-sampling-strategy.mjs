import AbstractStrategy from "../common/abstract-strategy.mjs";

/**
 * Represents an abstract sample set provider strategy. 
 * 
 * @extends AbstractStrategy
 * @abstract
 */
export default class AbstractSamplingStrategy extends AbstractStrategy {
  /**
   * Returns a sample set. 
   * 
   * @returns {Array<String>}
   * 
   * @async
   * @abstract
   */
  async getSamples() {
    throw new Error("Not implemented");
  }

  /**
   * Returns `true`, if this sample strategy is fully configured and can be used 
   * in result generation. Returns `false` otherwise. 
   * 
   * @returns {Boolean} `true`, if this sample strategy is fully configured. 
   * `false` otherwise. 
   * 
   * @abstract
   */
  isFullyConfigured() {
    throw new Error("Not implemented");
  }
}
