import ObservableCollection from "../../common/observables/observable-collection.mjs";
import AbstractEntity from "./abstract-entity.mjs";

/**
 * Abstract base class for an entity that can be contained in a folder. 
 * 
 * @property {String} id Unique ID of the entity. 
 * * Read-only
 * @property {WgApplicationData} applicationData The application level 
 * root data object reference. 
 * @property {ObservableCollection<AbstractContainableEntity>} parentCollection The 
 * collection that this entity is contained in. 
 * 
 * @abstract
 */
export default class AbstractContainableEntity extends AbstractEntity {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of the entity. 
   * * By default, generates a new id. 
   * @param {WgApplicationData} args.applicationData The application level 
   * root data object reference. 
   * @param {ObservableCollection<AbstractContainableEntity> | undefined} args.parentCollection 
   * The collection that this entity is contained in, if any. 
   */
  constructor(args = {}) {
    super(args);

    this.applicationData = args.applicationData;
    this.parentCollection = args.parentCollection;
  }

  /**
   * Moves the represented entity to the root level, if possible. 
   * 
   * @param {String} type Determines the type of root collection to move the 
   * represented entity to. Allowed: `"generator"` | `"folder"` | `"chain"`
   * 
   * @virtual
   */
  moveToRootLevel(type) {
    if (this.parent.value === undefined) return; // Already at root level. 

    // Remove from current parent. 
    if (this.parentCollection !== undefined) {
      this.parentCollection.remove(this);
    }

    // Add to root level collection. 
    if (type === "generator") {
      this.applicationData.rootFolder.generators.add(this);
    } else if (type === "folder") {
      this.applicationData.rootFolder.folders.add(this);
    } else if (type === "chain") {
      this.applicationData.rootFolder.chains.add(this);
    }
  }
  
  /**
   * Removes the represented entity. 
   * 
   * @virtual
   */
  delete() {
    if (this.parentCollection !== undefined) {
      this.parentCollection.remove(this);
    }
  }
}
