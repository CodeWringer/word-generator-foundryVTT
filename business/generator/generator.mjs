import { isInteger } from '../util/validation.mjs';
import SequenceProbabilityBuilder from './probability-building/sequence-probability-builder.mjs';
import SequenceConcatenator, { ENDING_PICK_MODES } from './concatenation/sequence-concatenator.mjs';
import AbstractSamplingStrategy from './sampling/abstract-sampling-strategy.mjs';
import AbstractSequencingStrategy from './sequencing/abstract-sequencing-strategy.mjs';
import AbstractSpellingStrategy from './postprocessing/abstract-spelling-strategy.mjs';

/**
 * This generator can generate a pseudo-random set of words, based on a given sample set. 
 * 
 * @property {AbstractSequencingStrategy} samplingStrategy The sampling strategy. 
 * @property {AbstractSequencingStrategy} sequencingStrategy The sequencing strategy. 
 * @property {AbstractSpellingStrategy} spellingStrategy The spelling post-processing strategy. 
 * @property {Number} targetLengthMin The target minimum length that generated texts should be. 
 * @property {Number} targetLengthMax The target maximum length that generated texts should be. 
 * @property {String | undefined} seed A seed for the randomization. 
 * * If left undefined, a new random seed will be generated before every invocation of `generate`;
 * @property {Number} entropy A number between 0 and 1 (inclusive), which determines the 
 * randomness of words, in general. Default 0. 
 * @property {Number} entropyStart A number between 0 and 1 (inclusive), which determines the 
 * randomness of starting sequences. Default 0. 
 * @property {Number} entropyMiddle A number between 0 and 1 (inclusive), which determines the 
 * randomness of middle sequences. Default 0. 
 * @property {Number} entropyEnd A number between 0 and 1 (inclusive), which determines the 
 * randomness of ending sequences. Default 0. 
 * @property {ENDING_PICK_MODES} endingPickMode Determines how and if an ending sequence 
 * will be picked for generated words. 
 */
export default class WordGenerator {
  /**
   * @param {Object} args Parameter object. 
   * @param {AbstractSamplingStrategy} args.samplingStrategy The sampling strategy to use. 
   * @param {AbstractSequencingStrategy} args.sequencingStrategy The sequencing strategy to use. 
   * @param {AbstractSpellingStrategy} args.spellingStrategy The spelling strategy applied to generated words. 
   * @param {Number | undefined} args.targetLengthMin The minimum length the results *should* have. 
   * * default `3`
   * @param {Number | undefined} args.targetLengthMax The maximum length the results *should* have. 
   * * default `10`
   * @param {String | undefined} args.seed A seed for the randomization. 
   * * If left undefined, a new random seed will be generated before every invocation of `generate`;
   * @param {Number | undefined} args.entropy A number between 0 and 1 (inclusive), which determines the 
   * randomness of words, in general. 
   * * default `0`. 
   * @param {Number | undefined} args.entropyStart A number between 0 and 1 (inclusive), which determines the 
   * randomness of starting sequences. 
   * * default `0`. 
   * @param {Number | undefined} args.entropyMiddle A number between 0 and 1 (inclusive), which determines the 
   * randomness of middle sequences. 
   * * default `0`. 
   * @param {Number | undefined} args.entropyEnd A number between 0 and 1 (inclusive), which determines the 
   * randomness of ending sequences. 
   * * default `0`. 
   * @param {ENDING_PICK_MODES | undefined} args.endingPickMode Determines how and if an ending sequence 
   * will be picked for generated words. 
   * * default `ENDING_PICK_MODES.RANDOM`.
   * 
   * @throws {Error} Thrown, if the samplingStrategy is undefined. 
   * @throws {Error} Thrown, if any of the target lengths are less than 1, undefined or no integer value. 
   */
  constructor(args = {}) {
    if (args.samplingStrategy === undefined) {
      throw new Error("`samplingStrategy` must not be undefined!");
    }
    if (args.sequencingStrategy === undefined) {
      throw new Error("`sequencingStrategy` must not be undefined!");
    }
    if (args.spellingStrategy === undefined) {
      throw new Error("`spellingStrategy` must not be undefined!");
    }
    if (isInteger(args.targetLengthMin) !== true || parseInt(args.targetLengthMin) <= 0) {
      throw new Error("`targetLengthMin` must be an integer, greater or equal to 1!");
    }
    if (isInteger(args.targetLengthMax) !== true || parseInt(args.targetLengthMax) <= 0) {
      throw new Error("`targetLengthMax` must be an integer, greater or equal to 1!");
    }
    
    this.samplingStrategy = args.samplingStrategy;
    this.sequencingStrategy = args.sequencingStrategy;
    this.spellingStrategy = args.spellingStrategy;

    this.targetLengthMin = args.targetLengthMin ?? 3;
    this.targetLengthMax = args.targetLengthMax ?? 10;
    
    // These settings will be passed through to the concatenator. 
    
    this.seed = args.seed;

    this.entropy = args.entropy ?? 0.0;
    this.entropyStart = args.entropyStart ?? 0.0;
    this.entropyMiddle = args.entropyMiddle ?? 0.0;
    this.entropyEnd = args.entropyEnd ?? 0.0;
    this.endingPickMode = args.endingPickMode ?? ENDING_PICK_MODES.RANDOM;
  }

  /**
   * Returns the given number of words, randomly generated, based on the parameters of the generator. 
   * 
   * @param {Number} count The number of results to generate. 
   * 
   * @returns {Array<String>} A list of generated words.
   * 
   * @throws {Error} Thrown, if generating a unique word takes too many tries. Possibly because 
   * the target length was unreachable. 
   * 
   * @async
   */
  async generate(count) {
    // Determine which sequences exist. Contains duplicate entries. 
    const samples = await this.samplingStrategy.getSamples();
    const sequences = await this.sequencingStrategy.getSequencesOfSet(samples);
    
    // Build the chain of probabilities of the sequences. 
    const probabilityBuilder = new SequenceProbabilityBuilder();
    const sequenceProbabilities = probabilityBuilder.build(sequences);

    const seed = this.seed ?? foundry.utils.randomID(32);

    // The concatenator generates the new texts and needs the chain of 
    // probability-enriched sequences for that task. 
    const sequenceConcatenator = new SequenceConcatenator({
      probabilities: sequenceProbabilities,
      entropy: this.entropy,
      entropyStart: this.entropyStart,
      entropyMiddle: this.entropyMiddle,
      entropyEnd: this.entropyEnd,
      seed: seed,
      endingPickMode: this.endingPickMode,
    });

    // Generate words. 
    const repetitionMaximum = 1000;
    const generatedResults = [];
    for (let i = 0; i < count; i++) {
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
      } while (word === undefined || generatedResults.find(it => { return it === word; }) !== undefined);
      
      generatedResults.push(word);
      attempt = 0;
    }
    
    // Apply spelling strategy. 
    const postProcessed = [];
    // words.map(async it => { return await this.spellingStrategy.apply(it); });
    for (const generatedResult of generatedResults) {
      const postProcessedResult = await this.spellingStrategy.apply(generatedResult);
      postProcessed.push(postProcessedResult);
    }
    return postProcessed;
  }
}
