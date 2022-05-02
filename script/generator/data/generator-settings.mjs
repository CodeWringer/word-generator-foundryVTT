import BeginningCapitalsSpellingStrategy from "../postprocessing/beginning-capitals-strategy.mjs";
import CharDepthSequencingStrategy from "../sequencing/char-depth-sequencing-strategy.mjs";

/**
 * Represents the settings (sample set, sequencing strategy, minimum length, 
 * maximum length, etc.) for a word generator. 
 * @property {String} id
 * @property {String} name
 * @property {Array<String>} sampleSet
 * @property {Number} depth
 * @property {Number} targetLengthMin
 * @property {Number} targetLengthMax
 * @property {SEQUENCING_STRATEGIES} sequencingStrategy
 * @property {CAPITALIZE_FIRST_LETTER | undefined} spellingStrategy
 */
export default class GeneratorSettings {
  constructor(args = {}) {
    this.id = args.id;
    this.name = args.name;
    this.sampleSet = args.sampleSet;
    this.targetLengthMin = args.targetLengthMin;
    this.targetLengthMax = args.targetLengthMax;
    this.sequencingStrategy = args.sequencingStrategy;
    this.spellingStrategy = args.spellingStrategy;
  }

  static fromObject(obj) {
    if (obj === undefined) return undefined;

    return new GeneratorSettings({
      id: obj.id,
      name: obj.name,
      sampleSet: obj.sampleSet,
      targetLengthMin: obj.targetLengthMin,
      targetLengthMax: obj.targetLengthMax,
      sequencingStrategy: GeneratorSettings._getSequencingStrategy(
        obj.sequencingStrategy,
        obj.sequencingStrategySettings
      ),
      spellingStrategy: GeneratorSettings._getSpellingStrategy(
        obj.spellingStrategy,
        obj.spellingStrategySettings
      ),
    });
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      sampleSet: this.sampleSet,
      targetLengthMin: this.targetLengthMin,
      targetLengthMax: this.targetLengthMax,
      sequencingStrategy: SEQUENCING_STRATEGIES.CHAR_DEPTH, // TODO: Infer, somehow
      sequencingStrategySettings: this.sequencingStrategy.getSettings(),
      spellingStrategy: SPELLING_STRATEGIES.CAPITALIZE_FIRST_LETTER, // TODO: Infer, somehow
      spellingStrategySettings: this.spellingStrategy.getSettings(),
    };
  }

  /**
   * @param {SEQUENCING_STRATEGIES} strategy 
   * @param {Object} settings 
   * @private
   */
  static _getSequencingStrategy(strategy, settings) {
    if (strategy === SEQUENCING_STRATEGIES.CHAR_DEPTH) {
      return new CharDepthSequencingStrategy(
        settings.depth,
        settings.preserveCase
      );
    }
  }

  /**
   * @param {SPELLING_STRATEGIES} strategy 
   * @param {Object} settings 
   * @private
   */
  static _getSpellingStrategy(strategy, settings) {
    if (strategy === SPELLING_STRATEGIES.CAPITALIZE_FIRST_LETTER) {
      return new BeginningCapitalsSpellingStrategy();
    }
  }
}

export const SEQUENCING_STRATEGIES = {
  CHAR_DEPTH: "CHAR_DEPTH",
}

export const SPELLING_STRATEGIES = {
  CAPITALIZE_FIRST_LETTER: "CAPITALIZE_FIRST_LETTER",
}
