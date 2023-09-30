import ObservableCollection from "../../common/observables/observable-collection.mjs";
import ObservableField from "../../common/observables/observable-field.mjs";
import WordGeneratorApplication from "../../presentation/application/word-generator-application/word-generator-application.mjs";
import { ENDING_PICK_MODES } from "../generator/concatenation/sequence-concatenator.mjs";
import WordGenerator from "../generator/generator.mjs";
import CharDepthSequencingStrategy from "../generator/sequencing/char-depth-sequencing-strategy.mjs";

/**
 * Represents the settings (sample set, sequencing strategy, minimum length, 
 * maximum length, etc.) for a word generator item. 
 * 
 * @property {String} id Unique ID. 
 * * Read-only
 * @property {ObservableField<String | undefined>} name Human readable name. 
 * @property {ObservableCollection<String>} sampleSet A sample-set to draw inspiration from. 
 * @property {ObservableField<String>} sampleSetSeparator The string used to split samples. This splitting happens **prior** to sequencing. 
 * @property {ObservableField<Number>} depth The depth to use with the sequencing strategy. 
 * 
 * @property {ObservableField<Number>} targetLengthMin The target minimum length that generated texts should be. 
 * @property {ObservableField<Number>} targetLengthMax The target maximum length that generated texts should be. 
 * 
 * @property {ObservableField<String>} sequencingStrategyId ID of the sequencing strategy to use. 
 * @property {ObservableCollection<StrategySetting>} sequencingStrategySettings Settings of the sequencing strategy. 
 * 
 * @property {ObservableField<String | undefined>} spellingStrategyId ID of the spelling post-processing strategy to use. 
 * @property {ObservableCollection<StrategySetting> | undefined} spellingStrategySettings Settings of the spelling post-processing strategy. 
 * 
 * @property {String} seed A seed for the randomization. 
 * 
 * @property {ObservableField<Number | undefined>} entropy A number between 0 and 1 (inclusive), which determines the 
 * randomness of words, in general. Default 0. 
 * @property {ObservableField<Number | undefined>} entropyStart A number between 0 and 1 (inclusive), which determines the 
 * randomness of starting sequences. Default 0. 
 * @property {ObservableField<Number | undefined>} entropyMiddle A number between 0 and 1 (inclusive), which determines the 
 * randomness of middle sequences. Default 0. 
 * @property {ObservableField<Number | undefined>} entropyEnd A number between 0 and 1 (inclusive), which determines the 
 * randomness of ending sequences. Default 0. 
 * 
 * @property {ObservableField<ENDING_PICK_MODES>} endingPickMode Determines how and if an ending sequence 
 * will be picked for generated words. 
 * 
 * @property {ObservableField<Boolean>} isExpanded If `true`, the entry is to be rendered fully. Otherwise, 
 * it is rendered collapsed. 
 * 
 * @property {ObservableField<ObservableWordGeneratorFolder | undefined>} parent Parent folder, if there is one. 
 */
