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
    const sequences = [];
    for(const sample of sampleSet) {
      const sequencesOfSample = this.getSequencesOfSample(sample, this.depth);
      for (const sequenceOfSample of sequencesOfSample) {
        sequences.push(sequenceOfSample);
      }
    }
    return sequences;
  }
  
  /**
   * Returns sequences for the given sample. 
   * @param {String} sample
   * @returns {Array<Sequence>}
   */
  getSequencesOfSample(sample) {
    throw new Error("Not implemented");
  }
  
  /**
   * Returns the current settings of this sequencing strategy. 
   * @returns {Object}
   */
  getSettings() {
    throw new Error("Not implemented");
  }
}
