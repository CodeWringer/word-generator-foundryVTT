/**
 * Provides convenience functions for showing dialogs to the user. 
 */
export default class DialogUtility {
  /**
   * Shows a confirmation dialog. 
   * 
   * @param {Object} args Optional arguments to pass to the rendering function. 
   * @param {String} args.localizableTitle Localization string for the dialog title. 
   * @param {String | undefined} args.content Optional. HTML content to show as the body of the dialog. 
   * 
   * @returns {Promise<Boolean>} Resolves, when the dialog is closed. 
   * * Is `true`, when the dialog was closed with confirmation. 
   * 
   * @async
   */
  async showConfirmationDialog(args = {}) {
    args = {
      localizableTitle: "",
      ...args
    };
    const mergedDialogData = {
      confirmed: false
    };
  
    return new Promise(async (resolve, reject) => {
      const dialog = new Dialog({
        title: game.i18n.localize(args.localizableTitle),
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
}
