import ObservableField from "../../../common/observables/observable-field.mjs";
import AbstractEntityPresenter from "../../../presentation/abstract-entity-presenter.mjs";
import AbstractStrategyDefinition from "../common/abstract-strategy-definition.mjs";
import AbstractSequencingStrategy from "./abstract-sequencing-strategy.mjs";
import Sequence from "./sequence.mjs";

/**
 * Defines a `DelimiterSequencingStrategy`. 
 * 
 * @extends AbstractStrategyDefinition
 */
export class DelimiterSequencingStrategyDefinition extends AbstractStrategyDefinition {
  /** @override */
  get id() { return "DelimiterSequencingStrategy" }

  /** @override */
  get localizedName() { return game.i18n.localize("wg.generator.sequencingStrategies.delimiter"); }
  
  /** @override */
  newInstance(settings) {
    return new DelimiterSequencingStrategy(settings);
  }
}

/**
 * This sequencing strategy creates sequences of characters, based on a given 
 * delimiter (= separator). 
 * 
 * @property {ObservableField<String>} delimiter This delimiter is used to separate chars into sequences. 
 * * default `","`
 * @property {ObservableField<Boolean>} preserveCase If true, will not transform found sequences 
 * to lower case, but instead preserve the casing found in the sequence. 
 * * default `false`
 * 
 * @extends AbstractSequencingStrategy
 */
export class DelimiterSequencingStrategy extends AbstractSequencingStrategy {
  /** @override */
  static fromDto(dto) {
    return new DelimiterSequencingStrategy({
      delimiter: dto.delimiter,
      preserveCase: dto.preserveCase,
    });
  }

  /** @override */
  get definitionId() { return new DelimiterSequencingStrategyDefinition().id; }

  /** @override */
  get id() { return this._id; }

  /** @override */
  get settingsPresenter() { return this._settingsPresenter; }

  /** @override */
  get localizedInfoText() { return game.i18n.localize("wg.generator.sequencingStrategy.infoHint"); }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id ID of this strategy. 
   * * By default, generates a new ID. 
   * @param {String | undefined} args.delimiter This delimiter is used to separate chars into sequences. 
   * * default `","`
   * @param {Boolean | undefined} args.preserveCase If true, will not transform found sequences 
   * to lower case, but instead preserve the casing found in the sequence. Default false. 
   * * default `false`
   */
  constructor(args = {}) {
    super();

    this._id = args.id ?? foundry.utils.randomID(16);
    this.delimiter = new ObservableField({ value: args.delimiter ?? "," });
    this.preserveCase = new ObservableField({ value: args.preserveCase ?? false });

    this._settingsPresenter = new DelimiterSequencingStrategySettingsPresenter({
      application: args.application,
      entity: this,
    });
  }

  /** @override */
  toDto() {
    return {
      definitionId: this.definitionId,
      settings: {
        delimiter: this.delimiter.value,
        preserveCase: this.preserveCase.value,
      },
    }
  }
  
  /** @override */
  async getSequencesOfSet(sampleSet) {
    return super.getSequencesOfSet(sampleSet);
  }
  
  /** @override */
  getSequencesOfSample(sample) {
    const sequences = [];
    const splits = sample.split(this.delimiter.value);
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];

      if (split.length < 1) continue;

      const hasFollowing = i !== (splits.length - 1);
      
      sequences.push(new Sequence({
        chars: this.preserveCase.value === true ? split : split.toLowerCase(),
        isBeginning: i === 0,
        isMiddle: i !== 0 && hasFollowing === true,
        isEnding: hasFollowing !== true
      }));
    }
    return sequences;
  }
}

/**
 * Handles presentation of a `DelimiterSequencingStrategy`'s settings. 
 * 
 * @property {String} template Returns the **HTML literal** that represents the strategy's settings.  
 * * Read-only
 * @property {Application} application The parent application. 
 * @property {DelimiterSequencingStrategy} entity The represented strategy. 
 * 
 * @extends AbstractEntityPresenter
 */
export class DelimiterSequencingStrategySettingsPresenter extends AbstractEntityPresenter {
  /** @override */
  get template() {
    return `<label for="${this.entity.id}-delimiter">${game.i18n.localize("wg.generator.sequencingStrategies.delimiter")}</label>
<input id="${this.entity.id}-delimiter" type="text" value="${this.entity.delimiter.value}" class="wg-light" />
<label for="${this.entity.id}-preserveCase">${game.i18n.localize("wg.generator.preserveCase")}</label>
<input id="${this.entity.id}-preserveCase" type="checkbox"${this.entity.preserveCase.value === true ? ' checked="true"' : ''} class="wg-light" />`;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(`input#${this.entity.id}-delimiter`).change((data) => {
      this.entity.delimiter.value = data.currentTarget.value;
    });
    html.find(`input#${this.entity.id}-preserveCase`).change((data) => {
      this.entity.preserveCase.value = data.currentTarget.checked;
    });
  }
}
