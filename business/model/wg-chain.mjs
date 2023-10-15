import ObservableCollection, { CollectionChangeTypes } from "../../common/observables/observable-collection.mjs";
import ObservableField from "../../common/observables/observable-field.mjs";
import ObservationPropagator from "../../common/observables/observation-propagator.mjs";
import AbstractContainableEntity from "./abstract-containable-entity.mjs";
import WgFolder from "./wg-folder.mjs";
import WgGenerator from "./wg-generator.mjs";

/**
 * Represents an ordered chain of generators and other chains, whose results 
 * will be concatenated (i. e. "chained" together). 
 * 
 * This type and most of its fields are **observable**! 
 * 
 * @property {String} id Unique ID of the folder. 
 * * Read-only
 * * Not observable
 * @property {WgApplicationData} applicationData The application level 
 * root data object reference. 
 * @property {ObservableCollection<AbstractContainableEntity>} parentCollection The 
 * collection that this entity is contained in. 
 * * Not observable
 * @property {ObservableField<String>} name Human readable name of the chain. 
 * @property {ObservableField<Boolean>} isExpanded If `true`, the chain is to be presented in expanded state. 
 * @property {ObservableField<WgFolder | undefined>} parent Parent folder, if there is one. 
 * @property {ObservableCollection<WgGenerator | WgChain>} items The contained word generators. 
 * * These types must support a `generate()` method!
 * @property {ObservableField<String>} separator This separator is used to concatenate results. 
 */
export default class WgChain extends AbstractContainableEntity {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of the chain. 
   * * default is a newly generated ID. 
   * @param {String | undefined} args.name Human readable name of the chain. 
   * * default is a localized default name
   * @param {Boolean | undefined} args.isExpanded If `true`, the chain is to be presented in expanded state. 
   * * default `false`
   * @param {WgFolder | undefined} args.parent Parent folder, if there is one. 
   * @param {Array<String> | undefined} args.itemIds IDs of the dependencies. 
   * @param {String | undefined} args.separator This separator is used to concatenate results. 
   * * default `" "`
   */
  constructor(args = {}) {
    super(args);

    this.name = new ObservableField({
      value: args.name ?? game.i18n.localize("wg.chain.defaultName")
    });
    this.isExpanded = new ObservableField({ value: args.isExpanded ?? false });
    this.parent = new ObservableField({ value: args.parent });
    this.separator = new ObservableField({ value: args.separator ?? " " });
    this.itemIds = new ObservableCollection({ elements: (args.itemIds ?? []) });
    this.items = new ObservableCollection({ elements: [] });

    this.itemIds.onChange((collection, change, args) => {
      const allChoices = this.applicationData.rootFolder.getGenerators()
        .concat(this.applicationData.rootFolder.getChains());

      if (change === CollectionChangeTypes.ADD) {
        for (const addedId of args.elements) {
          const addedItem = allChoices.find(it => it.id === addedId);
          if (this.items.contains(addedItem) !== true) {
            this.items.add(addedItem);
          }
        }
      } else if (change === CollectionChangeTypes.REMOVE) {
        for (const removedId of args.elements) {
          const removedItem = allChoices.find(it => it.id === removedId);
          if (this.items.contains(removedItem) === true) {
            this.items.remove(removedItem);
          }
        }
      }
    });
    
    this.items.onChange((collection, change, args) => {
      if (change === CollectionChangeTypes.ADD) {
        for (const addedItem of args.elements) {
          if (this.itemIds.contains(addedItem.id) !== true) {
            this.itemIds.add(addedItem.id);
          }
        }
      } else if (change === CollectionChangeTypes.REMOVE) {
        for (const removedItem of args.elements) {
          if (this.itemIds.contains(removedItem.id) === true) {
            this.itemIds.remove(removedItem.id);
          }
        }
      }
    });
    
    this.propagator = new ObservationPropagator(this, [
      this.name,
      this.isExpanded,
      this.parent,
      this.separator,
      this.itemIds,
      this.items,
    ]);
  }
  
  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj DTO to create an instance from. 
   * @param {WgApplicationData} applicationData The application level 
   * root data object reference. 
   * @param {WgFolder | undefined} parent Parent folder, if there is one. 
   * 
   * @returns {WgChain}
   * 
   * @static
   */
  static fromDto(obj, applicationData, parent) {
    return new WgChain({
      id: obj.id,
      applicationData: applicationData,
      parentCollection: (parent ?? {}).chains,
      name: obj.name,
      parent: parent,
      itemIds: (obj.itemIds ?? []),
      separator: obj.separator,
    });
  }

  /**
   * Returns a data transfer object representation of this instance. 
   * 
   * @returns {Object}
   */
  toDto() {
    return {
      id: this.id,
      name: this.name.value,
      itemIds: this.itemIds.getAll(),
      separator: this.separator.value,
    };
  }
  
  /**
   * Returns the given number of results, randomly generated, 
   * based on the parameters of the generator. 
   * 
   * @param {Number} count The number of results to generate. 
   * 
   * @returns {Array<String>} A list of generated results.
   * 
   * @async
   */
  async generate(count) {
    // An array of arrays. Every contained array represents the results of one 
    // of the generators. 
    const sets = [];

    // Generate results. 
    for (const generator of this.items.getAll()) {
      sets.push(generator.generate(count));
    }

    // Concatenate.
    const results = [];
    for (let iRun = 0; iRun < count; iRun++) {
      const subSet = [];
      for (let iSet = 0; iSet < sets.length; iSet++) {
        subSet.push(sets[iSet][iRun]);
      }
      results.push(subSet.join(this.separator.value));
    }

    return results;
  }
  
  /**
   * Moves the represented entity to the root level, if possible. 
   * 
   * @override
   */
  moveToRootLevel() {
    super.moveToRootLevel("chain");
  }
}
