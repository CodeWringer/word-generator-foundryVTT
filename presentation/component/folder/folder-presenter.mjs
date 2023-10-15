import { TEMPLATES } from "../../templates.mjs";
import WgApplication from "../../application/application-presenter.mjs";
import WgGeneratorPresenter from "../generator/generator-presenter.mjs";
import WgFolderContentsPresenter from "../folder/contents/folder-contents-presenter.mjs";
import { DragDropHandler } from "../../util/drag-drop-handler.mjs";
import WgFolder from "../../../business/model/wg-folder.mjs";
import DialogUtility from "../../dialog/dialog-utility.mjs";
import WgGenerator from "../../../business/model/wg-generator.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";
import WgChainPresenter from "../chain/chain-presenter.mjs";
import WgChain from "../../../business/model/wg-chain.mjs";
import WgApplicationData from "../../../business/model/wg-application-data.mjs";

/**
 * This presenter handles a singular folder. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WgApplication} application The parent application. 
 * @property {WgFolder} entity The represented entity.  
 * @property {String} id
 * * Read-only
 * @property {WgFolderContentsPresenter} contentListPresenter
 */
export default class WgFolderPresenter extends AbstractEntityPresenter {
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
  static entityDataType = "WgFolder";

  get template() { return TEMPLATES.FOLDER; }

  get id() { return this.entity.id; }

  get name() { return this.entity.name.value; }

  get isExpanded() { return this.entity.isExpanded.value; }

  /**
   * @param {Object} args
   * @param {WgApplication} args.application The parent application. 
   * @param {WgFolder} args.entity The represented entity.  
   */
  constructor(args = {}) {
    super(args);
    
    this.contentListPresenter = new WgFolderContentsPresenter({
      application: args.application,
      folders: this.entity.folders.getAll(),
      generators: this.entity.generators.getAll(),
      chains: this.entity.chains.getAll(),
    });

    this._dragDropHandler = new DragDropHandler({
      entityId: this.entity.id,
      entityDataType: WgFolderPresenter.entityDataType,
      acceptedDataTypes: [
        WgFolderPresenter.entityDataType,
        WgGeneratorPresenter.entityDataType,
        WgChainPresenter.entityDataType,
      ],
      receiverElementId: `${this.entity.id}-header`,
      draggableElementId: `${this.entity.id}-header`,
      dragOverClass: "wg-dragover",
      dropHandler: (droppedEntityId, droppedEntityDataType) => {
        let toNest;
        let destinationCollection;

        if (droppedEntityDataType === WgFolderPresenter.entityDataType) {
          toNest = this.application.data.rootFolder.getFolderById(droppedEntityId);

          // Avoid recursion. 
          if (toNest.id === this.entity.id) return; 
          if (this.entity.isChildOf(toNest)) return;

          destinationCollection = this.entity.folders;
        } else if (droppedEntityDataType === WgGeneratorPresenter.entityDataType) {
          toNest = this.application.data.rootFolder.getGeneratorById(droppedEntityId);
          destinationCollection = this.entity.generators;
        } else if (droppedEntityDataType === WgChainPresenter.entityDataType) {
          toNest = this.application.data.rootFolder.getChainById(droppedEntityId);
          destinationCollection = this.entity.chains;
        }

        // Avoid unnecessary operations. 
        if (destinationCollection === undefined 
          || toNest === undefined 
          || destinationCollection.contains(toNest)) return;

        this.application.suspendRendering = true;

        // Remove from origin. 
        toNest.parentCollection.remove(toNest);

        this.application.suspendRendering = false;

        destinationCollection.add(toNest);
      }
    });
  }

  /** @override */
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
            this.application.suspendRendering = true;
            this.entity.moveToRootLevel();
            this.application.suspendRendering = false;
            this.application.render();
          },
          condition: () => {
            return this.entity.parent.value !== undefined
              && this.entity.parent.value.id !== WgApplicationData.ROOT_FOLDER_ID;
          }
        },
        {
          name: game.i18n.localize("wg.generator.create"),
          icon: '<i class="fas fa-scroll stackable"><i class="fas fa-plus stacked wg-dark"></i></i>',
          callback: async () => {
            await this._createGenerator();
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

    html.find(`#${id}-add-folder`).click(async (event) => {
      event.stopPropagation();

      await this._createFolder();
    });

    html.find(`#${id}-add-generator`).click(async (event) => {
      event.stopPropagation();
      
      await this._createGenerator();
    });

    html.find(`#${id}-add-chain`).click(async (event) => {
      event.stopPropagation();
      
      await this._createChain();
    });

    // Drag & drop
    this._dragDropHandler.activateListeners(html);

    // Child event handlers

    this.contentListPresenter.activateListeners(html);
  }

  /**
   * Prompts the user for a name and then creates a new child folder. 
   * 
   * @async
   * @private
   */
  async _createFolder() {
    const dialog = await new DialogUtility().showSingleInputDialog({
      localizedTitle: game.i18n.localize("wg.folder.create"),
      localizedInputLabel: game.i18n.localize("wg.folder.name"),
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    // Create the folder. 
    const newFolder = new WgFolder({
      name: dialog.input,
      applicationData: this.entity.applicationData,
    });
    this.entity.folders.add(newFolder);
  }

  /**
   * Prompts the user for a name and then creates a new child generator. 
   * 
   * @async
   * @private
   */
  async _createGenerator() {
    const dialog = await new DialogUtility().showSingleInputDialog({
      localizedTitle: game.i18n.localize("wg.generator.create"),
      localizedInputLabel: game.i18n.localize("wg.generator.name"),
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    // Create the generator. 
    const newGenerator = new WgGenerator({
      name: dialog.input,
      applicationData: this.entity.applicationData,
    });
    this.entity.generators.add(newGenerator);
  }

  /**
   * Prompts the user for a name and then creates a new child chain. 
   * 
   * @async
   * @private
   */
  async _createChain() {
    const dialog = await new DialogUtility().showSingleInputDialog({
      localizedTitle: game.i18n.localize("wg.chain.create"),
      localizedInputLabel: game.i18n.localize("wg.chain.name"),
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    // Create the generator. 
    const newChain = new WgChain({
      name: dialog.input,
      applicationData: this.entity.applicationData,
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
