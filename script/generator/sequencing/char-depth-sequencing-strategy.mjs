import { isInteger } from "../../util/validation.mjs";
import AbstractSequencingStrategy from "./abstract-sequencing-strategy.mjs";
import Sequence from "./sequence.mjs";

/**
 * This sequencing strategy creates sequences of characters, based on a given depth 
 * (= character count/length). 
 */
export default class CharDepthSequencingStrategy extends AbstractSequencingStrategy {
  /**
   * @private
   */
  _depth = undefined;
  /**
   * Returns the provided depth. 
   * @type {Number}
   * @readonly
   */
  get depth() { return this._depth; }

  /**
   * @param {Number} depth The depth of the look-back for the algorithm. 
   * Higher numbers result in more similar results more similar to the provided sample set, 
   * but also in less variety. 
   * 
   * Note, that a number less than 1 will result in an error. 
   * 
   * @throws {Error} Thrown, if the passed parameter 'depth' is not an integer greater 0. 
   */
  constructor(depth = 1) {
    super();

    if (isInteger(depth) !== true || parseInt(depth) <= 0) {
      throw new Error("`args.depth` must be an integer, greater or equal to 1!");
    }

    this._depth = depth;
  }

  /** @override */
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
  
  /** @override */
  getSequencesOfSample(sample) {
    const sequences = [];
    for (let i = 0; i < sample.length; i += this.depth) {
      const chars = sample.substring(i, i + this.depth).toLowerCase();
      const hasFollowingChar = (i + 1) < sample.length;

      sequences.push(new Sequence({
        chars: chars,
        isBeginning: i === 0,
        isMiddle: i !== 0 && hasFollowingChar === true,
        isEnding: hasFollowingChar !== true
      }));
    }
    return sequences;
  }
}
