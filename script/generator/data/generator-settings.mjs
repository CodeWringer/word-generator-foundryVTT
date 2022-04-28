/**
 * Represents the settings (sample set, sequencing strategy, minimum length, 
 * maximum length, etc.) for a Markov-Chain word generator. 
 * @property {Array<String>} sampleSet
 * @property {Number} depth
 * @property {Number} targetLengthMin
 * @property {Number} targetLengthMax
 * @property {AbstractSequencingStrategy} sequencingStrategy
 * @property {AbstractSpellingStrategy | undefined} spellingStrategy
 */
export default class GeneratorSettings {
  constructor(args = {}) {
    this.sampleSet = args.sampleSet;
    this.targetLengthMin = args.targetLengthMin;
    this.targetLengthMax = args.targetLengthMax;
    this.sequencingStrategy = args.sequencingStrategy;
    this.spellingStrategy = args.spellingStrategy;
  }
}
