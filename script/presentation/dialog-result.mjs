/**
 * @property {Boolean} confirmed If true, the user clicked the confirm button. 
 * @property {HTML} html The DOM of the dialog. Useful to filter for input elements and get their values. 
 */
export default class DialogResult {
  /**
   * @param confirmed {Boolean} confirmed If true, the user clicked the confirm button. 
   * @param html {HTML} html The DOM of the dialog. Useful to filter for input elements and get their values. 
   */
  constructor(confirmed, html) {
    this.confirmed = confirmed;
    this.html = html;
    this.type = "DialogResult";
  }
}