import { TEMPLATES } from "../../templates.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import WordGeneratorItemPresenter from "../word-generator-item/word-generator-item-presenter.mjs";
import WordGeneratorListPresenter from "../word-generator-list/word-generator-list-presenter.mjs";
import { DragDropHandler } from "../../util/drag-drop-handler.mjs";
import ObservableWordGeneratorFolder from "../../../business/model/observable-word-generator-folder.mjs";
import DialogUtility from "../../dialog/dialog-utility.mjs";
import ObservableWordGeneratorItem from "../../../business/model/observable-word-generator-item.mjs";
import AbstractOrderableEntityPresenter from "../../abstract-orderable-entity-presenter.mjs";
import WordGeneratorChainPresenter from "../chain/word-generator-chain-presenter.mjs";
import ObservableWordGeneratorChain from "../../../business/model/observable-word-generator-chain.mjs";

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
 */
export default class WordGeneratorFolderPresenter extends AbstractOrderableEntityPresenter {
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

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {ObservableWordGeneratorFolder} args.entity The represented entity.  
   */
  constructor(args = {}) {
    super(args);
    
    this.contentListPresenter = new WordGeneratorListPresenter({
      application: args.application,
      folders: this.entity.folders.getAll(),
      generators: this.entity.generators.getAll(),
      chains: this.entity.chains.getAll(),
    });

    this._dragDropHandler = new DragDropHandler({
      entityId: this.entity.id,
      entityDataType: WordGeneratorFolderPresenter.entityDataType,
      acceptedDataTypes: [
        WordGeneratorFolderPresenter.entityDataType,
        WordGeneratorItemPresenter.entityDataType,
        WordGeneratorChainPresenter.entityDataType,
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
            this.application.data.folders.remove(folderToNest);
          } else {
            folderToNest.parent.value.folders.remove(folderToNest);
          }

          this.application.suspendRendering = false;

          // Add to the represented folder's children. 
          this.entity.folders.add(folderToNest);
        } else if (droppedEntityDataType === WordGeneratorItemPresenter.entityDataType) {
          // Assign the dragged generator to this folder, as a child. 

          const generatorToNest = this.application.getGeneratorById(droppedEntityId);

          // Avoid unnecessary operations. 
          if (this.entity.generators.contains(generatorToNest)) return;

          this.application.suspendRendering = true;

          // Remove from origin. 
          if (generatorToNest.parent.value === undefined) {
            this.application.data.generators.remove(generatorToNest);
          } else {
            generatorToNest.parent.value.generators.remove(generatorToNest);
          }

          this.application.suspendRendering = false;

          // Add to the represented folder's generators. 
          this.entity.generators.add(generatorToNest);
        } else if (droppedEntityDataType === WordGeneratorChainPresenter.entityDataType) {
          // Assign the dragged generator to this folder, as a child. 

          const toNest = this.application.getChainById(droppedEntityId);

          // Avoid unnecessary operations. 
          if (this.entity.chains.contains(toNest)) return;

          this.application.suspendRendering = true;

          // Remove from origin. 
          if (toNest.parent.value === undefined) {
            this.application.data.chains.remove(toNest);
          } else {
            toNest.parent.value.chains.remove(toNest);
          }

          this.application.suspendRendering = false;

          // Add to the represented folder's chains. 
          this.entity.chains.add(toNest);
        }
      }
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

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
            this.moveToRootLevel();
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
          name: game.i18n.localize("wg.chain.create"),
          icon: '<i class="fas fa-link stackable"><i class="fas fa-plus stacked wg-dark"></i></i>',
          callback: async () => {
            await this._createChain();
          }
        },
        {
          name: game.i18n.localize("wg.folder.delete"),
          icon: '<i class="fas fa-trash"></i>',
          callback: async () => {
            this.delete();
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

    html.find(`#${id}-add-chain`).click(async (event) => {
      event.stopPropagation();

      this._createChain();
    });

    // Drag & drop
    this._dragDropHandler.activateListeners(html);

    // Child event handlers

    this.contentListPresenter.activateListeners(html);
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
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    // Create the folder. 
    const newFolder = new ObservableWordGeneratorFolder({
      name: dialog.input,
    });
    this.entity.folders.add(newFolder);
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
    this.entity.generators.add(newGenerator);
  }

  /**
   * Creates a new child chain. 
   * 
   * @private
   */
  _createChain() {
    // Create the generator. 
    const newChain = new ObservableWordGeneratorChain({
      name: game.i18n.localize("wg.chain.defaultName"),
    });
    this.entity.chains.add(newChain);
  }

  /**
   * Prompts the user to enter a new name and if confirmed, applies it. 
   * 
   * @private
   * @async
   */
  async _edit() {
    const dialog = await new DialogUtility().showSingleInputDialog({
      localizedTitle: game.i18n.localize("wg.folder.edit"),
      localizedInputLabel: game.i18n.localize("wg.folder.name"),
      value: this.entity.name.value,
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    this.entity.name.value = dialog.input;
  }
}
