/**
 * A sequencing strategy is responsible for 'cutting' a given sample (set) into 
 * sequences. 
 * 
 * Implementing types **must** override these methods:
 * * `getDefinitionID`
 * * `getHumanReadableName`
 * * `getSequencesOfSample`
 * * `getSettings`
 * 
 * @abstract
 */
export default class AbstractSequencingStrategy {
  /**
   * Returns the ID by which to uniquely identify this sequencing strategy's **definition**. 
   * 
   * This is **not** meant to be the ID of an instance, but rather, of the 'type' of definition this represents. 
   * 
   * @returns {String} ID of this sequencing strategy's definition. 
   * 
   * @abstract
   */
  getDefinitionID() {
    throw new Error("Not implemented");
  }
  
  /**
   * Returns a human readable name to display as the name of this type of sequencing strategy. 
   * 
   * This is **not** meant to be the name of an instance, but rather, of the 'type' of definition this represents. 
   * 
   * @returns {String} Human readable name of this sequencing strategy's definition. 
   * 
   * @abstract
   */
  getHumanReadableName() {
    throw new Error("Not implemented");
  }

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
   * 
   * @virtual
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
   * 
   * @returns {Array<Sequence>}
   * 
   * @abstract
   */
  getSequencesOfSample(sample) {
    throw new Error("Not implemented");
  }
  
  /**
   * Returns the current settings of this sequencing strategy. 
   * 
   * @returns {Object}
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
   * @returns {AbstractSequencingStrategy}
   * 
   * @abstract
   */
  newInstanceWithArgs(args) {
    throw new Error("Not implemented");
  }
}
