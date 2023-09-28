import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import WordGeneratorPresentationFolder from "./word-generator-presentation-folder.mjs";

/**
 * This presenter handles a folder. 
 * 
 * It activates event listeners, sets initial states and performs other such presentation logic. 
 */
export default class WordGeneratorFolderPresenter {
  /**
   * @param {WordGeneratorPresentationFolder} args.listItem The represented item. 
   * @param {Number} args.listIndex Index of this item in the list. 
   * @param {String} args.userId ID of the user that owns the list. 
   * @param {WordGeneratorApplication} application The owning application. 
   */
  constructor(args) {
    this.listItem = args.listItem;
    this.listIndex = args.listIndex;
    this.userId = args.userId;
    this.application = args.application;
  }
  
  /**
   * Registers event listeners to enable user-interactivity. 
   * 
   * @param {HTMLElement} html 
   */
  activateListeners(html) {
  }
}