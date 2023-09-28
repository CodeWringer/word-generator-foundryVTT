/**
 * Provides convenience functions for showing dialogs to the user. 
 */
export default class DialogUtility {
  /**
   * Shows a confirmation dialog. 
   * 
   * @param {Object} args Arguments to pass to the rendering function. 
   * @param {String | undefined} args.localizableTitle Localization string for the dialog title. 
   * @param {String | undefined} args.content Optional. HTML content to show as the body of the dialog. 
   * 
   * @returns {Promise<Boolean>} Resolves when the dialog is closed. 
   * * Is `true`, when the dialog was closed with confirmation. 
   * 
   * @async
   */
  async showConfirmationDialog(args = {}) {
    const mergedDialogData = {
      confirmed: false
    };
  
    return new Promise(async (resolve, reject) => {
      const dialog = new Dialog({
        title: game.i18n.localize(args.localizableTitle ?? ""),
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
        default: "cancel",
        render: html => { },
        close: html => {
          resolve({
            confirmed: mergedDialogData.confirmed,
          });
        }
      });
      dialog.render(true);
    });
  }

  /**
   * Shows a dialog with the given content. 
   * 
   * @param {Object} args Arguments to pass to the rendering function. 
   * @param {String | undefined} args.localizedTitle Localized text for the dialog title. 
   * @param {String | undefined} args.localizedInputLabel Localized text for the label above the input. 
   * 
   * @returns {Promise<Dialog>} Resolves when the dialog is closed. 
   * * Returns the instance of the closed dialog, its DOM and the user input. 
   * * `dialog: {Dialog}`
   * * `html: {JQuery}`
   * * `input: {String}`
   * 
   * @async
   */
  async showSingleInputDialog(args = {}) {
    return new Promise(async (resolve, reject) => {
      const dialog = new Dialog({
        title: args.localizedTitle ?? "",
        content: `<span>${args.localizedInputLabel}</span><input id="inputField" type="text"></input>`,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("wg.general.confirm"),
            callback: () => {
              dialog.confirmed = true;
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("wg.general.cancel"),
            callback: () => {
              dialog.confirmed = false;
            }
          },
        },
        default: "cancel",
        render: html => { },
        close: html => {
          resolve({
            dialog: dialog,
            html: html,
            input: html.find("#inputField").val(),
            confirmed: dialog.confirmed,
          });
        }
      });
      dialog.render(true);
    });
  }
}
