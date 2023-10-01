import { TEMPLATES } from "../../templates.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import WordGeneratorItemPresenter from "../word-generator-item/word-generator-item-presenter.mjs";
import WordGeneratorListPresenter from "../word-generator-list/word-generator-list-presenter.mjs";
import { DragDropHandler } from "../../util/drag-drop-handler.mjs";
import ObservableWordGeneratorFolder from "../../../business/model/observable-word-generator-folder.mjs";
import DialogUtility from "../../util/dialog-utility.mjs";
import ObservableWordGeneratorItem from "../../../business/model/observable-word-generator-item.mjs";
import ObservableCollection from "../../../common/observables/observable-collection.mjs";

/**
 * This presenter handles a singular folder. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {ObservableWordGeneratorFolder} entity The represented entity.  
 * @property {String} id
 * * Read-only
 * @property {WordGeneratorListPresenter} contentListPresenter
 * @property {Boolean} disableMoveUp Is `true`, if moving the represented folder up 
 * is impossible. 
 * * Read-only
 * @property {Boolean} disableMoveDown Is `true`, if moving the represented folder down 
 * is impossible. 
 * * Read-only
 */
export default class WordGeneratorFolderPresenter extends AbstractEntityPresenter {
  /**
   * Returns the data type of the represented entity. 
   * 
   * For use in the drag and drop handler, so that drop events 
   * can be handled appropriately. 
   * 
   * @type {String}
   * @readonly
   * @static
   */
  static entityDataType = "WordGeneratorFolder";

  get template() { return TEMPLATES.WORD_GENERATOR_FOLDER; }

  get id() { return this.entity.id; }

  get name() { return this.entity.name.value; }

  get isExpanded() { return this.entity.isExpanded.value; }

  get disableMoveUp() {
    const folders = this._getContainingCollection().getAll();
    const index = folders.findIndex(it => it.id === this.entity.id);
    
    if (index <= 0) {
      return true;
    } else {
      return false;
    }
  }

