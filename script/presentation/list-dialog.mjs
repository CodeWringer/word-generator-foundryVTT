import { TEMPLATES } from "../../../../systems/ambersteel/module/templatePreloader.mjs";
import UserFlagGeneratorSettingsDataSource from "../generator/data/user-flag-datasource.mjs";

export default class ListDialog {
  constructor() {
    const dataSource = new UserFlagGeneratorSettingsDataSource();
    const settingsList = dataSource.getAll(game.user.id);
  }

  show() {
    showDialog({
      dialogTemplate: TEMPLATES.LIST_DIALOG,
    });
  }
}

/**
 * Shows a dialog to the user and returns a promise with the result of the user interaction. 
 * @param {String} args.dialogTemplate Path to a hbs template. 
 * @param {String|undefined} args.localizableTitle A localization String for the dialog title. 
 * @param {Function|undefined} args.render A function to call during render of the dialog. 
 * Receives the DOM of the dialog as its argument. 
 * Can be used for custom rendering logic like hiding certain inputs based on the state of another input. 
 * @param {Object} dialogData An arbitrary data object which represents the context to use when rendering the dialog template. 
 * @returns {Promise<DialogResult>} Resolves, when the dialog is closed. 
 *          The returned object has the properties: 'confirmed' and 'html'. 
 *          The 'html' property allows filtering for values of input fields, for example.
 * @async
 */
export async function showDialog(args = {}, dialogData) {
  args = {
    dialogTemplate: undefined,
    localizableTitle: "",
    render: html => { },
    ...args
  };
  const mergedDialogData = {
    confirmed: false,
    ...dialogData
  };

  return new Promise(async (resolve, reject) => {
    // Render template. 
    const renderedContent = await renderTemplate(args.dialogTemplate, mergedDialogData);

    const dialog = new Dialog({
      title: game.i18n.localize(args.localizableTitle),
      content: renderedContent,
      buttons: {
        cancel: {
          icon: '',
          label: game.i18n.localize("wg.close"),
          callback: () => { }
        }
      },
      default: "cancel",
      render: html => {
        args.render(html);
      },
      close: html => {
        resolve(new DialogResult(
          mergedDialogData.confirmed,
          html
        ));
      }
    });
    dialog.render(true);
  });
}