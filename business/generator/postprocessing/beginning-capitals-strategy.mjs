import AbstractEntityPresenter from "../../../presentation/abstract-entity-presenter.mjs";
import AbstractStrategyDefinition from "../common/abstract-strategy-definition.mjs";
import AbstractSpellingStrategy from "./abstract-spelling-strategy.mjs";

/**
 * Defines a `BeginningCapitalsSpellingStrategy`. 
 * 
 * @extends AbstractStrategyDefinition
 */
export class BeginningCapitalsSpellingStrategyDefinition extends AbstractStrategyDefinition {
  /** @override */
  get id() { return "BeginningCapitalsSpellingStrategy" }

  /** @override */
  get localizedName() { return game.i18n.localize("wg.generator.spellingStrategies.capitalizeFirstLetter"); }
  
  /** @override */
  newInstance(settings) {
    return new BeginningCapitalsSpellingStrategy(settings);
  }
}

/**
 * Capitalizes the first letter of the word. 
 */
export class BeginningCapitalsSpellingStrategy extends AbstractSpellingStrategy {
  /** @override */
  static fromDto(dto) {
    return new BeginningCapitalsSpellingStrategy();
  }

  /** @override */
  get id() { return new BeginningCapitalsSpellingStrategyDefinition().id; }

  /** @override */
  get settingsPresenter() { return this._settingsPresenter; }

  /** @override */
  get localizedInfoText() { return game.i18n.localize("wg.generator.spellingStrategy.infoHint"); }

  /**
   * @param {Object} args
   * @param {Application | undefined} args.application The parent application. 
   * * For pass-through to the presenter. 
   */
  constructor(args = {}) {
    super();

    this._settingsPresenter = new BeginningCapitalsSpellingStrategyPresenter({
      application: args.application,
      entity: this,
    });
  }

  /** @override */
  toDto() {
    return {
      definitionId: new BeginningCapitalsSpellingStrategy().id,
      settings: {},
    }
  }
  
  /** @override */
  async apply(word) {
    return `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`;
  }
}

/**
 * Handles presentation of a `BeginningCapitalsSpellingStrategy`'s settings. 
 * 
 * @property {String} template Returns the **HTML literal** that represents the strategy's settings.  
 * * Read-only
 * @property {Application} application The parent application. 
 * @property {WordListSamplingStrategy} entity The represented strategy. 
 * 
 * @extends AbstractEntityPresenter
 */
export class BeginningCapitalsSpellingStrategyPresenter extends AbstractEntityPresenter {
  /** @override */
  get template() { return ""; }
  
  activateListeners(html) {
    // No work to do. 
  }
}
