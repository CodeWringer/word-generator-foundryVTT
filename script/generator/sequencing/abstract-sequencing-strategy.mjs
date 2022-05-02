/**
 * @abstract
 */
export default class AbstractSequencingStrategy {
  /**
   * Returns sequences for the given sample set. 
   * @param {Array<String>} sampleSet An array of strings that are to be broken down 
   * into sequences. 
   * @returns {Array<Array<Sequence>>} An array of the sequences found in each sample. 
   * Every sample has its own array of sequences representing it. 
   * 
   * So, for the samples "Bob" and "Steve", you might receive: 
   * ```JSON
   * [
   *   ["B", "o", "b"],
   *   ["S", "t", "e", "v", "e"]
   * ]
   * ```
   */
  getSequencesOfSet(sampleSet) {
    const sequencesOfSet = [];
    for(const sample of sampleSet) {
      const sequencesOfSample = this.getSequencesOfSample(sample, this.depth);
      sequencesOfSet.push(sequencesOfSample);
    }
    return sequencesOfSet;
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
