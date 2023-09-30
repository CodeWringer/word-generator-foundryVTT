import ObservableCollection, { CollectionChangeTypes } from "../../common/observables/observable-collection.mjs";
import ObservableField from "../../common/observables/observable-field.mjs";
import { SORTING_ORDERS } from "../../presentation/sorting-orders.mjs";
import ObservableWordGeneratorFolder from "./observable-word-generator-folder.mjs";
import ObservableWordGeneratorItem from "./observable-word-generator-item.mjs";

/**
 * @property {ObservableField<Number>} amountToGenerate The number of words to generate. 
 * @property {ObservableField<SORTING_ORDERS>} resultsSortMode The sorting order of generated words. 
 * @property {ObservableCollection<ObservableWordGeneratorItem>} generators The collection of root-level generators. 
 * @property {ObservableCollection<ObservableWordGeneratorFolder>} folders The collection of root-level folders. 
 * @property {ObservableCollection<String>} generatedResults The generated results. 
 */
export default class ObservableWordGeneratorApplicationData {
  /**
   * @param {Object} args 
   * @param {Number | undefined} amountToGenerate The number of words to generate. 
   * * Default `10`
   * @param {SORTING_ORDERS | undefined} resultsSortMode The sorting order of generated words. 
   * * Default `SORTING_ORDERS.DESC`
   * @param {Array<ObservableWordGeneratorItem> | undefined} generators The collection of root-level generators. 
   * @param {Array<ObservableWordGeneratorFolder> | undefined} folders The collection of root-level folders. 
   */
  constructor(args = {}) {
    this.amountToGenerate = new ObservableField({ value: args.amountToGenerate ?? 10 });
    this.resultsSortMode = new ObservableField({ value: args.resultsSortMode ?? SORTING_ORDERS.DESC });
    this.folders = new ObservableCollection({ elements: (args.folders ?? []) });
    this.generators = new ObservableCollection({ elements: (args.generators ?? []) });
    this.generatedResults = new ObservableCollection();

    this.folders.onChange((collection, change, args) => {
      if (change === CollectionChangeTypes.ADD) {
        for (const folder of args.elements) {
          if (folder.parent.value !== undefined) {
            folder.parent.value.children.remove(folder);
            folder.parent.value = undefined;
          }
        }
      }
    });

    this.generators.onChange((collection, change, args) => {
      if (change === CollectionChangeTypes.ADD) {
        for (const generator of args.elements) {
          if (generator.parent.value !== undefined) {
            generator.parent.value.children.remove(generator);
            generator.parent.value = undefined;
          }
        }
      }
    });
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