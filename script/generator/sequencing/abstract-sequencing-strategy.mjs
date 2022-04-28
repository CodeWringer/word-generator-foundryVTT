/**
 * @abstract
 */
export default class AbstractSequencingStrategy {
  /**
   * Returns sequences for the given sample set. 
   * @param {Array<String>} sampleSet 
   * @returns {Array<Sequence>}
   */
  getSequencesOfSet(sampleSet) {
    throw new Error("Not implemented");
  }
  
  /**
   * Returns sequences for the given sample. 
   * @param {String} sample
   * @returns {Array<Sequence>}
   */
  getSequencesOfSample(sample) {
    throw new Error("Not implemented");
  }
}
