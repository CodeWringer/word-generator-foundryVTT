import ObservableCollection, { CollectionChangeTypes } from "../../common/observables/observable-collection.mjs";
import ObservableField from "../../common/observables/observable-field.mjs";
import ObservationPropagator from "../../common/observables/observation-propagator.mjs";
import { SORTING_ORDERS } from "../../presentation/sorting-orders.mjs";
import ObservableWordGeneratorFolder from "./observable-word-generator-folder.mjs";
import ObservableWordGeneratorItem from "./observable-word-generator-item.mjs";

/**
 * @property {ObservableField<Number>} amountToGenerate The number of words to generate. 
 * @property {ObservableField<SORTING_ORDERS>} resultsSortMode The sorting order of generated words. 
 * @property {ObservableCollection<ObservableWordGeneratorItem>} generators The collection of root-level generators. 
 * @property {ObservableCollection<ObservableWordGeneratorFolder>} folders The collection of root-level folders. 
 * @property {ObservableCollection<String>} generatedResults The generated results. 
 * * Not persisted
 * @property {ObservableField<String>} generatorSearchTerm The current generator filter to apply. 
 * * If not empty, only the generators whose name partially or fully matches this string. 
 * * Not persisted
 */
export default class ObservableWordGeneratorApplicationData {
  /**
   * @param {Object} args 
   * @param {Number | undefined} args.amountToGenerate The number of words to generate. 
   * * Default `10`
   * @param {SORTING_ORDERS | undefined} args.resultsSortMode The sorting order of generated words. 
   * * Default `SORTING_ORDERS.DESC`
   * @param {Array<ObservableWordGeneratorItem> | undefined} args.generators The collection of root-level generators. 
   * @param {Array<ObservableWordGeneratorFolder> | undefined} args.folders The collection of root-level folders. 
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
   * @returns {ObservableWordGeneratorApplicationData}
   * 
   * @static
   */
  static fromDto(obj) {
    const generators = (obj.generators ?? []).map(generatorDto => 
      ObservableWordGeneratorItem.fromDto(generatorDto)
    );
    const folders = (obj.folders ?? []).map(folderDto => 
      ObservableWordGeneratorFolder.fromDto(folderDto)
    );

    const result = new ObservableWordGeneratorApplicationData({
      amountToGenerate: obj.amountToGenerate,
      resultsSortMode: obj.resultsSortMode,
      folders: folders,
      generators: generators,
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
      generators: this.generators.getAll().map(it => it.toDto()),
      folders: this.folders.getAll().map(it => it.toDto()),
    };
  }
}