  get disableMoveDown() {
    const folders = this._getContainingCollection().getAll();
    const maxIndex = folders.length - 1;
    const index = folders.findIndex(it => it.id === this.entity.id);
    
    if (index >= maxIndex) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {ObservableWordGeneratorFolder} args.entity The represented entity.  
   */
  constructor(args = {}) {
    super(args);

    const childFolderPresenters = this.entity.children.getAll().map(folder => 
      new WordGeneratorFolderPresenter({
        application: args.application,
        entity: folder
      })
    );

    const itemPresenters = this.entity.items.getAll().map(generator => 
      new WordGeneratorItemPresenter({
        application: args.application,
        entity: generator,
      })
    );

    this.contentListPresenter = new WordGeneratorListPresenter({
      application: args.application,
      folders: childFolderPresenters,
      generators: itemPresenters,
    });

    this._dragDropHandler = new DragDropHandler({
      entityId: this.entity.id,
      entityDataType: WordGeneratorFolderPresenter.entityDataType,
      acceptedDataTypes: [
        WordGeneratorFolderPresenter.entityDataType,
        WordGeneratorItemPresenter.entityDataType,
      ],
      receiverElementId: `${this.entity.id}-header`,
      draggableElementId: `${this.entity.id}-header`,
      dropHandler: (droppedEntityId, droppedEntityDataType) => {
        if (droppedEntityDataType === WordGeneratorFolderPresenter.entityDataType) {
          // Assign the dragged folder to this folder, as a child. 

          const folderToNest = this.application.getFolderById(droppedEntityId);

          // Avoid recursion. 
          if (folderToNest.id === this.entity.id) return; 
          if (this.entity.isChildOf(folderToNest)) return;

          this.application.suspendRendering = true;

          // Remove from origin. 
          if (folderToNest.parent.value === undefined) {
            this.application._data.folders.remove(folderToNest);
          } else {
            folderToNest.parent.value.children.remove(folderToNest);
          }

          this.application.suspendRendering = false;

          // Add to the represented folder's children. 
          this.entity.children.add(folderToNest);
        } else if (droppedEntityDataType === WordGeneratorItemPresenter.entityDataType) {
          // Assign the dragged generator to this folder, as a child. 

          const generatorToNest = this.application.getGeneratorById(droppedEntityId);

          // Avoid unnecessary operations. 
          if (this.entity.items.contains(generatorToNest)) return;

          this.application.suspendRendering = true;

          // Remove from origin. 
          if (generatorToNest.parent.value === undefined) {
            this.application._data.generators.remove(generatorToNest);
          } else {
            generatorToNest.parent.value.items.remove(generatorToNest);
          }

          this.application.suspendRendering = false;

          // Add to the represented folder's generators. 
          this.entity.items.add(generatorToNest);
        }
      }
    });
  }

  activateListeners(html) {
    const thiz = this;
    const id = this.entity.id;

    const headerElement = html.find(`#${id}-header`);
    headerElement.click((event) => {
      event.stopPropagation();

      this.entity.isExpanded.value = !this.entity.isExpanded.value;
    });

    new ContextMenu(
      html, 
      `#${id}-header`,
      [
        {
          name: game.i18n.localize("wg.folder.edit"),
          icon: '<i class="fas fa-edit"></i>',
          callback: async () => {
            this._edit();
          }
        },
        {
          name: game.i18n.localize("wg.general.moveToRootLevel"),
          icon: '<i class="fas fa-angle-double-up"></i>',
          callback: async () => {
            this._moveToRootLevel();
          },
          condition: () => {
            return this.entity.parent.value !== undefined;
          }
        },
        {
          name: game.i18n.localize("wg.generator.create"),
          icon: '<i class="fas fa-scroll stackable"><i class="fas fa-plus stacked wg-dark"></i></i>',
          callback: async () => {
            this._createGenerator();
          }
        },
        {
          name: game.i18n.localize("wg.folder.create"),
          icon: '<i class="fas fa-folder stackable"><i class="fas fa-plus stacked wg-dark"></i></i>',
          callback: async () => {
            await this._createFolder();
          }
        },
        {
          name: game.i18n.localize("wg.folder.delete"),
          icon: '<i class="fas fa-trash"></i>',
          callback: async () => {
            this._delete();
          }
        },
      ]
    );

    html.find(`#${id}-add-generator`).click(async (event) => {
      event.stopPropagation();
      
      this._createGenerator();
    });

    html.find(`#${id}-add-folder`).click(async (event) => {
      event.stopPropagation();

      this._createFolder();
    });

    html.find(`#${id}-move-up`).click(async (event) => {
      event.stopPropagation();

      if (event.ctrlKey || event.shiftKey) {
        this._moveUp(true);
      } else {
        this._moveUp(false);
      }
    });

    html.find(`#${id}-move-down`).click(async (event) => {
      event.stopPropagation();

      if (event.ctrlKey || event.shiftKey) {
        this._moveDown(true);
      } else {
        this._moveDown(false);
      }
    });

    // Drag & drop
    this._dragDropHandler.activateListeners(html);

    // Child event handlers

    this.contentListPresenter.activateListeners(html);
  }

  /**
   * Returns the parent folder collection.
   * 
   * @returns {ObservableCollection<ObservableWordGeneratorFolder>}
   */
  _getContainingCollection() {
    let folders;
    if (this.entity.parent.value === undefined) {
      folders = this.application._data.folders;
    } else {
      folders = this.entity.parent.value.children;
    }
    return folders;
  }

  /**
   * Prompts the user for a name and then creates a new child folder. 
   * 
   * @private
   * @async
   */
  async _createFolder() {
    const dialog = await new DialogUtility().showSingleInputDialog({
      localizedTitle: game.i18n.localize("wg.folder.create"),
      localizedInputLabel: game.i18n.localize("wg.folder.name"),
    });

    if (dialog.confirmed !== true) return;

    // Create the folder. 
    const newFolder = new ObservableWordGeneratorFolder({
      name: dialog.input,
    });
    this.entity.children.add(newFolder);
  }

  /**
   * Creates a new child generator. 
   * 
   * @private
   */
  _createGenerator() {
    // Create the generator. 
    const newGenerator = new ObservableWordGeneratorItem({
      name: game.i18n.localize("wg.generator.defaultName"),
    });
    this.entity.items.add(newGenerator);
  }

  /**
   * Moves this folder to the root level, if possible. 
   * 
   * @private
   */
  _moveToRootLevel() {
    if (this.entity.parent.value === undefined) return; // Already at root level. 

    this.application.suspendRendering = true;

    // Remove from current parent. 
    const folders = this._getContainingCollection();
    folders.remove(this.entity);

    this.application.suspendRendering = false;

    // Add to root level collection. 
    this.application._data.folders.add(this.entity);
  }

  /**
   * Moves the folder up one index in its containing collection, if possible. 
   * 
   * @param {Boolean | undefined} toStart If `true`, moves up all the way to the first index. 
   * * default `false`
   * 
   * @private
   */
  _moveUp(toStart = false) {
    if (this.disableMoveUp === true) return;

      const folders = this._getContainingCollection();
      const index = folders.getAll().findIndex(it => it.id === this.entity.id);

      let newIndex;
      if (toStart === true) {
        newIndex = 0;
      } else {
        newIndex = Math.max(0, index - 1);
      }

      folders.move(index, newIndex);
  }

  /**
   * Moves the folder down one index in its containing collection, if possible. 
   * 
   * @param {Boolean | undefined} toEnd If `true`, moves down all the way to the last index. 
   * * default `false`
   * 
   * @private
   */
  _moveDown(toEnd = false) {
    if (this.disableMoveDown === true) return;

    const folders = this._getContainingCollection();
    const index = folders.getAll().findIndex(it => it.id === this.entity.id);
    const maxIndex = folders.length - 1;
    
    let newIndex;
    if (toEnd === true) {
      newIndex = maxIndex;
    } else {
      newIndex = Math.max(maxIndex, index + 1);
    }

    folders.move(index, newIndex);
  }

  /**
   * Prompts the user to enter a new name and if confirmed, applies it. 
   * 
   * @private
   * @async
   */
  async _edit() {
    const dialog = await new DialogUtility().showSingleInputDialog({
      localizedTitle: game.i18n.localize("wg.folder.create"),
      localizedInputLabel: game.i18n.localize("wg.folder.name"),
      value: thiz.entity.name.value,
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    thiz.entity.name.value = dialog.input;
  }

  /**
   * Prompts the user to confirm and if confirmed, deletes this folder. 
   * 
   * @private
   * @async
   */
  async _delete() {
    const dialog = await new DialogUtility().showConfirmationDialog({
      localizedTitle: game.i18n.localize("wg.folder.confirmDeletion"),
      content: game.i18n.localize("wg.general.confirmDeletionOf").replace("%s", this.entity.name.value),
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    const collection = this._getContainingCollection();
    collection.remove(this.entity);
  }
}
