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
  get settingsPresenter() { return this._settingsPresenter; }

  /**
   * @param {Object} args
   * @param {Application | undefined} args.application The parent application. 
   * * For pass-through to the presenter. 
   */
  constructor(args = {}) {
    super();

    this._settingsPresenter = new NoneSpellingStrategySettingsPresenter({
      application: args.application,
      entity: this,
    });
  }

  /** @override */
  toDto() {
    return {
      definitionId: new NoneSpellingStrategy().id,
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
  
  activateListeners(html) {
    // No work to do. 
  }
}
