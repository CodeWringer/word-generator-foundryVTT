import { isInteger } from '../util/validation.mjs';
import SequenceProbabilityBuilder from './probability-building/sequence-probability-builder.mjs';
import SequenceConcatenator from './concatenation/sequence-concatenator.mjs';

/**
 * This is the algorithm's main logic piece. 
 * 
 * Creating an instance of this type will immediately generate results, based on the given parameters and 
 * then make them available them via the `results` getter. 
 * @property {Array<String>} results
 * @property {Array<String>} sampleSet
 * @property {Number} depth The depth to use with the sequencing strategy. 
 * @property {Number} targetLengthMin The target minimum length that generated texts should be. 
 * @property {Number} targetLengthMax The target maximum length that generated texts should be. 
 * @property {AbstractSequencingStrategy} sequencingStrategy
 * @property {AbstractSpellingStrategy | undefined} spellingStrategy
 * @property {String} seed A seed for the randomization. 
 * @property {Number | undefined} entropy A number between 0 and 1 (inclusive), which determines the 
 * randomness of words, in general. Default 0. 
 * @property {Number | undefined} entropyStart A number between 0 and 1 (inclusive), which determines the 
 * randomness of starting sequences. Default 0. 
 * @property {Number | undefined} entropyMiddle A number between 0 and 1 (inclusive), which determines the 
 * randomness of middle sequences. Default 0. 
 * @property {Number | undefined} entropyEnd A number between 0 and 1 (inclusive), which determines the 
 * randomness of ending sequences. Default 0. 
 * @property {ENDING_PICK_MODES} endingPickMode Determines how and if an ending sequence 
 * will be picked for generated words. 
 */
export default class WordGenerator {
  /**
   * @private
   */
  _results = [];
  /**
   * Returns a list of results, based on the given sample set and parameters. 
   * @type {Array<String>}
   * @readonly
   */
  get results() { return this._results; }
  
  /**
   * @private
   */
  _sampleSet = undefined;
  /**
   * Returns the provided sample set. 
   * @type {Array<String>}
   * @readonly
   */
  get sampleSet() { return this._sampleSet; }
  
  /**
   * The target minimum length that generated texts should be. 
   * 
   * Note, that there is no guarantee these boundaries can be respected, at all times. 
   * @type {Number}
   * @default 1
   */
  targetLengthMin = 1;
  
  /**
   * The target maximum length that generated texts should be. 
   * 
   * Note, that there is no guarantee these boundaries can be respected, at all times. 
   * @type {Number}
   * @default 10
   */
  targetLengthMax = 10;

  /**
   * The sequencing strategy used to determine sequences. 
   * @type {AbstractSequencingStrategy}
   */
  sequencingStrategy = undefined;

  /**
   * The spelling strategy applied to generated words. 
   * 
   * If undefined, to spelling will be applied. 
   * @type {AbstractSpellingStrategy | undefined}
   */
  spellingStrategy = undefined;

  /**
   * @type {String}
   * @private
   */
  _seed = undefined;
  /**
   * Returns seed used in randomization. 
   * @type {String}
   * @readonly
   */
  get seed() { return this._seed; }

