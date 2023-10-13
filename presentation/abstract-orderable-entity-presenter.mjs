import ObservableCollection from "../common/observables/observable-collection.mjs";
import AbstractEntityPresenter from "./abstract-entity-presenter.mjs";

/**
 * Represents the abstract base implementation of a presenter of a singular entity, 
 * which can be ordered (in a folder). 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * * Abstract
 * @property {Application} application The parent application. 
 * @property {Object} entity The represented entity. 
 * @property {Boolean} enableMoveUp Is `true`, if moving the represented entity up 
 * is possible. 
 * * Read-only
 * @property {Boolean} enableMoveDown Is `true`, if moving the represented entity down 
 * is possible. 
 * * Read-only
 * 
 * @abstract
 */
export default class AbstractOrderableEntityPresenter extends AbstractEntityPresenter {
  /**
   * Returns `true`, if moving the entity up within its container is possible. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get enableMoveUp() {
    const siblings = this.getContainingCollection().collection.getAll();
    const index = siblings.findIndex(it => it.id === this.entity.id);
    
    if (index <= 0) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Returns `true`, if moving the entity down within its container is possible. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get enableMoveDown() {
    const siblings = this.getContainingCollection().collection.getAll();
    const maxIndex = siblings.length - 1;
    const index = siblings.findIndex(it => it.id === this.entity.id);
    
    if (index >= maxIndex) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * @param {Object} args 
   * @param {Application} args.application The parent application. 
   * @param {Object} args.entity The represented entity. 
   */
  constructor(args = {}) {
    super(args);
  }

  /** @override */
  activateListeners(html) {
    const id = this.entity.id;
    
    html.find(`#${id}-move-up`).click(async (event) => {
      event.stopPropagation();

      if (event.ctrlKey || event.shiftKey) {
        this.moveUp(true);
      } else {
        this.moveUp(false);
      }
    });

    html.find(`#${id}-move-down`).click(async (event) => {
      event.stopPropagation();

      if (event.ctrlKey || event.shiftKey) {
        this.moveDown(true);
      } else {
        this.moveDown(false);
      }
    });
  }
  
  /**
   * Returns the parent collection.
   * 
   * @returns {Object}
   * * `collection: ObservableCollection<Object>`
   * * `type: "generators" | "folders" | "chains"`
   * 
   * @virtual
   */
  getContainingCollection() {
    if (this.entity.parent.value === undefined) {
      if (this.application.data.generators.any(it => it.id === this.entity.id) === true) {
        return {
          collection: this.application.data.generators,
          type: "generators",
        };
      } else if (this.application.data.folders.any(it => it.id === this.entity.id) === true) {
        return {
          collection: this.application.data.folders,
          type: "folders",
        };
      } else if (this.application.data.chains.any(it => it.id === this.entity.id) === true) {
        return {
          collection: this.application.data.chains,
          type: "chains",
        };
      }
    } else {
      const parent = this.entity.parent.value;
      if (parent.generators.any(it => it.id === this.entity.id) === true) {
        return {
          collection: parent.generators,
          type: "generators",
        };
      } else if (parent.folders.any(it => it.id === this.entity.id) === true) {
        return {
          collection: parent.folders,
          type: "folders",
        };
      } else if (parent.chains.any(it => it.id === this.entity.id) === true) {
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
    if (this.entity.parent.value === undefined) return; // Already at root level. 

    this.application.suspendRendering = true;

    // Remove from current parent. 
    const container = this.getContainingCollection();
    container.collection.remove(this.entity);

    this.application.suspendRendering = false;

    // Add to root level collection. 
    if (container.type === "generators") {
      this.application.data.generators.add(this.entity);
    } else if (container.type === "folders") {
      this.application.data.folders.add(this.entity);
    } else if (container.type === "chains") {
      this.application.data.chains.add(this.entity);
    }
  }

  /**
   * Moves the represented entity up one index in its containing collection, if possible. 
   * 
   * @param {Boolean | undefined} toStart If `true`, moves up all the way to the first index. 
   * * default `false`
   * 
   * @virtual
   */
  moveUp(toStart = false) {
    if (this.enableMoveUp !== true) return;

    const collection = this.getContainingCollection().collection;
    const index = collection.getAll().findIndex(it => it.id === this.entity.id);

    let newIndex;
    if (toStart === true) {
      newIndex = 0;
    } else {
      newIndex = Math.max(0, index - 1);
    }

    collection.move(index, newIndex);
  }

  /**
   * Moves the represented entity down one index in its containing collection, if possible. 
   * 
   * @param {Boolean | undefined} toEnd If `true`, moves down all the way to the last index. 
   * * default `false`
   * 
   * @virtual
   */
  moveDown(toEnd = false) {
    if (this.enableMoveDown !== true) return;

    const collection = this.getContainingCollection().collection;
    const index = collection.getAll().findIndex(it => it.id === this.entity.id);
    const maxIndex = collection.length - 1;
    
    let newIndex;
    if (toEnd === true) {
      newIndex = maxIndex;
    } else {
      newIndex = Math.min(maxIndex, index + 1);
    }

    collection.move(index, newIndex);
  }
}
