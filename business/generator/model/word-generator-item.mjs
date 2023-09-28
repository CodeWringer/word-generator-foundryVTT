import { ENDING_PICK_MODES } from "../concatenation/sequence-concatenator.mjs";
import WordGenerator from "../generator.mjs";
import CharDepthSequencingStrategy from "../sequencing/char-depth-sequencing-strategy.mjs";

/**
 * Represents the settings (sample set, sequencing strategy, minimum length, 
 * maximum length, etc.) for a word generator item. 
 * 
 * @property {String} id Unique ID. 
 * @property {String | undefined} name Human readable name. 
 * @property {Array<String>} sampleSet A sample-set to draw inspiration from. 
 * @property {String} sampleSetSeparator The string used to split samples. This splitting happens **prior** to sequencing. 
 * @property {Number} depth The depth to use with the sequencing strategy. 
 * 
 * @property {Number} targetLengthMin The target minimum length that generated texts should be. 
 * @property {Number} targetLengthMax The target maximum length that generated texts should be. 
 * 
 * @property {String} sequencingStrategyId ID of the sequencing strategy to use. 
 * @property {Array<StrategySetting>} sequencingStrategySettings Settings of the sequencing strategy. 
 * 
 * @property {String | undefined} spellingStrategyId ID of the spelling post-processing strategy to use. 
 * @property {Array<StrategySetting> | undefined} spellingStrategySettings Settings of the spelling post-processing strategy. 
 * 
 * @property {String} seed A seed for the randomization. 
 * 
 * @property {Number | undefined} entropy A number between 0 and 1 (inclusive), which determines the 
 * randomness of words, in general. Default 0. 
 * @property {Number | undefined} entropyStart A number between 0 and 1 (inclusive), which determines the 
 * randomness of starting sequences. Default 0. 
 * @property {Number | undefined} entropyMiddle A number between 0 and 1 (inclusive), which determines the 
 * randomness of middle sequences. Default 0. 
 * @property {Number | undefined} entropyEnd A number between 0 and 1 (inclusive), which determines the 
 * randomness of ending sequences. Default 0. 
 * 
 * @property {ENDING_PICK_MODES} endingPickMode Determines how and if an ending sequence 
 * will be picked for generated words. 
 * 
 * @property {Boolean} collapsed If true, the entry is to be rendered collapsed. 
 */
