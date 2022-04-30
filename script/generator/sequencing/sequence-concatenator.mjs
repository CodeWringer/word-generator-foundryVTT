import { isInteger } from "../../util/validation.mjs";

/**
 * Concatenates probability-weighted sequences. 
 * @property {SequenceProbabilities} sequences
 * 
 * Builds new words, based on a given set of probable sequences. 
 * @property {Number} entropy A number between 0 and 1 (inclusive), which determines the 
 * likelihood of the next sequence being picked entirely at random. 
 * 
 * Default 0
 * @property {Number} entropyStart A number between 0 and 1 (inclusive), which determines the 
 * likelihood of the next starting sequence being picked entirely at random. 
 * 
 * Default 0
 * @property {Number} entropyMiddle A number between 0 and 1 (inclusive), which determines the 
 * likelihood of the next middle sequence being picked entirely at random. 
 * 
 * Default 0
 * @property {Number} entropyEnd A number between 0 and 1 (inclusive), which determines the 
 * likelihood of the next ending sequence being picked entirely at random. 
 * 
 * Default 0
 * @property {String | undefined} seed A randomization seed. 
 */
export default class SequenceConcatenator {
  /**
   * The seeded random number generator. 
   * @type {RandomSeeded}
   * @private
   */
  _rng = undefined;

  /**
   * @param {SequenceProbabilities} sequences
   * @param {Number} entropy
   * @param {Number} entropyStart
   * @param {Number} entropyMiddle
   * @param {Number} entropyEnd
   * @param {String | undefined} seed
   */
  constructor(args = {}) {
    this.sequences = args.sequences;
    this.entropy = args.entropy;
    this.entropyStart = args.entropyStart;
    this.entropyMiddle = args.entropyMiddle;
    this.entropyEnd = args.entropyEnd;
    this.seed = args.seed;
    
    this._rng = new RandomSeeded(args.seed);
  }

  /**
   * Generates and returns a single word. 
   * 
   * Note, that there is no guarantee that the generated world will be definitely 
   * shorter than `maxLength`. 
   * @param {Number | undefined} minLength The minimum length of the generated word, 
   * in characters. Default 1. 
   * @param {Number | undefined} maxLength The maximum length of the generated word, 
   * in characters. Default 10. 
   * @returns {String}
   */
  generate(minLength = 1, maxLength = 10) {
    if (isInteger(minLength) !== true || parseInt(minLength) < 1) {
      throw new Error("minLength must be an integer >= 1");
    }
    if (isInteger(maxLength) !== true || parseInt(maxLength) < 1) {
      throw new Error("maxLength must be an integer >= 1");
    }

    const targetLength = Math.round(this._rng.generate(minLength, maxLength));
    
    const startingSequence = this._pickStart();
    let previousSequence = startingSequence;
    let resultingSequences = [startingSequence];
    let endingSequence = undefined;
    let resultLength = startingSequence.chars.length;

    while (resultLength < targetLength) {
      const nextSequence = this._pickFollowingOf(previousSequence);
      const isEndingSequence = nextSequence.following.length <= 0;

      if(isEndingSequence === true) {
        resultLength -= endingSequence.chars.length;
        endingSequence = nextSequence;
        resultLength += endingSequence.chars.length;
      } else {
        resultingSequences.push(nextSequence);
        resultLength += nextSequence.chars.length;
      }
      
      previousSequence = nextSequence;
    }

    if (endingSequence !== undefined) {
      resultingSequences.push(endingSequence);
    }

    return resultingSequences.join();
  }

  /**
   * Picks and returns a random starting sequence. 
   * @returns {ProbableSequence}
   * @private
   */
  _pickStart() {
    return this._pickSequenceFrom(this.sequences.starts, this.entropyStart);
  }
  
  /**
   * Picks and returns one of the sequences that can follow the given sequence. 
   * 
   * If the given sequence doesn't have any sequences that follow it (= it is an 
   * ending sequence), then a random middle sequence will be picked, instead. 
   * @param {ProbableSequence} sequence
   * @returns {ProbableSequence}
   * @private
   */
  _pickFollowingOf(sequence) {
    if (sequence.following.length > 0) {
      return this._pickSequenceFrom(sequence.following, this.entropyMiddle);
    } else {
      return this._pickSequenceFrom(this.sequences.middles, this.entropyMiddle);
    }
  }

  /**
   * Returns a sequence picked at random, either from the global list of 
   * sequences, or from the given list of sequences. 
   * 
   * The detmining factors are the entropy and the given entropy. 
   * @param {Array<ProbableSequence>} sequences The list to pick from. 
   * @param {Number} entropy A chance to allow an **entirely** randomly picked result. 
   * @private
   */
  _pickSequenceFrom(sequences, entropy) {
    let rnd = this._rng.generate();
    if (rnd <= this.entropy || entropy) {
      // Pick a sequence entirely at random. 
      rnd = this._rng.generate();
      return this._getMatchingSequenceFrom(this.sequences.sequences, rnd);
    } else {
      // Pick a probable sequence. 
      rnd = this._rng.generate();
      return this._getMatchingSequenceFrom(sequences, rnd);
    }
  }

  /**
   * @param {Array<ProbableSequence>} weightedList 
   * @param {Number} value 
   * @returns {ProbableSequence}
   * @private
   */
  _getMatchingSequenceFrom(weightedList, value) {
    for (const weightedItem of weightedList) {
      if (value <= weightedItem.probability) {
        return weightedItem;
      }
    }
    throw new Error(`Failed to get item for value '${value}' from list!`);
  }
}
