import ObservableCollection, { CollectionChangeTypes } from "../../common/observables/observable-collection.mjs";
import ObservableField from "../../common/observables/observable-field.mjs";
import ObservationPropagator from "../../common/observables/observation-propagator.mjs";
import { SORTING_ORDERS } from "../../presentation/sorting-orders.mjs";
import WgChain from "./wg-chain.mjs";
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
 * @property {ObservableCollection<String>} generatedResults The generated results. 
 * @property {ObservableField<String>} generatorSearchTerm The current generator filter to apply. 
 * * If not empty, only the generators whose name partially or fully matches this string. 
 * @property {WgFolder} rootFolder The root folder contains all the root level business data collections. 
 * * Persisted
 */
export default class WgApplicationData {
  /**
   * ID of the unique root folder instance. 
   * 
   * @type {String}
   * @static
   * @readonly
   */
  static ROOT_FOLDER_ID = "ROOT";

  /**
   * @param {Object} args 
   * @param {Number | undefined} args.amountToGenerate The number of words to generate. 
   * * Default `10`
   * @param {Array<WgGenerator> | undefined} args.generators The collection of root-level generators. 
   * @param {Array<WgFolder> | undefined} args.folders The collection of root-level folders. 
   * @param {Array<WgChain> | undefined} args.chains The collection of root-level chains. 
   * @param {String | undefined} args.generatorSearchTerm The current generator filter to apply. 
   * * If not empty, only the generators whose name partially or fully matches this string. 
   */
  constructor(args = {}) {
    this.amountToGenerate = new ObservableField({ value: args.amountToGenerate ?? 10 });
    this.generatedResults = new ObservableCollection();
    this.generatorSearchTerm = new ObservableField({ value: args.generatorSearchTerm ?? "" });

    this.rootFolder = new WgFolder({
      id: WgApplicationData.ROOT_FOLDER_ID,
      name: WgApplicationData.ROOT_FOLDER_ID,
      applicationData: this,
      isExpanded: true,
      folders: (args.folders ?? []),
      generators: (args.generators ?? []),
      chains: (args.chains ?? []),
    });

    this.propagator = new ObservationPropagator(this, [
      this.amountToGenerate,
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
    const result = new WgApplicationData({
      amountToGenerate: obj.amountToGenerate,
    });

    // Only the deserialized folder contents are kept. All other data is hard-coded 
    // to avoid persisted data from overriding any expected field values. 
    if (obj.rootFolder !== undefined) {
      const deserializedRootFolder = WgFolder.fromDto(obj.rootFolder, result);
      
      result.rootFolder.folders.addAll(deserializedRootFolder.folders.getAll());
      result.rootFolder.generators.addAll(deserializedRootFolder.generators.getAll());
      result.rootFolder.chains.addAll(deserializedRootFolder.chains.getAll());
    }

    // Give chains their dependency references. 
    const allChains = result.rootFolder.getChains();
    for (const chain of allChains) {
      const allChoices = result.rootFolder.getGenerators()
        .concat(allChains);

      const items = chain.itemIds.getAll().map(itemId => 
        allChoices.find(it => it.id === itemId)
      );

      chain.items.addAll(items);
    }

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
      rootFolder: this.rootFolder.toDto(),
    };
  }
}
