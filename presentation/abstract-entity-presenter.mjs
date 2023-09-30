import AbstractPresenter from "./abstract-presenter.mjs";

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
}