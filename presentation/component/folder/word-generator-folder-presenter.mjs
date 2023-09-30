import { TEMPLATES } from "../../templates.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import WordGeneratorItemPresenter from "../word-generator-item/word-generator-item-presenter.mjs";
import WordGeneratorListPresenter from "../word-generator-list/word-generator-list-presenter.mjs";
import { DragDropHandler } from "../../util/drag-drop-handler.mjs";
import ObservableWordGeneratorFolder from "../../../business/model/observable-word-generator-folder.mjs";
import DialogUtility from "../../util/dialog-utility.mjs";
import ObservableWordGeneratorItem from "../../../business/model/observable-word-generator-item.mjs";

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
export default class WordGeneratorFolderPresenter extends AbstractEntityPresenter {
  get template() { return TEMPLATES.WORD_GENERATOR_FOLDER; }

  get id() { return this.entity.id; }

  get name() { return this.entity.name.value; }

  get isExpanded() { return this.entity.isExpanded.value; }

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
      entityDataType: this.entityDataType,
      dropHandler: (droppedEntityId, droppedEntityDataType) => {
        if (droppedEntityDataType === this.entityDataType) {
          // Assign the dragged folder to this folder, as a child. 
          const folderToNest = this.application.getFolderById(droppedEntityId);
          this.entity.children.add(folderToNest);
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
          name: "Edit Folder",
          icon: '<i class="fas fa-edit"></i>',
          callback: async () => {
            const dialog = await new DialogUtility().showSingleInputDialog({
              localizedTitle: game.i18n.localize("wg.folder.create"),
              localizedInputLabel: game.i18n.localize("wg.folder.name"),
              value: thiz.entity.name.value
            });
        
            if (dialog.confirmed !== true) return;

            thiz.entity.name.value = dialog.input;
          }
        },
        {
          name: "Delete",
          icon: '<i class="fas fa-trash"></i>',
          callback: async () => {
            const dialog = await new DialogUtility().showConfirmationDialog({
              localizedTitle: game.i18n.localize("wg.generator.confirmDeletion"),
              content: game.i18n.localize("wg.general.confirmDeletionOf").replace("%s", this.entity.name.value),
            });

            if (dialog.confirmed !== true) return;

            if (thiz.entity.parent.value === undefined) {
              thiz.application._data.folders.remove(thiz.entity);
            } else {
              thiz.entity.parent.value = undefined;
            }
          }
        },
      ]
    );

    html.find(`#${id}-add-generator`).click(async (event) => {
      event.stopPropagation();
      
      // Create the generator. 
      const newGenerator = new ObservableWordGeneratorItem({
        name: game.i18n.localize("wg.generator.defaultName"),
      });
      this.entity.items.add(newGenerator);
    });

    html.find(`#${id}-add-folder`).click(async (event) => {
      event.stopPropagation();

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
    });

    // Drag & drop
    this._dragDropHandler.activateListeners(html);

    // Child event handlers

    this.contentListPresenter.activateListeners(html);
  }
}
