import { EventEmitter } from "../../common/event-emitter.mjs";
import ObservableCollection, { CollectionChangeTypes } from "../../common/observables/observable-collection.mjs";
import ObservableField from "../../common/observables/observable-field.mjs";
import ObservationPropagator from "../../common/observables/observation-propagator.mjs";
import AbstractContainableEntity from "./abstract-containable-entity.mjs";
import WgApplicationData from "./wg-application-data.mjs";
import WgGenerator from "./wg-generator.mjs";

/**
 * Represents a folder within which word generators and other folders may be grouped. 
 * 
 * This type and all its fields are **observable**! 
 * 
 * @property {String} id Unique ID of the folder. 
 * * Read-only
 * @property {WgApplicationData} applicationData The application level 
 * root data object reference. 
 * @property {ObservableField<String>} name Human readable name of the folder. 
 * @property {ObservableField<Boolean>} isExpanded If `true`, the folder is to be presented in expanded state. 
 * @property {ObservableField<WgFolder | undefined>} parent Parent folder, if there is one. 
 * @property {ObservableCollection<WgFolder>} folders Nested folders. 
 * @property {ObservableCollection<WgGenerator>} generators The contained word generators. 
 */
export default class WgFolder extends AbstractContainableEntity {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of the folder. 
   * * By default, generates a new id. 
   * @param {WgApplicationData} applicationData The application level 
   * root data object reference. 
   * @param {String | undefined} args.name Human readable name of the folder. 
   * * Default localized `New Folder`
   * @param {Boolean | undefined} args.isExpanded If `true`, the folder is to be presented in expanded state. 
   * * Default `false`
   * @param {WgFolder | undefined} parent Parent folder, if there is one. 
   * @param {Array<WgFolder> | undefined} folders Nested folders. 
   * @param {Array<WgGenerator> | undefined} generators The contained word generators. 
   */
  constructor(args = {}) {
    super(args);

    this.name = new ObservableField({ 
      value: args.name ?? game.i18n.localize("wg.folder.defaultName")
    });
    this.isExpanded = new ObservableField({ value: args.isExpanded ?? false });
    this.parent = new ObservableField({ value: args.parent });
    this.folders = new ObservableCollection({ elements: (args.folders ?? []) });
    this.generators = new ObservableCollection({ elements: (args.generators ?? []) });

    this.parent.onChange((field, oldValue, newValue) => {
      if (oldValue !== undefined) {
        oldValue.folders.remove(this);
      }
      if (newValue !== undefined) {
        newValue.folders.add(this);
      }
    });

    this.folders.onChange((collection, change, args) => {
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

    this.generators.onChange((collection, change, args) => {
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
      this.folders,
      this.generators,
    ]);
  }
  
  /**
   * Returns an instance of this type parsed from the given data transfer object. 
   * 
   * @param {Object} obj 
   * @param {WgApplicationData} applicationData The application level 
   * root data object reference. 
   * @param {WgFolder | undefined} parent 
   * 
   * @returns {WgFolder}
   * 
   * @static
   */
  static fromDto(obj, applicationData, parent) {
    const result = new WgFolder({
      id: obj.id,
      applicationData: applicationData,
      name: obj.name,
      parent: parent,
    });

    const generators = (obj.generators ?? []).map(itemDto => 
      WgGenerator.fromDto(itemDto, applicationData, result)
    );

    const folders = (obj.folders ?? []).map(childDto => 
      WgFolder.fromDto(childDto, applicationData, result)
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
      id: this.id,
      name: this.name.value,
      folders: this.folders.getAll().map(it => it.toDto()),
      generators: this.generators.getAll().map(it => it.toDto()),
    };
  }
  
  /**
   * Returns the folder with the given ID, if possible. 
   * 
   * Automatically recurses children to find the desired instance. 
   * 
   * @param {String} id ID of the folder to find. 
   * 
   * @returns {WgFolder | undefined}
   */
  getFolderById(id) {
    if (id === this.id) {
      return this;
    }

    for (const folder of this.folders.getAll()) {
      const r = folder.getFolderById(id);
      if (r !== undefined) {
        return r;
      }
    }
    return undefined;
  }
  
  /**
   * Returns all folders contained in this folder and its child folders. 
   * 
   * @returns {Array<WgGenerator>}
   */
  getFolders() {
    let folders = this.folders.getAll();

    for (const child of folders) {
      folders = folders.concat(child.getFolders());
    }

    return folders;
  }

  /**
   * Returns the generator with the given ID, if possible. 
   * 
   * Automatically recurses children to find the desired instance. 
   * 
   * @param {String} id ID of the generator to find. 
   * 
   * @returns {WgGenerator | undefined}
   */
  getGeneratorById(id) {
    for (const generator of this.generators.getAll()) {
      if (generator.id === id) {
        return generator;
      }
    }
    for (const child of this.folders.getAll()) {
      const r = child.getGeneratorById(id);
      if (r !== undefined) {
        return r;
      }
    }
    return undefined;
  }

  /**
   * Returns all generators contained in this folder and its child folders. 
   * 
   * @returns {Array<WgGenerator>}
   */
  getGenerators() {
    let generators = this.generators.getAll();

    for (const child of this.folders.getAll()) {
      generators = generators.concat(child.getGenerators());
    }

    return generators;
  }

  /**
   * Returns true, if this folder is a direct or indirect child of the 
   * given other folder. 
   * 
   * @param {WgFolder} otherFolder 
   * 
   * @returns {Boolean}
   */
  isChildOf(otherFolder) {
    if (this.parent.value == otherFolder) {
      return true;
    } else if (this.parent.value === undefined) {
      return false;
    } else {
      return this.parent.value.isChildOf(otherFolder);
    }
  }

  /**
   * Collapses this folder and optionally all child folders and generators. 
   * 
   * @param {Boolean | undefined} includeChildren If `true`, also collapses all child 
   * folders and generators. 
   * * default `false`
   */
  collapse(includeChildren = false) {
    this.isExpanded.value = false;

    if (includeChildren === true) {
      for (const child of this.folders.getAll()) {
        child.collapse(includeChildren);
      }
      for (const generator of this.generators.getAll()) {
        generator.isExpanded.value = false;
      }
    }
  }
}
