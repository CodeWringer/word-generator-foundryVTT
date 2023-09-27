import { SORTING_ORDERS } from "../../presentation/sorting-orders.mjs";

/**
 * @property {Number} amountToGenerate The number of words to generate. 
 * @property {SORTING_ORDERS} args.resultsSortMode The sorting order of generated words. 
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
   * Returns an instance of this type parsed from the given plain-object. 
   * 
   * @param {Object} obj 
   * 
   * @returns {WordGeneratorApplicationSettings}
   * 
   * @static
   */
  static fromObject(obj) {
    return new WordGeneratorApplicationSettings({
      amountToGenerate: obj.amountToGenerate,
      resultsSortMode: obj.resultsSortMode,
    });
  }

  /**
   * Returns a plain-object representation of this instance. 
   * 
   * @returns {Object}
   */
  toObject() {
    return {
      amountToGenerate: this.amountToGenerate,
      resultsSortMode: this.resultsSortMode,
    };
  }
}