/**
 * Represents the abstract base implementation of a presenter. 
 * 
 * A presenter's purpose is to prepare the data to pass to its `template`, via the `getData` method 
 * and to prepare the UI for user-interactivity by registering event-callbacks to elements on the DOM, 
 * via the `activateListeners` method. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * * Abstract
 * @property {Application} application The parent application. 
 * @property {Object} entity The represented entity. 
 * 
 * @abstract
 */
export default class AbstractPresenter {
  /**
   * Path to the Handlebars template that represents the entity. 
   * 
   * @type {String}
   * @readonly
   * @abstract
   */
  get template() { throw new Error("Not implemented"); }

  /**
   * @param {Object} args 
   * @param {Application} args.application The parent application. 
   * @param {Object} args.entity The represented entity. 
   */
  constructor(args = {}) {
    this.application = args.application;
    this.entity = args.entity;
  }

  /**
   * Returns the data object that is to be passed to the Handlebars template for rendering. 
   * 
   * @returns {Object} The data to pass to the Handlebars template. 
   */
  getData() {
    return {
      presenter: this,
    };
  }


  /**
   * Registers event listeners to enable user-interactivity. 
   * 
   * @param {JQuery} html The DOM of the rendered entity. 
   * 
   * @abstract
   */
  activateListeners(html) {
    throw new Error("Not implemented");
  }
  
  /**
   * Triggers a re-render. 
   */
  render() {
    this.application.render();
  }

  /**
   * Returns either the value of the given 'change' event handler's context object 
   * or `undefined`, if the trimmed value is equal to an empty string. 
   * 
   * @param {Object} data Context object of a JQuery 'change' event handler. 
   * 
   * @returns {Any | undefined}
   * 
   * @protected
   */
  parseEmptyToUndefined(data) {
    const newVal = $(data.target).val().trim();
    return newVal === "" ? undefined : newVal;
  }

  /**
   * Returns either the value of the given 'change' event handler's context object 
   * or the given value, if the trimmed value is equal to an empty string. 
   * 
   * @param {Object} data Context object of a JQuery 'change' event handler. 
   * @param {Any} emptyValue The value to return, in case of an 'empty' value. 
   * 
   * @returns {Any | undefined}
   * 
   * @protected
   */
  parseEmptyToGiven(data, emptyValue) {
    const newVal = $(data.target).val().trim();
    return newVal === "" ? emptyValue : newVal;
  }
  
  /**
   * Ensures the current value is correctly reflected by the drop-down identified via the given id. 
   * 
   * @param {JQuery} html FormApplication root element. 
   * @param {String} id The id of the drop-down to synchronize. 
   * @param {Any} currentValue The current value of the field represented by the drop-down. 
   * 
   * @protected
   */
  syncDropDownValue(html, id, currentValue) {
    const selectElement = html.find(`#${id}`);
    const optionElements = selectElement.find('option');
    const currentValueAsString = "" + currentValue;
    for(let i = 0; i < optionElements.length; i++) {
      const optionElement = optionElements[i];
      if (optionElement.value == currentValueAsString) {
        selectElement[0].selectedIndex = i;
        break;
      }
    }
  }

}