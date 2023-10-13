import ObservableField from "../../common/observables/observable-field.mjs";
import ObservationPropagator from "../../common/observables/observation-propagator.mjs";
import WordGeneratorApplication from "../../presentation/application/word-generator-application/word-generator-application.mjs";
import { ENDING_PICK_MODES } from "../generator/concatenation/sequence-concatenator.mjs";
import WordGenerator from "../generator/generator.mjs";
import AbstractSpellingStrategy from "../generator/postprocessing/abstract-spelling-strategy.mjs";
import { NoneSpellingStrategy } from "../generator/postprocessing/none-spelling-strategy.mjs";
import AbstractSamplingStrategy from "../generator/sampling/abstract-sampling-strategy.mjs";
import { WordListSamplingStrategy } from "../generator/sampling/word-list-sampling-strategy.mjs";
import AbstractSequencingStrategy from "../generator/sequencing/abstract-sequencing-strategy.mjs";
import { CharDepthSequencingStrategy } from "../generator/sequencing/char-depth-sequencing-strategy.mjs";

/**
 * Represents the settings (sample set, sequencing strategy, minimum length, 
 * maximum length, etc.) for a word generator item. 
 * 
 * @property {String} id Unique ID. 
 * * Read-only
 * @property {ObservableField<String | undefined>} name Human readable name. 
 * @property {ObservableField<Number>} targetLengthMin The target minimum length that generated texts should be. 
 * @property {ObservableField<Number>} targetLengthMax The target maximum length that generated texts should be. 
 * @property {ObservableField<String>} seed A seed for the randomization. 
 * @property {ObservableField<Number | undefined>} entropy A number between 0 and 1 (inclusive), which determines the 
 * randomness of words, in general. 
 * * default 0. 
 * @property {ObservableField<Number | undefined>} entropyStart A number between 0 and 1 (inclusive), which determines the 
 * randomness of starting sequences. 
 * * default 0. 
 * @property {ObservableField<Number | undefined>} entropyMiddle A number between 0 and 1 (inclusive), which determines the 
 * randomness of middle sequences. 
 * * default 0. 
 * @property {ObservableField<Number | undefined>} entropyEnd A number between 0 and 1 (inclusive), which determines the 
 * randomness of ending sequences. 
 * * default 0. 
 * @property {ObservableField<ENDING_PICK_MODES>} endingPickMode Determines how and if an ending sequence 
 * will be picked for generated words. 
 * 
 * @property {ObservableField<AbstractSamplingStrategy>} samplingStrategy The sampling strategy to use. 
 * @property {ObservableField<AbstractSequencingStrategy>} sequencingStrategy The sequencing strategy to use. 
 * @property {ObservableField<AbstractSpellingStrategy>} spellingStrategy The spelling post-processing strategy to use. 
 * 
 * 
 * @property {ObservableField<Boolean>} isExpanded If `true`, the entry is to be rendered fully. Otherwise, 
 * it is rendered collapsed. 
 * 
 * @property {ObservableField<ObservableWordGeneratorFolder | undefined>} parent Parent folder, if there is one. 
 */
