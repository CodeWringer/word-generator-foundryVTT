import { EventEmitter } from "../../common/event-emitter.mjs";
import ObservableCollection, { CollectionChangeTypes } from "../../common/observables/observable-collection.mjs";
import ObservableField from "../../common/observables/observable-field.mjs";
import ObservationPropagator from "../../common/observables/observation-propagator.mjs";
import ObservableWordGeneratorItem from "./observable-word-generator-item.mjs";

/**
 * Represents a folder within which word generators and other folders may be grouped. 
 * 
 * @property {String} id Unique ID of the folder. 
 * * Read-only
 * @property {ObservableField<String>} name Human readable name of the folder. 
 * @property {ObservableField<Boolean>} isExpanded If `true`, the folder is to be presented in expanded state. 
 * @property {ObservableField<ObservableWordGeneratorFolder | undefined>} parent Parent folder, if there is one. 
 * @property {ObservableCollection<ObservableWordGeneratorFolder>} children Nested folders. 
 * @property {ObservableCollection<ObservableWordGeneratorItem>} items The contained word generators. 
 */
export default class ObservableWordGeneratorFolder {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of the folder. 
   * @param {String | undefined} args.name Human readable name of the folder. 
   * * Default localized `New Folder`
   * @param {Boolean | undefined} args.isExpanded If `true`, the folder is to be presented in expanded state. 
   * * Default `false`
   * @param {ObservableWordGeneratorFolder | undefined} parent Parent folder, if there is one. 
   * @param {Array<ObservableWordGeneratorFolder> | undefined} children Nested folders. 
   * @param {Array<ObservableWordGeneratorItem> | undefined} items The contained word generators. 
   */
  constructor(args = {}) {
    this.id = args.id ?? foundry.utils.randomID(16);

    this.name = new ObservableField({ 
      value: args.name ?? game.i18n.localize("wg.folder.defaultName")
    });
    this.isExpanded = new ObservableField({ value: args.isExpanded ?? false });
    this.parent = new ObservableField({ value: args.parent });
    this.children = new ObservableCollection({ elements: (args.children ?? []) });
    this.items = new ObservableCollection({ elements: (args.items ?? []) });

    this.parent.onChange((field, oldValue, newValue) => {
      if (oldValue !== undefined) {
        oldValue.children.remove(this);
      }
      if (newValue !== undefined) {
        newValue.children.add(this);
      }
    });

    this.children.onChange((collection, change, args) => {
      if (change === CollectionChangeTypes.ADD) {
        for (const childFolder of args.elements) {
          if (childFolder.parent.value != this) {
            childFolder.parent.value = this;
          }
        }
      } else if (change === CollectionChangeTypes.REMOVE) {
        for (const childFolder of args.elements) {
          if (childFolder.parent.value == this) {
            childFolder.parent.value = undefined;
          }
        }
      }
    });

    this.items.onChange((collection, change, args) => {
      if (change === CollectionChangeTypes.ADD) {
        for (const item of args.elements) {
          if (item.parent.value != this) {
            item.parent.value = this;
          }
        }
      } else if (change === CollectionChangeTypes.REMOVE) {
        for (const item of args.elements) {
          if (item.parent.value == this) {
            item.parent.value = undefined;
          }
        }
      }
    });

    this.propagator = new ObservationPropagator(this, [
      this.name,
      this.isExpanded,
      this.parent,
      this.children,
      this.items,
    ]);
  }
  
  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj 
   * @param {ObservableWordGeneratorFolder | undefined} parent 
   * 
   * @returns {ObservableWordGeneratorFolder}
   * 
   * @static
   */
  static fromDto(obj, parent) {
    const result = new ObservableWordGeneratorFolder({
      id: obj.id,
      name: obj.name,
      parent: parent,
    });

    const items = (obj.items ?? []).map(itemDto => 
      ObservableWordGeneratorItem.fromDto(itemDto, result)
    );

    const children = (obj.children ?? []).map(childDto => 
      ObservableWordGeneratorFolder.fromDto(childDto, result)
    );

    result.items.addAll(items); 
    result.children.addAll(children); 

    return result;
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
      children: this.children.getAll().map(it => it.toDto()),
      items: this.items.getAll().map(it => it.toDto()),
    };
  }
  
  /**
   * Returns the folder with the given ID, if possible. 
   * 
   * Automatically recurses children to find the desired instance. 
   * 
   * @param {String} id ID of the folder to find. 
   * 
   * @returns {ObservableWordGeneratorFolder | undefined}
   */
  getFolderById(id) {
    if (id === this.id) {
      return this;
    }

    for (const folder of this.children.getAll()) {
      const r = folder.getFolderById(id);
      if (r !== undefined) {
        return r;
      }
    }
    return undefined;
  }
  
  /**
   * Returns the generator with the given ID, if possible. 
   * 
   * Automatically recurses children to find the desired instance. 
   * 
   * @param {String} id ID of the generator to find. 
   * 
   * @returns {ObservableWordGeneratorItem | undefined}
   */
  getGeneratorById(id) {
    for (const generator of this.items.getAll()) {
      if (generator.id === id) {
        return id;
      }
    }
    for (const child of this.children.getAll()) {
      const r = child.getGeneratorById(id);
      if (r !== undefined) {
        return r;
      }
    }
    return undefined;
  }
}
