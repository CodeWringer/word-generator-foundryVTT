import AbstractPresenter from "./abstract-presenter.mjs";
import DialogUtility from "./dialog/dialog-utility.mjs";

/**
 * Represents the abstract base implementation of a presenter of a singular entity. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * * Abstract
 * @property {Application} application The parent application. 
 * @property {Object} entity The represented entity. 
 * 
 * @abstract
 */
export default class AbstractEntityPresenter extends AbstractPresenter {
  /**
   * @param {Object} args 
   * @param {Application} args.application The parent application. 
   * @param {Object} args.entity The represented entity. 
   */
  constructor(args = {}) {
    super(args);

    this.entity = args.entity;
  }
  
  /**
   * Prompts the user to confirm and if confirmed, deletes this generator. 
   * 
   * @param {Object} args
   * @param {String | undefined} args.localizedTitle
   * * default `wg.general.confirmDeletion`
   * 
   * @async
   * @virtual
   */
  async delete(args = {}) {
    const dialog = await new DialogUtility().showConfirmationDialog({
      localizedTitle: game.i18n.localize(args.localizedTitle ?? "wg.general.confirmDeletion"),
      content: game.i18n.localize("wg.general.confirmDeletionOf").replace("%s", this.entity.name.value),
      modal: true,
    });

    if (dialog.confirmed !== true) return;

    this.entity.delete();
  }
}
