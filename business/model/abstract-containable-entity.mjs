import AbstractEntity from "./abstract-entity.mjs";

/**
 * Abstract base class for an entity that can be contained in a folder or root collection. 
 * 
 * @property {String} id Unique ID of the entity. 
 * * Read-only
 * @property {ObservableWordGeneratorApplicationData} applicationData The application level 
 * root data object reference. 
 * 
 * @abstract
 */
export default class AbstractContainableEntity extends AbstractEntity {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of the folder. 
   * * By default, generates a new id. 
   * @param {ObservableWordGeneratorApplicationData} applicationData The application level 
   * root data object reference. 
   */
  constructor(args = {}) {
    super(args);

    this.applicationData = args.applicationData;
  }

  /**
   * Returns the parent collection of the represented entity.
   * 
   * @returns {Object}
   * * `collection: ObservableCollection<Object>`
   * * `type: "generators" | "folders" | "chains"`
   * 
   * @virtual
   */
  getContainingCollection() {
    if (this.parent.value === undefined) {
      if (this.applicationData.generators.any(it => it.id === this.id) === true) {
        return {
          collection: this.applicationData.generators,
          type: "generators",
        };
      } else if (this.applicationData.folders.any(it => it.id === this.id) === true) {
        return {
          collection: this.applicationData.folders,
          type: "folders",
        };
      } else if (this.applicationData.chains.any(it => it.id === this.id) === true) {
        return {
          collection: this.applicationData.chains,
          type: "chains",
        };
      }
    } else {
      const parent = this.parent.value;
      if (parent.generators.any(it => it.id === this.id) === true) {
        return {
          collection: parent.generators,
          type: "generators",
        };
      } else if (parent.folders.any(it => it.id === this.id) === true) {
        return {
          collection: parent.folders,
          type: "folders",
        };
      } else if (parent.chains.any(it => it.id === this.id) === true) {
        return {
          collection: parent.chains,
          type: "chains",
        };
      }
    }
  }
  
  /**
   * Moves the represented entity to the root level, if possible. 
   * 
   * @virtual
   */
  moveToRootLevel() {
    if (this.parent.value === undefined) return; // Already at root level. 

    // Remove from current parent. 
    const container = this.getContainingCollection();
    container.collection.remove(this);

    // Add to root level collection. 
    if (container.type === "generators") {
      this.applicationData.generators.add(this);
    } else if (container.type === "folders") {
      this.applicationData.folders.add(this);
    } else if (container.type === "chains") {
      this.applicationData.chains.add(this);
    }
  }
}