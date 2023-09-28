import WordGeneratorFolder from "../../../business/model/word-generator-folder.mjs";
import AbstractPresenter from "../../abstract-presenter.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import { TEMPLATES } from "../../templates.mjs";

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
 */
export default class WordGeneratorFolderPresenter extends AbstractPresenter {
  get template() { return TEMPLATES.WORD_GENERATOR_FOLDER; }

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
  }

  activateListeners(html) {
    const thiz = this;
  }
}