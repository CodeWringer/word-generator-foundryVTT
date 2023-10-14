import WgFolder from "../../../../business/model/wg-folder.mjs";
import WgGenerator from "../../../../business/model/wg-generator.mjs";
import AbstractPresenter from "../../../abstract-presenter.mjs";
import WgApplication from "../../../application/application-presenter.mjs";
import { TEMPLATES } from "../../../templates.mjs";
import WgFolderPresenter from "../folder-presenter.mjs";
import OrderedListPresenter from "../../ordered-list/ordered-list-presenter.mjs";
import WgGeneratorPresenter from "../../generator/generator-presenter.mjs";
import WgChain from "../../../../business/model/wg-chain.mjs";
import WgChainPresenter from "../../chain/chain-presenter.mjs";

/**
 * This presenter handles a list of folders and generators. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WgApplication} application The parent application. 
 * @property {Array<WgFolderPresenter>} folderPresenters Presenters of the 
 * folders. 
 * @property {Array<WgGeneratorPresenter>} generatorPresenters Presenters of the 
 * generators. 
 * @property {OrderedListPresenter} foldersPresenter Presenter of the 
 * ordered folders list. 
 * @property {OrderedListPresenter} generatorsPresenter Presenter of the 
 * ordered generators list. 
 * @property {OrderedListPresenter} chainsPresenter Presenter of the 
 * ordered chains list. 
 */
export default class WgFolderContentsPresenter extends AbstractPresenter {
  get template() { return TEMPLATES.FOLDER_CONTENTS; }

  /**
   * Maps the given entities to their respective presenters, which will be stored 
   * as properties on this object. 
   * 
   * @param {Object} args
   * @param {WgApplication} args.application The parent application. 
   * @param {Array<WgFolder> | undefined} args.folders
   * @param {Array<WgGenerator> | undefined} args.generators
   * @param {Array<WgChain> | undefined} args.chains
   */
  constructor(args = {}) {
    super(args);

    this.folders = args.folders ?? [];
    this.folderPresenters = this.folders.map(folder => 
      new WgFolderPresenter({
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
      new WgGeneratorPresenter({
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
    
    this.chains = args.chains ?? [];
    this.chainPresenters = this.chains.map(chain => 
      new WgChainPresenter({
        application: args.application,
        entity: chain,
      })
    );

    this.chainsPresenter = new OrderedListPresenter({
      application: args.application,
      itemPresenters: this.chainPresenters,
      showIndices: false,
      onMoveDownClicked: (maximum, itemId) => {
        const entity = this.chains.find(it => it.id === itemId);
        this.moveDown(entity, maximum);
      },
      onMoveUpClicked: (maximum, itemId) => {
        const entity = this.chains.find(it => it.id === itemId);
        this.moveUp(entity, maximum);
      },
    });
  }

  /** @override */
  activateListeners(html) {
    // Child event handlers
    this.foldersPresenter.activateListeners(html);
    this.generatorsPresenter.activateListeners(html);
    this.chainsPresenter.activateListeners(html);
  }
  
  /**
   * Moves the represented entity up one index in its containing collection, if possible. 
   * 
   * @param {Boolean | undefined} toStart If `true`, moves up all the way to the first index. 
   * * default `false`
   * @param {WgFolder | WgGenerator | WgChain} entity 
   */
  moveUp(entity, toStart = false) {
    const collection = entity.parentCollection;
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
   * @param {WgFolder | WgGenerator | WgChain} entity 
   */
  moveDown(entity, toEnd = false) {
    const collection = entity.parentCollection;
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
