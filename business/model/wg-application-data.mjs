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
 * @property {ObservableField<SORTING_ORDERS>} resultsSortMode The sorting order of generated words. 
 * @property {WgFolder} rootFolder 
 * @property {ObservableCollection<String>} generatedResults The generated results. 
 * * Not persisted
 * @property {ObservableField<String>} generatorSearchTerm The current generator filter to apply. 
 * * If not empty, only the generators whose name partially or fully matches this string. 
 * * Not persisted
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
    this.folders = new ObservableCollection({ elements: (args.folders ?? []) });
    this.generators = new ObservableCollection({ elements: (args.generators ?? []) });
    this.generatedResults = new ObservableCollection();
    this.generatorSearchTerm = new ObservableField({ value: args.generatorSearchTerm ?? "" });

    this.folders.onChange((collection, change, args) => {
      if (change === CollectionChangeTypes.ADD) {
        for (const folder of args.elements) {
          if (folder.parent.value !== undefined) {
            folder.parent.value.folders.remove(folder);
            folder.parent.value = undefined;
          }
        }
      }
    });

    this.generators.onChange((collection, change, args) => {
      if (change === CollectionChangeTypes.ADD) {
        for (const generator of args.elements) {
          if (generator.parent.value !== undefined) {
            generator.parent.value.folders.remove(generator);
            generator.parent.value = undefined;
          }
        }
      }
    });

    this.propagator = new ObservationPropagator(this, [
      this.amountToGenerate,
      this.resultsSortMode,
      this.generators,
      this.folders,
      this.generatedResults,
      this.generatorSearchTerm,
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
    const result = new WgApplicationData({
      amountToGenerate: obj.amountToGenerate,
      resultsSortMode: obj.resultsSortMode,
    });

    const generators = (obj.generators ?? []).map(generatorDto => 
      WgGenerator.fromDto(generatorDto, result)
    );
    const folders = (obj.folders ?? []).map(folderDto => 
      WgFolder.fromDto(folderDto, result)
    );

    result.generators.addAll(generators);
    result.folders.addAll(folders);

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
      generators: this.generators.getAll().map(it => it.toDto()),
      folders: this.folders.getAll().map(it => it.toDto()),
    };
  }
}
