import WgFolder from "../../../business/model/wg-folder.mjs";
import WgGenerator from "../../../business/model/wg-generator.mjs";
import AbstractPresenter from "../../abstract-presenter.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import { TEMPLATES } from "../../templates.mjs";
import WordGeneratorFolderPresenter from "../folder/word-generator-folder-presenter.mjs";
import OrderedListPresenter from "../ordered-list/ordered-list-presenter.mjs";
import WordGeneratorItemPresenter from "../word-generator-item/word-generator-item-presenter.mjs";

/**
 * This presenter handles a list of folders and generators. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {Array<WordGeneratorFolderPresenter>} folderPresenters Presenters of the 
 * folders. 
 * @property {Array<WordGeneratorItemPresenter>} generatorPresenters Presenters of the 
 * generators. 
 * @property {OrderedListPresenter} foldersPresenter Presenter of the 
 * ordered folders list. 
 * @property {OrderedListPresenter} generatorsPresenter Presenter of the 
 * ordered generators list. 
 */
export default class WordGeneratorListPresenter extends AbstractPresenter {
  get template() { return TEMPLATES.WORD_GENERATOR_LIST; }

  /**
   * Maps the given entities to their respective presenters, which will be stored 
   * as properties on this object. 
   * 
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {Array<WgFolder> | undefined} args.folders
   * @param {Array<WgGenerator> | undefined} args.generators
   */
  constructor(args = {}) {
    super(args);

    this.folders = args.folders ?? [];
    this.folderPresenters = this.folders.map(folder => 
      new WordGeneratorFolderPresenter({
        application: args.application,
        entity: folder
      })
    );

    this.foldersPresenter = new OrderedListPresenter({
      application: args.application,
      itemPresenters: this.folderPresenters,
      showIndices: false,
      onMoveDownClicked: (maximum, itemId) => {
        const entity = this.folders.find(it => it.id === itemId);
        this.moveDown(entity, maximum);
      },
      onMoveUpClicked: (maximum, itemId) => {
        const entity = this.folders.find(it => it.id === itemId);
        this.moveUp(entity, maximum);
      },
    });
    
    this.generators = args.generators ?? [];
    this.generatorPresenters = this.generators.map(generator => 
      new WordGeneratorItemPresenter({
        application: args.application,
        entity: generator,
      })
    );

    this.generatorsPresenter = new OrderedListPresenter({
      application: args.application,
      itemPresenters: this.generatorPresenters,
      showIndices: false,
      onMoveDownClicked: (maximum, itemId) => {
        const entity = this.generators.find(it => it.id === itemId);
        this.moveDown(entity, maximum);
      },
      onMoveUpClicked: (maximum, itemId) => {
        const entity = this.generators.find(it => it.id === itemId);
        this.moveUp(entity, maximum);
      },
    });
  }

  /** @override */
  activateListeners(html) {
    // Child event handlers
    this.foldersPresenter.activateListeners(html);
    this.generatorsPresenter.activateListeners(html);
  }
  
  /**
   * Moves the represented entity up one index in its containing collection, if possible. 
   * 
   * @param {Boolean | undefined} toStart If `true`, moves up all the way to the first index. 
   * * default `false`
   * @param {Object} entity 
   */
  moveUp(entity, toStart = false) {
    const collection = entity.getContainingCollection().collection;
    const index = collection.getAll().findIndex(it => it.id === entity.id);

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
   * @param {Object} entity 
   */
  moveDown(entity, toEnd = false) {
    const collection = entity.getContainingCollection().collection;
    const index = collection.getAll().findIndex(it => it.id === entity.id);
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
