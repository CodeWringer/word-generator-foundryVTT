import AbstractStrategy from "../common/abstract-strategy.mjs";

/**
 * Represents an abstract sample set provider strategy. 
 * 
 * @extends AbstractStrategy
 * @abstract
 */
export class AbstractSamplingStrategy extends AbstractStrategy {
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
}
