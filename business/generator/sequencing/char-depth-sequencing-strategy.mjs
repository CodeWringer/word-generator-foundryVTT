import ObservableField from "../../../common/observables/observable-field.mjs";
import AbstractEntityPresenter from "../../../presentation/abstract-entity-presenter.mjs";
import { isInteger } from "../../util/validation.mjs";
import AbstractStrategyDefinition from "../common/abstract-strategy-definition.mjs";
import AbstractSequencingStrategy from "./abstract-sequencing-strategy.mjs";
import Sequence from "./sequence.mjs";

/**
 * Defines a `CharDepthSequencingStrategy`. 
 * 
 * @extends AbstractStrategyDefinition
 */
export class CharDepthSequencingStrategyDefinition extends AbstractStrategyDefinition {
  /** @override */
  get id() { return "CharDepthSequencingStrategy" }

  /** @override */
  get localizedName() { return game.i18n.localize("wg.generator.sequencingStrategies.charDepth"); }
  
  /** @override */
  newInstance(settings) {
    return new CharDepthSequencingStrategy(settings);
  }
}

/**
 * This sequencing strategy creates sequences of characters, based on a given depth 
 * (= character count/length). 
 * 
 * @property {ObservableField<Number>} depth The depth of the look-back for the algorithm. 
 * Higher numbers result in results more similar to the provided sample set, 
 * but also in less variety. 
 * * Default `1`.
 * @property {ObservableField<Boolean>} preserveCase If true, will not transform found sequences 
 * to lower case, but instead preserve the casing found in the sequence. 
 * * Default `false`. 
 * 
 * @extends AbstractSequencingStrategy
 */
export class CharDepthSequencingStrategy extends AbstractSequencingStrategy {
  /** @override */
  static fromDto(dto) {
    return new CharDepthSequencingStrategy({
      depth: dto.depth,
      preserveCase: dto.preserveCase,
    });
  }

  /** @override */
  get definitionId() { return new CharDepthSequencingStrategyDefinition().id; }

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
   * @param {Application | undefined} args.application The parent application. 
   * @param {Number | undefined} args.depth The depth of the look-back for the algorithm. 
   * Higher numbers result in results more similar to the provided sample set, 
   * but also in less variety. 
   * * Note, that a number less than 1 will result in an error. 
   * * default `1`
   * @param {Boolean | undefined} args.preserveCase If true, will not transform found sequences 
   * to lower case, but instead preserve the casing found in the sequence. Default false. 
   * * default `false`
   * 
   * @throws {Error} Thrown, if the passed parameter 'depth' is not an integer greater 0. 
   */
  constructor(args = {}) {
    super();

    this._id = args.id ?? foundry.utils.randomID(16);
    this.depth = new ObservableField({ value: args.depth ?? 1 });
    this.preserveCase = new ObservableField({ value: args.preserveCase ?? false });

    this._settingsPresenter = new CharDepthSequencingStrategySettingsPresenter({
      application: args.application,
      entity: this,
    });
  }

  /** @override */
  toDto() {
    return {
      definitionId: this.definitionId,
      settings: {
        depth: this.depth.value,
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
    for (let i = 0; i < sample.length; i += this.depth.value) {
      let chars = sample.substring(i, i + this.depth.value);

      if (this.preserveCase.value !== true) {
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
}

/**
 * Handles presentation of a `CharDepthSequencingStrategy`'s settings. 
 * 
 * @property {String} template Returns the **HTML literal** that represents the strategy's settings.  
 * * Read-only
 * @property {Application} application The parent application. 
 * @property {CharDepthSequencingStrategy} entity The represented strategy. 
 * 
 * @extends AbstractEntityPresenter
 */
export class CharDepthSequencingStrategySettingsPresenter extends AbstractEntityPresenter {
  /** @override */
  get template() {
    return `<label for="${this.entity.id}-depth">${game.i18n.localize("wg.generator.depth")}</label>
<input id="${this.entity.id}-depth" type="number" min="1" value="${this.entity.depth.value}" class="wg-light" />
<label for="${this.entity.id}-preserveCase">${game.i18n.localize("wg.generator.preserveCase")}</label>
<input id="${this.entity.id}-preserveCase" type="checkbox"${this.entity.preserveCase.value === true ? ' checked="true"' : ''} class="wg-light" />`;
  }
  
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(`input#${this.entity.id}-depth`).change((data) => {
      this.entity.depth.value = parseInt(data.currentTarget.value);
    });
    html.find(`input#${this.entity.id}-preserveCase`).change((data) => {
      this.entity.preserveCase.value = data.currentTarget.checked;
    });
  }
}
