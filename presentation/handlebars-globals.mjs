/**
 * Utility for registering Handlebars helpers and partials. 
 */
export default class HandlebarsGlobals {
  /**
   * Registers Handlebars helpers and partials. 
   */
  init() {
    Handlebars.registerHelper('eq', this._eq);
    Handlebars.registerHelper('neq', this._neq);
  }

  /**
   * Returns `true`, if the given parameters are considered equal. Otherwise, returns `false`. 
   * @param {Any} a
   * @param {Any} b
   * 
   * @returns {Boolean}
   * 
   * @private
   */
  _eq(a, b) {
    return a == b;
  }

  /**
   * Returns `true`, if the given parameters are *not* considered equal. Otherwise, returns `false`. 
   * @param {Any} a
   * @param {Any} b
   * 
   * @returns {Boolean}
   * 
   * @private
   */
  _neq(a, b) {
    return a != b;
  }
}
