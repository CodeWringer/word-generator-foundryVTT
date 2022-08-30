import AbstractSpellingStrategy from "./abstract-spelling-strategy.mjs";

/**
 * Capitalizes the first letter of the word. 
 */
export default class BeginningCapitalsSpellingStrategy extends AbstractSpellingStrategy {
  /** @override */
  getDefinitionID() {
    return "BeginningCapitalsSpellingStrategy";
  }

  /** @override */
  getHumanReadableName() {
    return game.i18n.localize("wg.generator.spellingStrategies.capitalizeFirstLetter");
  }

  /** @override */
  apply(word) {
    return `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`;
  }

  /** @override */
  getSettings() {
    return undefined;
  }

  /** @override */
  newInstanceWithArgs(args) {
    return new BeginningCapitalsSpellingStrategy(args);
  }
}
