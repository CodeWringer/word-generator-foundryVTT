import { TEMPLATES } from "../../templates.mjs";
import WordGeneratorFolder from "../../../business/model/word-generator-folder.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import WordGeneratorItemPresenter from "../word-generator-item/word-generator-item-presenter.mjs";
import WordGeneratorListPresenter from "../word-generator-list/word-generator-list-presenter.mjs";
import { DragDropHandler } from "../../util/drag-drop-handler.mjs";

/**
 * This presenter handles a singular folder. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {WordGeneratorFolder} entity The represented entity.  
 * @property {Boolean} isExpanded
 * @property {WordGeneratorFolderPresenter | undefined} parent
 * @property {Array<WordGeneratorFolderPresenter>} children
 * @property {Array<WordGeneratorItemPresenter>} items
 * @property {WordGeneratorListPresenter} contentListPresenter
 */
export default class WordGeneratorFolderPresenter extends AbstractEntityPresenter {
  get template() { return TEMPLATES.WORD_GENERATOR_FOLDER; }

  /**
   * Returns the data type of the represented entity. 
   * 
   * For use in the drag and drop handler, so that drop events 
   * can be handled appropriately. 
   * 
   * @type {String}
   * @readonly
   */
  get entityDataType() { return "WordGeneratorFolder"; }

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {WordGeneratorFolder} args.entity The represented entity.  
   * @param {Boolean | undefined} args.isExpanded
   * * default `false`
   * @param {WordGeneratorFolderPresenter | undefined} args.parent
   * @param {Array<WordGeneratorFolderPresenter> | undefined} args.children
   * @param {Array<WordGeneratorItemPresenter> | undefined} args.items
   */
  constructor(args = {}) {
    super(args);

    this.isExpanded = args.isExpanded ?? false;
    this.parent = args.parent;
    this.children = args.children ?? [];
    this.items = args.items ?? [];

    this.contentListPresenter = new WordGeneratorListPresenter({
      application: args.application,
      folders: this.children,
      generators: this.items,
    });

    this._dragDropHandler = new DragDropHandler({
      entityId: this.entity.id,
      entityDataType: this.entityDataType,
      dropHandler: (droppedEntityId, droppedEntityDataType) => {
        if (droppedEntityDataType === this.entityDataType) {
          // Assign the dragged folder to this folder, as a child. 
          this.application.moveFolder(droppedEntityId, this.entity.id);
        }
      }
    });
  }

  activateListeners(html) {
    const id = this.entity.id;

    const headerElement = html.find(`#${id}-header`);
    headerElement.click((event) => {
      // TODO left click -> expand
      this.isExpanded = !(this.isExpanded ?? false);
      this.render();
      // TODO right click -> context menu
    });
    html.find(`#${id}-add-generator`).click(() => {
      this.application.createGenerator(id);
    });
    html.find(`#${id}-add-folder`).click(() => {
      this.application.createFolder(id);
    });

    // Drag & drop
    this._dragDropHandler.activateListeners(html);

    // Child event handlers

    this.contentListPresenter.activateListeners(html);
  }

  /**
   * Returns this presenter or one of this presenter's children, whose folder ID 
   * matches the given ID. 
   * 
   * @param {String} folderId ID of the folder whose presenter to fetch. 
   * 
   * @returns {WordGeneratorFolderPresenter | undefined} The presenter whose 
   * folder ID was given. 
   */
  getPresenterByFolderId(folderId) {
    if (this.entity.id === folderId) {
      return this;
    } else {
      this.children.forEach(childFolder => {
        const childResult = childFolder.getPresenterByFolderId(folderId);
        if (childResult !== undefined) {
          return childResult;
        }
      });
    }
    return undefined;
  }

  /**
   * Returns this presenter or one of this presenter's children, which contains a 
   * generator item with the given ID. 
   * 
   * @param {String} generatorId ID of the generator whose containing folder 
   * presenter to fetch. 
   * 
   * @returns {WordGeneratorFolderPresenter | undefined} The presenter whose folder 
   * contains the given generator ID. 
   */
  getPresenterByGeneratorId(generatorId) {
    if (this.items.find(it => it.entity.id === generatorId) !== undefined) {
      return this;
    } else {
      this.children.forEach(childFolder => {
        const childResult = childFolder.getPresenterByGeneratorId(generatorId);
        if (childResult !== undefined) {
          return childResult;
        }
      });
    }
    return undefined;
  }

  /**
   * Adds the given presenter as a child. 
   * 
   * @param {WordGeneratorFolderPresenter} presenter 
   * @param {Number | undefined} index The new index to add the child at. 
   * * By default, adds to the end of the list. 
   */
  addChild(presenter, index) {
    if (presenter.parent !== undefined) {
      presenter.parent.removeChild(presenter);
    }

    // Add presenter child. 
    presenter.parent = this;
    if (index === undefined || index < 0 || index >= this.children.length) {
      this.children.push(presenter);
    } else {
      this.children.splice(index, 0, presenter);
    }
    
    // Add entity child. 
    presenter.entity.parentId = this.entity.id;
    if (index === undefined || index < 0 || index >= this.entity.childIds.length) {
      this.entity.childIds.push(presenter.entity.id);
    } else {
      this.entity.childIds.splice(index, 0, presenter.entity.id);
    }
  }

  /**
   * Removes the given child. 
   * 
   * @param {WordGeneratorFolderPresenter} childPresenter The child to remove. 
   */
  removeChild(childPresenter) {
    if (childPresenter.parent === undefined || childPresenter.parent.id === this.entity.id) {
      // The given presenter isn't a child of this folder presenter. Illegal argument. 
      return;
    }
    // Remove presenter child. 
    childPresenter.parent = undefined;

    const childIndex = this.children.findIndex(it => it.entity.id === childPresenter.entity.id);
    this.children.splice(childIndex, 1);

    // Remove entity child. 
    childPresenter.entity.parentId = undefined;

    const childEntityIndex = this.entity.childIds.findIndex(it => it === childPresenter.entity.id);
    this.entity.childIds.splice(childEntityIndex, 1);
  }
}
