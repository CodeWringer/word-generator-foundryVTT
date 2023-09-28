import { SORTING_ORDERS } from "../../../presentation/sorting-orders.mjs";

/**
 * Settings of the `WordGeneratorApplication`. 
 * 
 * @property {Number} amountToGenerate The number of words to generate. 
 * @property {SORTING_ORDERS} resultsSortMode The sorting order of generated words. 
 */
export default class WordGeneratorApplicationSettings {
  /**
   * @param {Number | undefined} args.amountToGenerate The number of words to generate.
   * * Default `10` 
   * @param {SORTING_ORDERS | undefined} args.resultsSortMode The sorting order of generated words. 
   * * Default `SORTING_ORDERS.DESC`
   */
  constructor(args = {}) {
    this.amountToGenerate = args.amountToGenerate ?? 10;
    this.resultsSortMode = args.resultsSortMode ?? SORTING_ORDERS.DESC;
  }

  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj 
   * 
   * @returns {WordGeneratorApplicationSettings}
   * 
   * @static
   */
  static fromDto(obj) {
    return new WordGeneratorApplicationSettings({
      amountToGenerate: obj.amountToGenerate,
      resultsSortMode: obj.resultsSortMode,
    });
  }

  /**
   * Returns a data transfer object representation of this instance. 
   * 
   * @returns {Object}
   */
  toDto() {
    return {
      amountToGenerate: this.amountToGenerate,
      resultsSortMode: this.resultsSortMode,
    };
  }
}