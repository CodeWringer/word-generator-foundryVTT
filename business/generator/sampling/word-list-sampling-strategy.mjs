import { StrategySetting, StrategySettingValueTypes } from "../strategy-setting.mjs";
import AbstractSamplingStrategy from "./abstract-sampling-strategy.mjs";

/**
 * This sampling strategy provides a list of words. 
 * 
 * @property {String} separator This separator is used to determine word boundaries. 
 */
export default class WordListSamplingStrategy extends AbstractSamplingStrategy {
  /**
   * @param {String | undefined} separator The separator sequence that is used to  
   * determine word boundaries. 
   */
  constructor(separator = ",") {
    super();

    this.separator = separator;
  }
  
  /** @override */
  getDefinitionID() {
    return "WordListSamplingStrategy";
  }

  /** @override */
  getHumanReadableName() {
    return game.i18n.localize("wg.generator.samplingStrategies.wordList");
  }

  /** @override */
  getSettings() {
    return [
      new StrategySetting({
        name: "separator",
        localizableName: "wg.generator.sampleSet.separator",
        valueType: StrategySettingValueTypes.STRING,
        defaultValue: ",",
      }),
    ];
  }

  /** @override */
  newInstanceWithArgs(args) {
    const separator = args.find(it => it.name === "separator").value;

    return new WordListSamplingStrategy(separator);
  }

  /**
   * Returns a sample set. 
   * 
   * @returns {Array<String>}
   * 
   * @override
   * @async
   */
  async getSamples() {
    throw new Error("Not implemented");
  }
}