export default class ObservableWordGeneratorItem {
  /**
   * @param {String | undefined} args.id Unique ID. 
   * * By default, generates a new id. 
   * @param {String | undefined} args.name Human readable name. 
   * @param {Number | undefined} args.targetLengthMin The target minimum length that generated texts should be. 
   * * default `3`
   * @param {Number | undefined} args.targetLengthMax The target maximum length that generated texts should be. 
   * * default `10`
   * @param {String | undefined} args.seed A seed for the randomization. 
   * @param {Number | undefined} args.entropy A number between 0 and 1 (inclusive), which determines the 
   * randomness of words, in general. 
   * * default 0. 
   * @param {Number | undefined} args.entropyStart A number between 0 and 1 (inclusive), which determines the 
   * randomness of starting sequences. 
   * * default 0. 
   * @param {Number | undefined} args.entropyMiddle A number between 0 and 1 (inclusive), which determines the 
   * randomness of middle sequences. 
   * * default 0. 
   * @param {Number | undefined} args.entropyEnd A number between 0 and 1 (inclusive), which determines the 
   * randomness of ending sequences. 
   * * default 0. 
   * @param {ENDING_PICK_MODES | undefined} args.endingPickMode Determines how and if an ending sequence 
   * will be picked for generated words. 
   * 
   * @param {AbstractSamplingStrategy | undefined} args.samplingStrategy The sampling strategy to use. 
   * * default `WordListSamplingStrategy`
   * @param {AbstractSequencingStrategy | undefined} args.sequencingStrategy The sequencing strategy to use. 
   * * default `CharDepthSequencingStrategy`
   * @param {AbstractSpellingStrategy | undefined} args.spellingStrategy The spelling post-processing strategy to use. 
   * * default `NoneSpellingStrategy`
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
    this.targetLengthMin = new ObservableField({ value: args.targetLengthMin ?? 3 });
    this.targetLengthMax = new ObservableField({ value: args.targetLengthMax ?? 10 });
    this.seed = new ObservableField({ value: args.seed });
    this.entropy = new ObservableField({ value: args.entropy ?? 0 });
    this.entropyStart = new ObservableField({ value: args.entropyStart ?? 0 });
    this.entropyMiddle = new ObservableField({ value: args.entropyMiddle ?? 0 });
    this.entropyEnd = new ObservableField({ value: args.entropyEnd ?? 0 });
    this.endingPickMode = new ObservableField({ value: args.endingPickMode ?? ENDING_PICK_MODES.RANDOM });

    this.samplingStrategy = new ObservableField({ value: args.samplingStrategy ?? new WordListSamplingStrategy({ id: `${this.id}-sampling` }) });
    this.sequencingStrategy = new ObservableField({ value: args.sequencingStrategy ?? new CharDepthSequencingStrategy({ id: `${this.id}-sequencing` }) });
    this.spellingStrategy = new ObservableField({ value: args.spellingStrategy ?? new NoneSpellingStrategy({ id: `${this.id}-spelling` }) });

    this.isExpanded = new ObservableField({ value: args.isExpanded ?? false });
    this.parent = new ObservableField({ value: args.parent });

    this.parent.onChange((field, oldValue, newValue) => {
      if (oldValue !== undefined) {
        oldValue.generators.remove(this);
      }
      if (newValue !== undefined) {
        newValue.generators.add(this);
      }
    });

    this.propagator = new ObservationPropagator(this, [
      this.name,
      this.targetLengthMin,
      this.targetLengthMax,
      this.seed,
      this.entropy,
      this.entropyStart,
      this.entropyMiddle,
      this.entropyEnd,
      this.endingPickMode,

      this.samplingStrategy,
      this.sequencingStrategy,
      this.spellingStrategy,

      this.isExpanded,
      this.parent,
    ]);
  }

  /**
   * Creates a new `WordGenerator` instance, using the settings represented by this object. 
   * 
   * @returns {WordGenerator}
   */
  toGenerator() {
    return new WordGenerator({
      targetLengthMin: this.targetLengthMin.value,
      targetLengthMax: this.targetLengthMax.value,
      seed: this.seed.value,
      entropy: this.entropy.value,
      entropyStart: this.entropyStart.value,
      entropyMiddle: this.entropyMiddle.value,
      entropyEnd: this.entropyEnd.value,
      endingPickMode: this.endingPickMode.value,
      
      samplingStrategy: this.samplingStrategy.value,
      sequencingStrategy: this.sequencingStrategy.value,
      spellingStrategy: this.spellingStrategy.value,
    });
  }

  /**
   * Returns the given number of results, randomly generated, 
   * based on the parameters of the generator. 
   * 
   * @param {Number} count The number of results to generate. 
   * 
   * @returns {Array<String>} A list of generated results.
   * 
   * @async
   */
  async generate(count) {
    const generator = this.toGenerator();
    return await generator.generate(count);
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
    let samplingStrategy;
    if (obj.samplingStrategy !== undefined && obj.samplingStrategy.definitionId !== undefined) {
      samplingStrategy = WordGeneratorApplication.registeredSamplingStrategies.newInstanceOf(
        obj.samplingStrategy.definitionId,
        {
          ...obj.samplingStrategy.settings,
          id: obj.id,
        }
      );
    }
    
    let sequencingStrategy;
    if (obj.sequencingStrategy !== undefined && obj.sequencingStrategy.definitionId !== undefined) {
      sequencingStrategy = WordGeneratorApplication.registeredSequencingStrategies.newInstanceOf(
        obj.sequencingStrategy.definitionId,
        {
          ...obj.sequencingStrategy.settings,
          id: obj.id,
        }
      );
    }

    let spellingStrategy;
    if (obj.spellingStrategy !== undefined && obj.spellingStrategy.definitionId !== undefined) {
      spellingStrategy = WordGeneratorApplication.registeredSpellingStrategies.newInstanceOf(
        obj.spellingStrategy.definitionId,
        {
          ...obj.spellingStrategy.settings,
          id: obj.id,
        }
      );
    }

    return new ObservableWordGeneratorItem({
      id: obj.id,
      name: obj.name,
      targetLengthMin: obj.targetLengthMin,
      targetLengthMax: obj.targetLengthMax,
      seed: obj.seed,
      entropy: obj.entropy,
      entropyStart: obj.entropyStart,
      entropyMiddle: obj.entropyMiddle,
      entropyEnd: obj.entropyEnd,
      endingPickMode: obj.endingPickMode,
      samplingStrategy: samplingStrategy,
      sequencingStrategy: sequencingStrategy,
      spellingStrategy: spellingStrategy,
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
      targetLengthMin: this.targetLengthMin.value,
      targetLengthMax: this.targetLengthMax.value,
      seed: this.seed.value,
      entropy: this.entropy.value,
      entropyStart: this.entropyStart.value,
      entropyMiddle: this.entropyMiddle.value,
      entropyEnd: this.entropyEnd.value,
      endingPickMode: this.endingPickMode.value,
      samplingStrategy: this.samplingStrategy.value.toDto(),
      sequencingStrategy: this.sequencingStrategy.value.toDto(),
      spellingStrategy: this.spellingStrategy.value.toDto(),
    };
  }
}
