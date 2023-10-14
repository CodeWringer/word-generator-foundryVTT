import ObservableCollection, { CollectionChangeTypes } from "../../common/observables/observable-collection.mjs";
import ObservableField from "../../common/observables/observable-field.mjs";
import ObservationPropagator from "../../common/observables/observation-propagator.mjs";
import { SORTING_ORDERS } from "../../presentation/sorting-orders.mjs";
import WgFolder from "./wg-folder.mjs";
import WgGenerator from "./wg-generator.mjs";

/**
 * Represents the application level data object. This is effectively the root data object 
 * that groups all other business data within it. 
 * 
 * This type and all its fields are **observable**! 
 * 
 * @property {ObservableField<Number>} amountToGenerate The number of words to generate. 
 * * Persisted
 * @property {ObservableField<SORTING_ORDERS>} resultsSortMode The sorting order of generated words. 
 * * Persisted
 * @property {ObservableCollection<String>} generatedResults The generated results. 
 * @property {ObservableField<String>} generatorSearchTerm The current generator filter to apply. 
 * * If not empty, only the generators whose name partially or fully matches this string. 
 * @property {WgFolder} rootFolder The root folder contains all the root level business data collections. 
 * * Persisted
 */
export default class WgApplicationData {
  /**
   * @param {Object} args 
   * @param {Number | undefined} args.amountToGenerate The number of words to generate. 
   * * Default `10`
   * @param {SORTING_ORDERS | undefined} args.resultsSortMode The sorting order of generated words. 
   * * Default `SORTING_ORDERS.DESC`
   * @param {Array<WgGenerator> | undefined} args.generators The collection of root-level generators. 
   * @param {Array<WgFolder> | undefined} args.folders The collection of root-level folders. 
   * @param {String | undefined} args.generatorSearchTerm The current generator filter to apply. 
   * * If not empty, only the generators whose name partially or fully matches this string. 
   */
  constructor(args = {}) {
    this.amountToGenerate = new ObservableField({ value: args.amountToGenerate ?? 10 });
    this.resultsSortMode = new ObservableField({ value: args.resultsSortMode ?? SORTING_ORDERS.DESC });
    this.generatedResults = new ObservableCollection();
    this.generatorSearchTerm = new ObservableField({ value: args.generatorSearchTerm ?? "" });

    this.rootFolder = new WgFolder({
      id: "ROOT",
      name: "ROOT",
      applicationData: this,
      isExpanded: true,
      folders: (args.folders ?? []),
      generators: (args.generators ?? []),
    });

    this.propagator = new ObservationPropagator(this, [
      this.amountToGenerate,
      this.resultsSortMode,
      this.generatedResults,
      this.generatorSearchTerm,
      this.rootFolder,
    ]);
  }
  
  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj 
   * 
   * @returns {WgApplicationData}
   * 
   * @static
   */
  static fromDto(obj) {
    let rootFolder;
    if (obj.rootFolder === undefined) {
      rootFolder = new WgFolder();
    } else {
      rootFolder = WgFolder.fromDto(obj.rootFolder);
    }

    const result = new WgApplicationData({
      amountToGenerate: obj.amountToGenerate,
      resultsSortMode: obj.resultsSortMode,
      folders: rootFolder.folders.getAll(),
      generators: rootFolder.generators.getAll(),
    });

    return result;
  }

  /**
   * Returns a data transfer object representation of this instance. 
   * 
   * @returns {Object}
   */
  toDto() {
    return {
      amountToGenerate: this.amountToGenerate.value,
      resultsSortMode: this.resultsSortMode.value,
      rootFolder: this.rootFolder.toDto(),
    };
  }
}
