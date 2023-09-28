import AbstractSpellingStrategy from "./abstract-spelling-strategy.mjs";

/**
 * Represents a "none" entry. Makes no transformations at all. 
 */
export default class NoneSpellingStrategy extends AbstractSpellingStrategy {
  /** @override */
  getDefinitionID() {
    return "NoneSpellingStrategy";
  }

  /** @override */
  getHumanReadableName() {
    return game.i18n.localize("wg.generator.spellingStrategies.none");
  }

  /** @override */
  apply(word) {
    return word;
  }

  /** @override */
  getSettings() {
    return [];
  }

  /** @override */
  newInstanceWithArgs(args) {
    return new NoneSpellingStrategy(args);
  }
}
