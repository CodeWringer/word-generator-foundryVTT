import AbstractSpellingStrategy from "./abstract-spelling-strategy.mjs";

/**
 * Capitalizes the first letter of the word. 
 */
export default class BeginningCapitalsSpellingStrategy extends AbstractSpellingStrategy {
  /** @override */
  apply(word) {
    return `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`;
  }
}