  /**
   * @param {Object} args Parameter object. 
   * @param {Array<String>} args.sampleSet The sample set this generator will work with. 
   * @param {Number} args.targetLengthMin The minimum length the results *should* have. 
   * @param {Number} args.targetLengthMax The maximum length the results *should* have. 
   * @param {AbstractSequencingStrategy} args.sequencingStrategy The sequencing strategy to use. 
   * @param {AbstractSpellingStrategy | undefined} args.spellingStrategy Optional. The spelling strategy applied to generated words. 
   * @param {Number | undefined} args.depth The depth to use with the sequencing strategy. 
   * * Minimum `1`. 
   * * Default `1`. 
   * @param {String | undefined} args.seed Optional. A seed for the randomization. 
   * @param {Number | undefined} args.entropy A number between 0 and 1 (inclusive), which determines the 
   * randomness of words, in general. Default `0`. 
   * @param {Number | undefined} args.entropyStart A number between 0 and 1 (inclusive), which determines the 
   * randomness of starting sequences. Default `0`. 
   * @param {Number | undefined} args.entropyMiddle A number between 0 and 1 (inclusive), which determines the 
   * randomness of middle sequences. Default `0`. 
   * @param {Number | undefined} args.entropyEnd A number between 0 and 1 (inclusive), which determines the 
   * randomness of ending sequences. Default `0`. 
   * @param {ENDING_PICK_MODES | undefined} args.endingPickMode Optional. Determines how and if an ending sequence 
   * will be picked for generated words. Default `ENDING_PICK_MODES.RANDOM`.
   * 
   * @throws {Error} Thrown, if the sample set is an empty list or undefined. 
   * @throws {Error} Thrown, if the depth is less than 1 or undefined or no integer value. 
   * @throws {Error} Thrown, if any of the target lengths are less than 1, undefined or no integer value. 
   */
  constructor(args = {}) {
    if (args.sampleSet === undefined || args.sampleSet.length === 0) {
      throw new Error("`args.sampleSet` must not be undefined or an empty list!");
    }
    if (isInteger(args.targetLengthMin) !== true || parseInt(args.targetLengthMin) <= 0) {
      throw new Error("`args.targetLengthMin` must be an integer, greater or equal to 1!");
    }
    if (isInteger(args.targetLengthMax) !== true || parseInt(args.targetLengthMax) <= 0) {
      throw new Error("`args.targetLengthMax` must be an integer, greater or equal to 1!");
    }
    if (args.sequencingStrategy === undefined) {
      throw new Error("`args.sequencingStrategy` must be not be undefined!");
    }
    
    this._sampleSet = args.sampleSet;
    this._depth = args.depth ?? 1;

    this.targetLengthMin = args.targetLengthMin;
    this.targetLengthMax = args.targetLengthMax;

    this.sequencingStrategy = args.sequencingStrategy;
    this.spellingStrategy = args.spellingStrategy;
    
    // These settings will be passed through to the concatenator. 
    this._seed = args.seed ?? foundry.utils.randomID(32);

    this.entropy = args.entropy;
    this.entropyStart = args.entropyStart;
    this.entropyMiddle = args.entropyMiddle;
    this.entropyEnd = args.entropyEnd;
    this.endingPickMode = args.endingPickMode;
  }

  /**
   * Returns the given number of words, randomly generated, based on the parameters of the generator. 
   * @returns {Array<String>} A list of generated words.
   * @throws {Error} Thrown, if generating a unique word takes too many tries. Possibly because 
   * the target length was unreachable. 
   */
  generate(howMany) {
    // Determine which sequences exist. Contains duplicate entries. 
    const sequences = this.sequencingStrategy.getSequencesOfSet(this.sampleSet);
    
    // Build the chain of probabilities of the sequences. 
    const probabilityBuilder = new SequenceProbabilityBuilder();
    const sequenceProbabilities = probabilityBuilder.build(sequences);

    // The concatenator generates the new texts and needs the chain of 
    // probability-enriched sequences for that task. 
    const sequenceConcatenator = new SequenceConcatenator({
      probabilities: sequenceProbabilities,
      entropy: this.entropy,
      entropyStart: this.entropyStart,
      entropyMiddle: this.entropyMiddle,
      entropyEnd: this.entropyEnd,
      seed: this._seed,
      endingPickMode: this.endingPickMode,
    });

    // Generate words. 
    const repetitionMaximum = 1000;
    const words = [];
    for (let i = 0; i < howMany; i++) {
      let word = undefined;

      let attempt = 0;
      do {
        if (attempt >= repetitionMaximum) {
          throw new Error("Maximum number of tries to produce unique word exceeded!");
        }

        try {
          word = sequenceConcatenator.generate(this.targetLengthMin, this.targetLengthMax);
        } catch (error) {
          // Prevent crash and re-throw, if necessary. 
          if (attempt + 1 >= repetitionMaximum) {
            throw new Error("Maximum number of tries to produce unique word exceeded! Inner cause: " + error);
          }
        }
        
        attempt++;
      } while (word === undefined || words.find(it => { return it === word; }) !== undefined);
      
      words.push(word);
    }
    
    // Apply spelling strategy, if one is defined. 
    if (this.spellingStrategy !== undefined) {
      return words.map(it => { return this.spellingStrategy.apply(it); });
    } else {
      return words;
    }
  }
}
