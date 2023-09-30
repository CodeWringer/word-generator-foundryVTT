import AbstractPresenter from "../../abstract-presenter.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import { TEMPLATES } from "../../templates.mjs";
import WordGeneratorFolderPresenter from "../folder/word-generator-folder-presenter.mjs";
import WordGeneratorItemPresenter from "../word-generator-item/word-generator-item-presenter.mjs";

/**
 * This presenter handles a list of folders and generators. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {Array<WordGeneratorFolderPresenter>} folders
 * @property {Array<WordGeneratorItemPresenter>} generators
 */
export default class WordGeneratorListPresenter extends AbstractPresenter {
  get template() { return TEMPLATES.WORD_GENERATOR_LIST; }

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {Array<WordGeneratorFolderPresenter> | undefined} args.folders
   * @param {Array<WordGeneratorItemPresenter> | undefined} args.generators
   */
  constructor(args = {}) {
    super(args);

    this.folders = args.folders ?? [];
    this.generators = args.generators ?? [];
  }

  activateListeners(html) {
    // Child event handlers
    
    // Folders
    for (const presenter of this.folders) {
      presenter.activateListeners(html);
    }

    // Generators
    for (const presenter of this.generators) {
      presenter.activateListeners(html);
    }
  }
}