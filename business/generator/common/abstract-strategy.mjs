import AbstractEntityPresenter from "../../../presentation/abstract-entity-presenter.mjs";

/**
 * Represents the abstract base class of concrete strategy implementations. 
 * 
 * @abstract
 */
export default class AbstractStrategy {
  /**
   * Returns a new instance of this object, based on the given DTO. 
   * 
   * @param {Object} dto 
   * 
   * @returns {AbstractStrategy}
   * 
   * @static
   * @abstract
   */
  static fromDto(dto) {
    throw new Error("Not implemented");
  }

  /**
   * ID of this strategy. 
   * 
   * @type {String}
   * @readonly
   * @abstract
   */
  get id () { throw new Error("Not implemented"); }

  /**
   * Returns the presenter of this strategy instance's settings. 
   * 
   * This presenter must serve both as a means of displaying and allowing 
   * the user to modify the strategy settings. 
   * 
   * @type {AbstractEntityPresenter}
   * @readonly
   * @abstract
   */
  get settingsPresenter() { throw new Error("Not implemented"); }

  /**
   * Returns a localized info text. 
   * 
   * @type {String}
   * @readonly
   * @abstract
   */
  get localizedInfoText() { throw new Error("Not implemented"); }

  /**
   * Returns a data transfer object version of this object. 
   * 
   * @returns {Object}
   * 
   * @abstract
   */
  toDto() {
    throw new Error("Not implemented");
  }
}
