import UserFlagGeneratorSettingsDataSource from "../generator/data/user-flag-datasource.mjs";
import { TEMPLATES } from "./templates.mjs";

export default class WordGeneratorApplication extends FormApplication {
  /** @override */
  static get defaultOptions() {
    const defaults = super.defaultOptions;
  
    const overrides = {
      height: 'auto',
      id: 'word-generator-application',
      template: TEMPLATES.WORD_GENERATOR_APPLICATION,
      title: game.i18n.localize("wg.application.title"),
      userId: game.userId,
    };
  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    
    return mergedOptions;
  }

  /** @override */
  getData(options) {
    const ds = new UserFlagGeneratorSettingsDataSource();
    const settings = ds.getAll(game.userId);

    return {
      settings: settings,
    }
  }
}