import { TEMPLATES } from "../templates.mjs";

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
   * @param {Function | undefined} args.render Callback that is invoked when the dialog is 
   * rendered. Receives the DOM of the dialog as its sole argument. Can be used to register 
   * event handlers for interactivity. 
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
        render: html => {
          if (args.render !== undefined) {
            args.render(html);
          }
        },
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
    const content = `<span>${args.localizedInputLabel}</span><textarea class="wg-flex grow wg-light" style="height: 10rem" id="inputField">${args.value}</textarea>`;

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
   * Shows a confirmable dialog with a multi select input. 
   * 
   * @param {Object} args Arguments to pass to the rendering function. 
   * @param {String | undefined} args.localizedTitle Localized text for the dialog title. 
   * @param {String | undefined} args.localizedInputLabel Localized text for the label above the input. 
   * @param {Boolean | undefined} args.modal Whether to make the dialog modal. 
   * * Default `false`
   * @param {Array<MultiSelectOption> | undefined} args.options
   * 
   * @returns {Promise<Object>} Resolves when the dialog is closed. 
   * * Returns the instance of the closed dialog, its DOM and the user input. 
   * * `dialog: {Dialog}`
   * * `html: {JQuery}`
   * * `confirmed: {Boolean}`
   * * `selected: {Array<MultiSelectOption>}`
   * 
   * @async
   */
  async showMultiSelectDialog(args = {}) {
    const content = await renderTemplate(TEMPLATES.MULTI_SELECT_LIST, {
      TEMPLATES: TEMPLATES,
      options: args.options,
    });

    return new Promise(async (resolve, reject) => {
      const dialog = await this.showConfirmationDialog({
        ...args,
        content: content,
        default: "confirm",
        render: (html) => {
          for (const option of args.options) {
            html.find(`a#${option.id}`).click(() => {
              const checkbox = html.find(`input#${option.id}-checkbox`)[0];
              checkbox.checked = !checkbox.checked;
            });
          }
        },
      });

      const selected = [];
      if (dialog.confirmed === true) {
        for (const option of args.options) {
          const checkbox = dialog.html.find(`input#${option.id}-checkbox`)[0];
          option.isSelected = checkbox.checked;
          
          if (option.isSelected === true) {
            selected.push(option);
          }
        }
      }
      dialog.options = args.options;
      dialog.selected = selected;
      
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

/**
 * Represents an option of a multi select list. 
 * 
 * @property {String} id ID of the entry or its associated entity. 
 * @property {String} icon Icon HTML. E. g. `"fas fa-scroll"`
 * @property {String} localizedLabel Localized label. 
 * @property {Boolean} isSelected If `true`, this option is currently selected. 
 */
export class MultiSelectOption {
 /**
   * Represents an option of a multi select list. 
   * 
   * @param {Object} args
   * @param {String} args.id ID of the entry or its associated entity. 
   * @param {String | undefined} args.icon Icon HTML. E. g. `"<i class="fas fa-scroll"></i>"`
   * @param {String | undefined} args.localizedLabel Localized label. 
   * @param {Boolean | undefined} args.isSelected If `true`, this option is currently selected. 
   * * default `false`
   */
  constructor(args = {}) {
    this.id = args.id;
    this.icon = args.icon;
    this.localizedLabel = args.localizedLabel;
    this.isSelected = args.isSelected;
  }
}
