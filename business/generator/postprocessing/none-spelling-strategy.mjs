import AbstractEntityPresenter from "../../../presentation/abstract-entity-presenter.mjs";
import AbstractStrategyDefinition from "../common/abstract-strategy-definition.mjs";
import AbstractSpellingStrategy from "./abstract-spelling-strategy.mjs";

/**
 * Defines a `NoneSpellingStrategy`. 
 * 
 * @extends AbstractStrategyDefinition
 */
export class NoneSpellingStrategyDefinition extends AbstractStrategyDefinition {
  /** @override */
  get id() { return "NoneSpellingStrategy" }

  /** @override */
  get localizedName() { return game.i18n.localize("wg.generator.spellingStrategies.none"); }
  
  /** @override */
  newInstance(settings) {
    return new NoneSpellingStrategy(settings);
  }
}

/**
 * This spelling strategy does nothing at all. It is used as a default for when no 
 * actual spelling strategy has been picked. 
 * 
 * @extends AbstractSpellingStrategy
 */
export class NoneSpellingStrategy extends AbstractSpellingStrategy {
  /** @override */
  static fromDto(dto) {
    return new NoneSpellingStrategy();
  }

  /** @override */
  get definitionId() { return new NoneSpellingStrategyDefinition().id; }

  /** @override */
  get id() { return this._id; }

  /** @override */
  get settingsPresenter() { return this._settingsPresenter; }

  /** @override */
  get localizedInfoText() { return game.i18n.localize("wg.generator.spellingStrategy.infoHint"); }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id ID of this strategy. 
   * * By default, generates a new ID. 
   * @param {Application | undefined} args.application The parent application. 
   * * For pass-through to the presenter. 
   */
  constructor(args = {}) {
    super();

    this._id = args.id ?? foundry.utils.randomID(16);

    this._settingsPresenter = new NoneSpellingStrategySettingsPresenter({
      application: args.application,
      entity: this,
    });
  }

  /** @override */
  toDto() {
    return {
      definitionId: this.definitionId,
      settings: {},
    }
  }
  
  /** @override */
  async apply(word) {
    return word;
  }
}

/**
 * Handles presentation of a `NoneSpellingStrategy`'s settings. 
 * 
 * @property {String} template Returns the **HTML literal** that represents the strategy's settings.  
 * * Read-only
 * @property {Application} application The parent application. 
 * @property {WordListSamplingStrategy} entity The represented strategy. 
 * 
 * @extends AbstractEntityPresenter
 */
export class NoneSpellingStrategySettingsPresenter extends AbstractEntityPresenter {
  /** @override */
  get template() { return ""; }
  
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }
}