export default class ObservableWordGeneratorItem {
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
   * @param {Boolean | undefined} args.isExpanded If `true`, the entry is to be rendered fully. Otherwise, 
   * it is rendered collapsed. 
   * * Default `false`
   * 
   * @param {ObservableWordGeneratorFolder | undefined} parent Parent folder, if there is one. 
   */
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);
    this.name = new ObservableField({ value: args.name });

    this.sampleSet = new ObservableCollection({ elements: (args.sampleSet ?? []) });
    this.sampleSetSeparator = new ObservableField({ value: args.sampleSetSeparator ?? "," });

    this.depth = new ObservableField({ value: args.depth ?? 3 });

    this.targetLengthMin = new ObservableField({ value: args.targetLengthMin ?? 3 });
    this.targetLengthMax = new ObservableField({ value: args.targetLengthMax ?? 10 });
    
    this.sequencingStrategyId = new ObservableField({ value: 
      args.sequencingStrategy = new CharDepthSequencingStrategy().getDefinitionID() 
    });
    this.sequencingStrategySettings = new ObservableCollection({ elements: 
      args.sequencingStrategySettings ?? new CharDepthSequencingStrategy().getSettings()
    }),
    
    this.spellingStrategyId = new ObservableField({ value: args.spellingStrategyId ?? undefined });
    this.spellingStrategySettings = new ObservableCollection({ elements: args.spellingStrategySettings ?? undefined });

    this.seed = new ObservableField({ value: args.seed });

    this.entropy = new ObservableField({ value: args.entropy ?? 0 });
    this.entropyStart = new ObservableField({ value: args.entropyStart ?? 0 });
    this.entropyMiddle = new ObservableField({ value: args.entropyMiddle ?? 0 });
    this.entropyEnd = new ObservableField({ value: args.entropyEnd ?? 0 });

    this.endingPickMode = new ObservableField({ value: args.endingPickMode ?? ENDING_PICK_MODES.RANDOM });

    this.isExpanded = new ObservableField({ value: args.isExpanded ?? false });

    this.parent = new ObservableField({ value: args.parent });

    this.parent.onChange((field, oldValue, newValue) => {
      if (oldValue !== undefined) {
        oldValue.items.remove(this);
      }
      if (newValue !== undefined) {
        newValue.items.add(this);
      }
    });
  }

  /**
   * Creates a new `WordGenerator` instance, using the settings represented by this object. 
   * 
   * @returns {WordGenerator}
   */
  toGenerator() {
    // Get new sequencing strategy instance. 
    const sequencingStrategy = WordGeneratorApplication.registeredSequencingStrategies.newInstanceOf(
      this.sequencingStrategyId.value,
      this.sequencingStrategySettings.getAll(),
    );

    // Get new spelling strategy instance, if possible. 
    let spellingStrategy = undefined;
    if (this.spellingStrategyId.value !== undefined) {
      spellingStrategy = WordGeneratorApplication.registeredSpellingStrategies.newInstanceOf(
        this.spellingStrategyId.value,
        this.spellingStrategySettings.getAll(),
      );
    }

    return new WordGenerator({
      depth: this.depth.value,
      sampleSet: this.sampleSet.getAll(),

      targetLengthMin: this.targetLengthMin.value,
      targetLengthMax: this.targetLengthMax.value,

      sequencingStrategy: sequencingStrategy,
      spellingStrategy: spellingStrategy,

      seed: this.seed.value,
      
      entropy: this.entropy.value,
      entropyStart: this.entropyStart.value,
      entropyMiddle: this.entropyMiddle.value,
      entropyEnd: this.entropyEnd.value,
      
      endingPickMode: this.endingPickMode.value,
    });
  }

  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj 
   * @param {ObservableWordGeneratorFolder | undefined} parent 
   * 
   * @returns {ObservableWordGeneratorItem}
   * 
   * @static
   */
  static fromDto(obj, parent) {
    return new ObservableWordGeneratorItem({
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
      parent: parent,
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
      name: this.name.value,
      sampleSet: this.sampleSet.getAll(),
      sampleSetSeparator: this.sampleSetSeparator.value,
      depth: this.depth.value,
      targetLengthMin: this.targetLengthMin.value,
      targetLengthMax: this.targetLengthMax.value,
      sequencingStrategyId: this.sequencingStrategyId.value,
      sequencingStrategySettings: this.sequencingStrategySettings.getAll(),
      spellingStrategyId: this.spellingStrategyId.value,
      spellingStrategySettings: this.spellingStrategySettings.getAll(),
      seed: this.seed.value,
      entropy: this.entropy.value,
      entropyStart: this.entropyStart.value,
      entropyMiddle: this.entropyMiddle.value,
      entropyEnd: this.entropyEnd.value,
      endingPickMode: this.endingPickMode.value,
    };
  }
}
