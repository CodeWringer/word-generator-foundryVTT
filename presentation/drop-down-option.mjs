/**
 * Represents an option available for selection in a drop-down. 
 * 
 * @property {String} value The represented value. 
 * @property {String} localizedLabel A localized text to display for the value. 
 */
export default class DropDownOption {
  /**
   * @param {String} value The represented value. 
   * @param {String} localizedLabel A localized text to display for the value. 
   */
  constructor(args) {
    this.value = args.value;
    this.localizedLabel = args.localizedLabel;
  }
}