import AbstractStrategy from "../common/abstract-strategy.mjs";

/**
 * A sequencing strategy is responsible for 'cutting' a given sample (set) into 
 * sequences. 
 * 
 * @extends AbstractStrategy
 * @abstract
 */
export default class AbstractSequencingStrategy extends AbstractStrategy {
  /**
   * Returns sequences for the given sample set. 
   * 
   * @param {Array<String>} sampleSet An array of strings that are to be broken down 
   * into sequences. 
   * 
   * @returns {Array<Array<Sequence>>} An array of the sequences found in each sample. 
   * Every sample has its own array of sequences representing it. 
   * 
   * So, for example, a concrete implementation might return the following for the 
   * samples "Bob" and "Steve": 
   * ```JSON
   * [
   *   ["B", "o", "b"],
   *   ["S", "t", "e", "v", "e"]
   * ]
   * ```
   * 
   * @virtual
   * @async
   */
  async getSequencesOfSet(sampleSet) {
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
   * 
   * @returns {Array<Sequence>}
   * 
   * @abstract
   */
  getSequencesOfSample(sample) {
    throw new Error("Not implemented");
  }
}
