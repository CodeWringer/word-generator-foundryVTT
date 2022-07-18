/**
 * Defines the base implementation/contract of a use case. 
 * @abstract
 */
export default class AbstractUseCase {
  /**
   * Invokes the use case. 
   * @param {Object | undefined} args Optional. Arguments to be passed to the use case invocation. 
   * @abstract
   * @returns {Any}
   */
  invoke(args) {
    throw new Error("NotImplementedException");
  }
}
