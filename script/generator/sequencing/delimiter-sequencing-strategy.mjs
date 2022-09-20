import { StrategySettingValueTypes } from "../strategy-setting.mjs";
import { StrategySetting } from "../strategy-setting.mjs";
import AbstractSequencingStrategy from "./abstract-sequencing-strategy.mjs";
import Sequence from "./sequence.mjs";

/**
 * This sequencing strategy creates sequences of characters, based on a given 
 * delimiter (= separator). 
 * @property {String} delimiter This delimiter is used to separate chars into sequences. 
 * @property {Boolean} preserveCase If true, will not transform found sequences 
 * to lower case, but instead preserve the casing found in the sequence. Default false. 
 */
export default class DelimiterSequencingStrategy extends AbstractSequencingStrategy {
  /**
   * This delimiter is used to separate chars into sequences. 
   * @type {String}
   */
  delimiter = undefined;

  /**
   * If true, will not transform found sequences to lower case, but instead preserve 
   * the casing found in the sequence. 
   * @type {Boolean}
   * @default false
   */
  preserveCase = false;

  /**
   * @param {String} delimiter This delimiter is used to separate chars into sequences. 
   * @param {Boolean | undefined} preserveCase If true, will not transform found sequences 
   * to lower case, but instead preserve the casing found in the sequence. Default false. 
   */
  constructor(delimiter, preserveCase = false) {
    super();
    if (delimiter === undefined) {
      throw new Error("Parameter delimiter must not be undefined!");
    }

    this.delimiter = delimiter;
    this.preserveCase = preserveCase;
  }

  /** @override */
  getDefinitionID() {
    return "DelimiterSequencingStrategy";
  }

  /** @override */
  getHumanReadableName() {
    return game.i18n.localize("wg.generator.sequencingStrategies.delimiter");
  }

  /** @override */
  getSequencesOfSet(sampleSet) {
    return super.getSequencesOfSet(sampleSet);
  }
  
  /** @override */
  getSequencesOfSample(sample) {
    const sequences = [];
    const splits = sample.split(this.delimiter);
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];

      if (split.length < 1) continue;

      const hasFollowing = i !== (splits.length - 1);
      
      sequences.push(new Sequence({
        chars: this.preserveCase === true ? split : split.toLowerCase(),
        isBeginning: i === 0,
        isMiddle: i !== 0 && hasFollowing === true,
        isEnding: hasFollowing !== true
      }));
    }
    return sequences;
  }

  /** @override */
  getSettings() {
    return [
      new StrategySetting({
        name: "delimiter",
        localizableName: "wg.generator.sequencingStrategies.delimiter",
        valueType: StrategySettingValueTypes.STRING,
        value: this.delimiter,
        defaultValue: ",",
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
    const delimiter = args.find(it => it.name === "delimiter").value;
    const preserveCase = args.find(it => it.name === "preserveCase").value;

    return new DelimiterSequencingStrategy(delimiter, preserveCase);
  }
}
