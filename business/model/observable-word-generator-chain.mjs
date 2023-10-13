import ObservableCollection from "../../common/observables/observable-collection.mjs";
import ObservableField from "../../common/observables/observable-field.mjs";
import ObservationPropagator from "../../common/observables/observation-propagator.mjs";

/**
 * Represents an ordered chain of generators and other chains, whose results 
 * will be concatenated (i. e. "chained" together). 
 * 
 * @property {String} id Unique ID of the chain. 
 * * Read-only
 * @property {ObservableField<String>} name Human readable name of the chain. 
 * @property {ObservableField<Boolean>} isExpanded If `true`, the chain is to be presented in expanded state. 
 * @property {ObservableField<ObservableWordGeneratorFolder | undefined>} parent Parent folder, if there is one. 
 * @property {ObservableCollection<ObservableWordGeneratorItem | ObservableWordGeneratorChain>} items The contained word generators. 
 * * These types must support a `generate()` method!
 * @property {ObservableField<String>} separator This separator is used to concatenate results. 
 */
export default class ObservableWordGeneratorChain {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of the chain. 
   * * default is a newly generated ID. 
   * @param {String | undefined} args.name Human readable name of the chain. 
   * * default is a localized default name
   * @param {Boolean | undefined} args.isExpanded If `true`, the chain is to be presented in expanded state. 
   * * default `false`
   * @param {ObservableWordGeneratorFolder | undefined} args.parent Parent folder, if there is one. 
   * @param {Array<ObservableWordGeneratorItem | ObservableWordGeneratorChain> | undefined} args.items The contained word generators. 
   * * These types must support a `generate()` method!
   * @param {String | undefined} args.separator This separator is used to concatenate results. 
   * * default `" "`
   */
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);

    this.name = new ObservableField({ 
      value: args.name ?? game.i18n.localize("wg.chain.defaultName")
    });
    this.isExpanded = new ObservableField({ value: args.isExpanded ?? false });
    this.parent = new ObservableField({ value: args.parent });
    this.items = new ObservableCollection({ elements: (args.items ?? []) });
    this.separator = new ObservableField({ value: args.separator ?? " " });
    
    this.propagator = new ObservationPropagator(this, [
      this.name,
      this.isExpanded,
      this.parent,
      this.items,
      this.separator,
    ]);
  }
  
  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj DTO to create an instance from. 
   * @param {ObservableWordGeneratorFolder | undefined} parent Parent folder, if there is one. 
   * @param {ObservableCollection<ObservableWordGeneratorItem | ObservableWordGeneratorChain>} items A flat list 
   * of **all** available generators or other chains, from which the corresponding entries will 
   * be picked. 
   * 
   * @returns {ObservableWordGeneratorChain}
   * 
   * @static
   */
  static fromDto(obj, parent, items) {
    const itemDtos = (obj.items ?? []).map(itemId => 
      items.find(it => it.id === itemId)
    );

    return new ObservableWordGeneratorChain({
      id: obj.id,
      name: obj.name,
      parent: parent,
      items: itemDtos,
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
      items: this.items.getAll().map(it => it.id),
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
    for (const generator of this.items) {
      sets.push(generator.generate(count));
    }

    // Concatenate.
    const results = [];
    for (let iRun = 0; iRun < count; iRun++) {
      const subSet = [];
      for (let iSet = 0; iSet < sets.length; i++) {
        subSet.push(sets[iSet][iRun]);
      }
      results.push(subSet.join(this.separator.value));
    }

    return results;
  }
}
