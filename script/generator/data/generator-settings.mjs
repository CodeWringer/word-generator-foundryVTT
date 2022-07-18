import { ENDING_PICK_MODES } from "../concatenation/sequence-concatenator.mjs";
import BeginningCapitalsSpellingStrategy from "../postprocessing/beginning-capitals-strategy.mjs";
import CharDepthSequencingStrategy from "../sequencing/char-depth-sequencing-strategy.mjs";
import DelimiterSequencingStrategy from "../sequencing/delimiter-sequencing-strategy.mjs";

/**
 * Represents the settings (sample set, sequencing strategy, minimum length, 
 * maximum length, etc.) for a word generator. 
 * @property {String} id
 * @property {String | undefined} name
 * @property {Array<String>} sampleSet
 * @property {Number} depth
 * @property {Number} targetLengthMin
 * @property {Number} targetLengthMax
 * @property {SEQUENCING_STRATEGIES} sequencingStrategy
 * @property {SPELLING_STRATEGIES | undefined} spellingStrategy
 * @property {Number} entropy
 * @property {Number} entropyStart
 * @property {Number} entropyMiddle
 * @property {Number} entropyEnd
 * @property {ENDING_PICK_MODES} endingPickMode
 */
export default class GeneratorSettings {
  /**
 * @param {String | undefined} args.id
 * @param {String | undefined} args.name
 * @param {Array<String> | undefined} args.sampleSet
 * @param {Number | undefined} args.depth
 * @param {Number | undefined} args.targetLengthMin
 * @param {Number | undefined} args.targetLengthMax
 * @param {SEQUENCING_STRATEGIES | undefined} args.sequencingStrategy
 * @param {SPELLING_STRATEGIES | undefined} args.spellingStrategy
 * @param {Number | undefined} args.entropy
 * @param {Number | undefined} args.entropyStart
 * @param {Number | undefined} args.entropyMiddle
 * @param {Number | undefined} args.entropyEnd
 * @param {ENDING_PICK_MODES | undefined} args.endingPickMode
   */
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);
    this.name = args.name;
    this.sampleSet = args.sampleSet ?? [];
    this.depth = args.depth ?? 3;
    this.targetLengthMin = args.targetLengthMin ?? 3;
    this.targetLengthMax = args.targetLengthMax ?? 10;
    this.sequencingStrategy = args.sequencingStrategy = SEQUENCING_STRATEGIES.CHAR_DEPTH;
    this.spellingStrategy = args.spellingStrategy ?? SPELLING_STRATEGIES.NONE;
    this.entropy = args.entropy ?? 0;
    this.entropyStart = args.entropyStart ?? 0;
    this.entropyMiddle = args.entropyMiddle ?? 0;
    this.entropyEnd = args.entropyEnd ?? 0;
    this.endingPickMode = args.endingPickMode ?? ENDING_PICK_MODES.RANDOM;
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
      entropy: obj.entropy,
      entropyStart: obj.entropyStart,
      entropyMiddle: obj.entropyMiddle,
      entropyEnd: obj.entropyEnd,
      endingPickMode: obj.endingPickMode,
    });
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      sampleSet: this.sampleSet,

      targetLengthMin: this.targetLengthMin,
      targetLengthMax: this.targetLengthMax,

      sequencingStrategy: this.sequencingStrategy,
      sequencingStrategySettings: this.sequencingStrategy.getSettings(),

      spellingStrategy: this.spellingStrategy,
      spellingStrategySettings: (this.spellingStrategy !== undefined) ? this.spellingStrategy.getSettings() : undefined,

      entropy: this.entropy,
      entropyStart: this.entropyStart,
      entropyMiddle: this.entropyMiddle,
      entropyEnd: this.entropyEnd,
      
      endingPickMode: this.endingPickMode,
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
    } else if (strategy === SEQUENCING_STRATEGIES.DELIMITER) {
      return new DelimiterSequencingStrategy(
        settings.delimiter,
      );
    } else {
      throw new Error(`Cannot get sequencing strategy for '${strategy}'`);
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
    return undefined;
  }
}

export const SEQUENCING_STRATEGIES = {
  CHAR_DEPTH: "CHAR_DEPTH",
  DELIMITER: "DELIMITER",
}

export const SPELLING_STRATEGIES = {
  NONE: "NONE",
  CAPITALIZE_FIRST_LETTER: "CAPITALIZE_FIRST_LETTER",
}
