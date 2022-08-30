import RandomSeeded from "../../util/random-seed.mjs";
import { isInteger } from "../../util/validation.mjs";

/**
 * Represents the different modes of how an ending sequence may be picked. 
 * @constant
 * @type {Object}
 * @property {Number} NONE Ending sequences are not considered at all and may 
 * even appear in the middle of a built word. 
 * @property {Number} RANDOM An ending sequence is picked entirely at random, 
 * from the set of ending sequences. 
 * @property {Number} FOLLOW_BRANCH Branches will be followed until eventually 
 * reaching an ending sequence, which is then picked. 
 */
export const ENDING_PICK_MODES = {
  NONE: 0,
  RANDOM: 1,
  FOLLOW_BRANCH: 2,
}

/**
 * Concatenates probability-weighted sequences. 
 * @property {SequenceProbabilities} sequences
 * 
 * Builds new words, based on a given set of probable sequences. 
 * @property {Number} entropy A number between 0 and 1 (inclusive), which determines the 
 * likelihood of the next sequence being picked entirely at random. Default `0`.
 * @property {Number} entropyStart A number between 0 and 1 (inclusive), which determines the 
 * likelihood of the next starting sequence being picked entirely at random. Default `0`.
 * @property {Number} entropyMiddle A number between 0 and 1 (inclusive), which determines the 
 * likelihood of the next middle sequence being picked entirely at random. Default `0`.
 * @property {Number} entropyEnd A number between 0 and 1 (inclusive), which determines the 
 * likelihood of the next ending sequence being picked entirely at random. Default `0`.
 * @property {String} seed A randomization seed. 
 * @property {ENDING_PICK_MODES} endingPickMode Determines how and if an ending sequence 
 * will be picked for generated words. Default `ENDING_PICK_MODES.RANDOM`.
 */
export default class SequenceConcatenator {
  /**
   * The seeded random number generator. 
   * @type {RandomSeeded}
   * @private
   */
  _rng = undefined;

  /**
   * @param {SequenceProbabilities} probabilities
   * @param {Number | undefined} entropy Optional. A number between 0 and 1 (inclusive), which determines the 
   * likelihood of the next sequence being picked entirely at random. Default `0`.
   * @param {Number | undefined} entropyStart Optional. A number between 0 and 1 (inclusive), which determines the 
   * likelihood of the next starting sequence being picked entirely at random. Default `0`.
   * @param {Number | undefined} entropyMiddle Optional. A number between 0 and 1 (inclusive), which determines the 
   * likelihood of the next middle sequence being picked entirely at random. Default `0`.
   * @param {Number | undefined} entropyEnd Optional. A number between 0 and 1 (inclusive), which determines the 
   * likelihood of the next ending sequence being picked entirely at random. Default `0`.
   * @param {String | undefined} seed Optional. A randomization seed. 
   * @param {ENDING_PICK_MODES | undefined} endingPickMode Optional. Determines how and if an ending sequence 
   * will be picked for generated words. Default `ENDING_PICK_MODES.RANDOM`.
   */
  constructor(args = {}) {
    this.probabilities = args.probabilities;

    this.entropy = args.entropy ?? 0.0;
    this.entropyStart = args.entropyStart ?? 0.0;
    this.entropyMiddle = args.entropyMiddle ?? 0.0;
    this.entropyEnd = args.entropyEnd ?? 0.0;
    this.seed = args.seed ?? foundry.utils.randomID(32);
    this.endingPickMode = args.endingPickMode ?? ENDING_PICK_MODES.RANDOM,
    
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
    let resultLength = startingSequence.sequenceChars.length;

    while (resultLength < targetLength) {
      const nextSequence = this._pickFollowingOf(previousSequence);

      resultingSequences.push(nextSequence);
      resultLength += nextSequence.sequenceChars.length;
      
      previousSequence = nextSequence;
    }

    let endingSequence = undefined;
    if (this.endingPickMode === ENDING_PICK_MODES.RANDOM) {
      endingSequence = this._pickEnd();
    } else if (this.endingPickMode === ENDING_PICK_MODES.FOLLOW_BRANCH) {
      const lastPickedSequence = resultingSequences[resultingSequences.length - 1];
      endingSequence = this._pickEndByBranchFollow(lastPickedSequence);
    }
    if (endingSequence !== undefined) {
      if (resultLength + endingSequence.sequenceChars.length > targetLength) {
      const removed = resultingSequences.splice(resultingSequences.length - 1, 1)[0];
        resultLength -= removed.sequenceChars.length;
      }
      resultingSequences.push(endingSequence);
    }

    return resultingSequences.map(it => it.sequenceChars).join("");
  }

  /**
   * Picks and returns a random starting sequence. 
   * @returns {ProbableSequence}
   * @private
   */
  _pickStart() {
    return this._pickSequenceFrom(this.probabilities.starts, this.entropyStart);
  }

  /**
   * Picks and returns a random ending sequence. 
   * @returns {ProbableSequence}
   * @private
   */
  _pickEnd() {
    return this._pickSequenceFrom(this.probabilities.endings, this.entropyEnd);
  }
  
  /**
   * Follows the given branch, by randomly picking the next sequence and if it 
   * is an ending sequence, returning it. Or, if it isn't an ending sequence, 
   * will call itself (recurse) again, with the picked sequence.
   * @param {ProbableSequence} sequence
   * @returns {ProbableSequence}
   * @private
   */
  _pickEndByBranchFollow(sequence) {
    const next = this._pickFollowingOf(sequence);
    if (this.probabilities.endings.find(it => it.sequenceChars === sequence.sequenceChars) !== undefined) {
      return next;
    } else {
      return this._pickEndByBranchFollow(next);
    }
  }
  
  /**
   * Picks and returns one of the sequences that can follow the given sequence. 
   * 
   * If the given sequence doesn't have any sequences that follow it, 
   * then a random sequence will be picked, instead. 
   * @param {ProbableSequence} sequence
   * @returns {ProbableSequence}
   * @private
   */
  _pickFollowingOf(sequence) {
    const branch = this.probabilities.branches.find(it => it.sequenceChars === sequence.sequenceChars);

    if (branch !== undefined && branch.branches.length > 0) {
      return this._pickSequenceFrom(branch.branches, this.entropyMiddle);
    } else {
      return this._pickSequenceFrom(this.probabilities.branches, this.entropyMiddle);
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
      return this._getMatchingSequenceFrom(this.probabilities.sequences, rnd);
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
