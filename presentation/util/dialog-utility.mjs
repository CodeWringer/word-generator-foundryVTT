/**
 * Provides convenience functions for showing dialogs to the user. 
 */
export default class DialogUtility {
  /**
   * Styling class of the back drop element. 
   * 
   * @type {String}
   * @static
   * @readonly
   */
  static BACKDROP_ELEMENT_CLASS = "wg-modal-backdrop";

  /**
   * Id of the back drop element. 
   * 
   * @type {String}
   * @readonly
   * @private
   */
  get _backdropElementId() { return "wg-modal-backdrop"; }

  /**
   * Shows a confirmation dialog. 
   * 
   * @param {Object} args Arguments to pass to the rendering function. 
   * @param {String | undefined} args.localizedTitle Localized text for the dialog title. 
   * @param {String | undefined} args.content HTML content to show as the body of the dialog. 
   * @param {Boolean | undefined} args.modal Whether to make the dialog modal. 
   * * Default `false`
   * 
   * @returns {Promise<Object>} Resolves when the dialog is closed. 
   * * Returns the instance of the closed dialog, its DOM and the user input. 
   * * `dialog: {Dialog}`
   * * `html: {JQuery}`
   * * `confirmed: {Boolean}`
   * 
   * @async
   */
  async showConfirmationDialog(args = {}) {
    const mergedDialogData = {
      confirmed: false
    };
  
    return new Promise(async (resolve, reject) => {
      const dialog = new Dialog({
        title: args.localizedTitle ?? "",
        content: args.content ?? "",
        buttons: {
          confirm: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("wg.general.confirm"),
            callback: () => {
              mergedDialogData.confirmed = true;
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("wg.general.cancel"),
            callback: () => { }
          }
        },
        default: args.default ?? "cancel",
        render: html => { },
        close: html => {
          this._removeModalBackdrop();

          resolve({
            dialog: dialog,
            html: html,
            confirmed: mergedDialogData.confirmed,
          });
        }
      }, {
        classes: ["dialog", "wg-dialog"],
      });

      if (args.modal === true) {
        this._ensureModalBackdrop(dialog);
      }

      dialog.render(true);
    });
  }

  /**
   * Shows a confirmable dialog with a single line input. 
   * 
   * @param {Object} args Arguments to pass to the rendering function. 
   * @param {String | undefined} args.localizedTitle Localized text for the dialog title. 
   * @param {String | undefined} args.localizedInputLabel Localized text for the label above the input. 
   * @param {String | undefined} args.value Initial value to set. 
   * @param {Boolean | undefined} args.modal Whether to make the dialog modal. 
   * * Default `false`
   * 
   * @returns {Promise<Object>} Resolves when the dialog is closed. 
   * * Returns the instance of the closed dialog, its DOM and the user input. 
   * * `dialog: {Dialog}`
   * * `html: {JQuery}`
   * * `input: {String}`
   * * `confirmed: {Boolean}`
   * 
   * @async
   */
  async showSingleInputDialog(args = {}) {
    const content = `<span>${args.localizedInputLabel}</span><input id="inputField" type="text" value="${args.value ?? ""}"></input>`;

    return new Promise(async (resolve, reject) => {
      const dialog = await this.showConfirmationDialog({
        ...args,
        content: content,
        default: "confirm",
      });

      if (dialog.confirmed === true) {
        dialog.input = dialog.html.find("#inputField").val();
      }
      
      resolve(dialog);
    });
  }

  /**
   * Shows a confirmable dialog with a multi line input. 
   * 
   * @param {Object} args Arguments to pass to the rendering function. 
   * @param {String | undefined} args.localizedTitle Localized text for the dialog title. 
   * @param {String | undefined} args.localizedInputLabel Localized text for the label above the input. 
   * @param {String | undefined} args.value Initial value to set. 
   * @param {Boolean | undefined} args.modal Whether to make the dialog modal. 
   * * Default `false`
   * 
   * @returns {Promise<Object>} Resolves when the dialog is closed. 
   * * Returns the instance of the closed dialog, its DOM and the user input. 
   * * `dialog: {Dialog}`
   * * `html: {JQuery}`
   * * `input: {String}`
   * * `confirmed: {Boolean}`
   * 
   * @async
   */
  async showMultiInputDialog(args = {}) {
    const content = `<span>${args.localizedInputLabel}</span><textarea class="wg-flex grow wg-light" id="inputField">${args.value}</textarea>`;

    return new Promise(async (resolve, reject) => {
      const dialog = await this.showConfirmationDialog({
        ...args,
        content: content,
        default: "confirm",
      });

      if (dialog.confirmed === true) {
        dialog.input = dialog.html.find("#inputField").val();
      }
      
      resolve(dialog);
    });
  }

  /**
   * Ensures the backdrop element is present on the DOM. 
   * 
   * @param {Dialog | Application} dialog
   * 
   * @private
   */
  _ensureModalBackdrop(dialog) {
    let element = $(`#${this._backdropElementId}`);

    if (element.length < 1) {
      $('body').append(`<div id="${this._backdropElementId}" class="${DialogUtility.BACKDROP_ELEMENT_CLASS}"></div>`);
      element = $(`#${this._backdropElementId}`);
    }

    element.click(function (e) {
      dialog.close();
    });
  }

  /**
   * Removes the back drop element. 
   * 
   * @private
   */
  _removeModalBackdrop() {
    $(`#${this._backdropElementId}`).remove();
  }
}