export default class WordGeneratorItem {
  /**
   * @param {String | undefined} args.id Unique ID. 
   * @param {String | undefined} args.name Human readable name. 
   * @param {Array<String> | undefined} args.sampleSet A sample-set to draw inspiration from. 
   * @param {String | undefined} sampleSetSeparator The string used to split samples. This splitting happens **prior** to sequencing. 
   * * Default `,`. 
   * @param {Number | undefined} args.depth 
   * 
   * @param {Number | undefined} args.targetLengthMin
   * @param {Number | undefined} args.targetLengthMax
   * 
   * @param {String | undefined} args.sequencingStrategyId
   * * Default is the id of a `CharDepthSequencingStrategy` type. 
   * @param {Array<StrategySetting> | undefined} args.sequencingStrategySettings
   * 
   * @param {String | undefined} args.spellingStrategyId
   * @param {Array<StrategySetting> | undefined} args.spellingStrategySettings
   * 
   * @param {String | undefined} args.seed
   * 
   * @param {Number | undefined} args.entropy
   * @param {Number | undefined} args.entropyStart
   * @param {Number | undefined} args.entropyMiddle
   * @param {Number | undefined} args.entropyEnd
   * 
   * @param {ENDING_PICK_MODES | undefined} args.endingPickMode
   * 
   * @param {Boolean | undefined} args.collapsed
   */
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);
    this.name = args.name;

    this.sampleSet = args.sampleSet ?? [];
    this.sampleSetSeparator = args.sampleSetSeparator ?? ",";

    this.depth = args.depth ?? 3;

    this.targetLengthMin = args.targetLengthMin ?? 3;
    this.targetLengthMax = args.targetLengthMax ?? 10;
    
    this.sequencingStrategyId = args.sequencingStrategy = new CharDepthSequencingStrategy().getDefinitionID();
    this.sequencingStrategySettings = args.sequencingStrategySettings ?? new CharDepthSequencingStrategy().getSettings(),
    
    this.spellingStrategyId = args.spellingStrategyId ?? undefined;
    this.spellingStrategySettings = args.spellingStrategySettings ?? undefined;

    this.seed = args.seed;

    this.entropy = args.entropy ?? 0;
    this.entropyStart = args.entropyStart ?? 0;
    this.entropyMiddle = args.entropyMiddle ?? 0;
    this.entropyEnd = args.entropyEnd ?? 0;

    this.endingPickMode = args.endingPickMode ?? ENDING_PICK_MODES.RANDOM;

    this.collapsed = args.collapsed ?? false;
  }

  /**
   * Creates a new `WordGenerator` instance, using the settings represented by this object. 
   * 
   * @returns {WordGenerator}
   */
  toGenerator() {
    // Get new sequencing strategy instance. 
    const sequencingStrategy = WordGeneratorApplication.registeredSequencingStrategies.newInstanceOf(
      this.sequencingStrategyId,
      this.sequencingStrategySettings,
    );

    // Get new spelling strategy instance, if possible. 
    let spellingStrategy = undefined;
    if (this.spellingStrategyId !== undefined) {
      spellingStrategy = WordGeneratorApplication.registeredSpellingStrategies.newInstanceOf(
        this.spellingStrategyId,
        this.spellingStrategySettings,
      );
    }

    return new WordGenerator({
      depth: this.depth,
      sampleSet: this.sampleSet,

      targetLengthMin: this.targetLengthMin,
      targetLengthMax: this.targetLengthMax,

      sequencingStrategy: sequencingStrategy,
      spellingStrategy: spellingStrategy,

      seed: this.seed,
      
      entropy: this.entropy,
      entropyStart: this.entropyStart,
      entropyMiddle: this.entropyMiddle,
      entropyEnd: this.entropyEnd,
      
      endingPickMode: this.endingPickMode,
    });
  }

  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj 
   * 
   * @returns {WordGeneratorItem}
   * 
   * @static
   */
  static fromDto(obj) {
    return new WordGeneratorItem({
      id: obj.id,
      name: obj.name,
      sampleSet: obj.sampleSet,
      sampleSetSeparator: obj.sampleSetSeparator,
      depth: obj.depth,
      targetLengthMin: obj.targetLengthMin,
      targetLengthMax: obj.targetLengthMax,
      sequencingStrategyId: obj.sequencingStrategyId,
      sequencingStrategySettings: obj.sequencingStrategySettings,
      spellingStrategyId: obj.spellingStrategyId,
      spellingStrategySettings: obj.spellingStrategySettings,
      seed: obj.seed,
      entropy: obj.entropy,
      entropyStart: obj.entropyStart,
      entropyMiddle: obj.entropyMiddle,
      entropyEnd: obj.entropyEnd,
      endingPickMode: obj.endingPickMode,
      collapsed: obj.collapsed,
    });
  }

  /**
   * Returns a data transfer object representation of this instance. 
   * 
   * @returns {Object}
   */
  toDto() {
    return {
      id: this.id,
      name: this.name,
      sampleSet: this.sampleSet,
      sampleSetSeparator: this.sampleSetSeparator,
      depth: this.depth,
      targetLengthMin: this.targetLengthMin,
      targetLengthMax: this.targetLengthMax,
      sequencingStrategyId: this.sequencingStrategyId,
      sequencingStrategySettings: this.sequencingStrategySettings,
      spellingStrategyId: this.spellingStrategyId,
      spellingStrategySettings: this.spellingStrategySettings,
      seed: this.seed,
      entropy: this.entropy,
      entropyStart: this.entropyStart,
      entropyMiddle: this.entropyMiddle,
      entropyEnd: this.entropyEnd,
      endingPickMode: this.endingPickMode,
      collapsed: this.collapsed,
    };
  }
}
