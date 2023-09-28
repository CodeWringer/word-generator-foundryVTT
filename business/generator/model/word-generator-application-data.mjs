import { SORTING_ORDERS } from "../../../presentation/sorting-orders.mjs";
import WordGeneratorFolder from "./word-generator-folder.mjs";
import WordGeneratorItem from "./word-generator-item.mjs";

/**
 * Settings of the `WordGeneratorApplication`. 
 * 
 * This is the data that is actually persisted to world settings. 
 * 
 * @property {Number} amountToGenerate The number of words to generate. 
 * @property {SORTING_ORDERS} resultsSortMode The sorting order of generated words. 
 * @property {Array<WordGeneratorItem>} generatorItems A list of generator items. 
 * @property {Array<WordGeneratorFolder>} folders A list of folders. 
 */
export default class WordGeneratorApplicationData {
  /**
   * @param {Number | undefined} args.amountToGenerate The number of words to generate.
   * * Default `10` 
   * @param {SORTING_ORDERS | undefined} args.resultsSortMode The sorting order of generated words. 
   * * Default `SORTING_ORDERS.DESC`
   * @param {Array<WordGeneratorItem> | undefined} generatorItems A list of generator items. 
   * @param {Array<WordGeneratorFolder> | undefined} folders A list of folders. 
   */
  constructor(args = {}) {
    this.amountToGenerate = args.amountToGenerate ?? 10;
    this.resultsSortMode = args.resultsSortMode ?? SORTING_ORDERS.DESC;
    this.generatorItems = args.generatorItems ?? [];
    this.folders = args.folders ?? [];
  }

  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj 
   * 
   * @returns {WordGeneratorApplicationData}
   * 
   * @static
   */
  static fromDto(obj) {
    return new WordGeneratorApplicationData({
      amountToGenerate: obj.amountToGenerate,
      resultsSortMode: obj.resultsSortMode,
      generatorItems: (obj.generatorItems ?? []).map(it => WordGeneratorItem.fromDto(it)),
      folders: (obj.folders ?? []).map(it => WordGeneratorFolder.fromDto(it)),
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
      generatorItems: this.generatorItems.map(it => it.toDto()),
      folders: this.folders.map(it => it.toDto()),
    };
  }
}