import { isInteger } from "../../util/validation.mjs";
import { StrategySettingValueTypes } from "../strategy-setting.mjs";
import { StrategySetting } from "../strategy-setting.mjs";
import AbstractSequencingStrategy from "./abstract-sequencing-strategy.mjs";
import Sequence from "./sequence.mjs";

/**
 * This sequencing strategy creates sequences of characters, based on a given depth 
 * (= character count/length). 
 * @property {Number | undefined} depth The depth of the look-back for the algorithm. 
 * Higher numbers result in results more similar to the provided sample set, 
 * but also in less variety. 
 * * Default `1`.
 * @property {Boolean | undefined} preserveCase If true, will not transform found sequences 
 * to lower case, but instead preserve the casing found in the sequence. 
 * * Default `false`. 
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
   * If true, will not transform found sequences to lower case, but instead preserve 
   * the casing found in the sequences. 
   * @type {Boolean}
   * @default false
   */
  preserveCase = false;

  /**
   * @param {Number | undefined} depth The depth of the look-back for the algorithm. 
   * Higher numbers result in results more similar to the provided sample set, 
   * but also in less variety. 
   * 
   * Note, that a number less than 1 will result in an error. 
   * @param {Boolean | undefined} preserveCase If true, will not transform found sequences 
   * to lower case, but instead preserve the casing found in the sequence. Default false. 
   * 
   * @throws {Error} Thrown, if the passed parameter 'depth' is not an integer greater 0. 
   */
  constructor(depth = 1, preserveCase = false) {
    super();

    if (isInteger(depth) !== true || parseInt(depth) <= 0) {
      throw new Error("`args.depth` must be an integer, greater or equal to 1!");
    }

    this._depth = depth;
    this.preserveCase = preserveCase ?? false;
  }

  /** @override */
  getDefinitionID() {
    return "CharDepthSequencingStrategy";
  }

  /** @override */
  getHumanReadableName() {
    return game.i18n.localize("wg.generator.sequencingStrategies.charDepth");
  }

  /** @override */
  getSequencesOfSet(sampleSet) {
    return super.getSequencesOfSet(sampleSet);
  }
  
  /** @override */
  getSequencesOfSample(sample) {
    const sequences = [];
    for (let i = 0; i < sample.length; i += this.depth) {
      let chars = sample.substring(i, i + this.depth);

      if (this.preserveCase !== true) {
        chars = chars.toLowerCase();
      }

      const hasFollowingChar = (i + 1) < sample.length;

      const currentSequence = new Sequence({
        chars: chars,
        isBeginning: i === 0,
        isMiddle: i !== 0 && hasFollowingChar === true,
        isEnding: hasFollowingChar !== true
      });

      sequences.push(currentSequence);
    }

    return sequences;
  }

  /** @override */
  getSettings() {
    return [
      new StrategySetting({
        name: "depth",
        localizableName: "wg.generator.depth",
        valueType: StrategySettingValueTypes.INTEGER,
        value: this.depth,
        defaultValue: 1,
      }),
      new StrategySetting({
        name: "preserveCase",
        localizableName: "wg.generator.preserveCase",
        valueType: StrategySettingValueTypes.BOOLEAN,
        value: this.preserveCase,
        defaultValue: false,
      }),
    ];
  }

  /** @override */
  newInstanceWithArgs(args) {
    const depth = args.find(it => it.name === "depth").value;
    const preserveCase = args.find(it => it.name === "preserveCase").value;

    return new CharDepthSequencingStrategy(depth, preserveCase);
  }
}
