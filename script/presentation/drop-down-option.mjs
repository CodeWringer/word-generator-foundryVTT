/**
 * Represents an option available for selection in a drop-down. 
 * 
 * @property {String} value
 * @property {String} localizedTitle
 */
export default class DropDownOption {
  /**
   * @param {String} value
   * @param {String} localizedTitle
   */
  constructor(args) {
    this.value = args.value;
    this.localizedTitle = args.localizedTitle;
  }
}