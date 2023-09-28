/**
 * String partial `"modules/word-generator/presentation"`. 
 * 
 * @type {String}
 * @constant
 */
const basePath = "modules/word-generator/presentation";

/**
 * Provides access to the template (= Handlebars) file paths. 
 * 
 * @constant
 */
export const TEMPLATES = {
  WORD_GENERATOR_APPLICATION: `${basePath}/application/word-generator-application/word-generator-application.hbs`,
  WORD_GENERATOR_SAMPLES_APPLICATION: `${basePath}/application/word-generator-samples-application/word-generator-samples-application.hbs`,
  WORD_GENERATOR_LIST_ITEM: `${basePath}/component/word-generator-item/word-generator-list-item.hbs`,
  WORD_GENERATOR_FOLDER: `${basePath}/component/folder/word-generator-folder.hbs`,
  MOVE_CONTROLS: `${basePath}/template/move-controls.hbs`,
  SETTING_LIST_ITEM: `${basePath}/template/setting-list-item.hbs`,
  /**
   * Define a set of template paths to pre-load.
   * 
   * Pre-loaded templates are compiled and cached for fast access when rendering.
   * 
   * @return {Promise}
   * 
   * @async
   */
  preloadHandlebarsTemplates: async () => {
    const templateArr = [];
    for (const propertyName in TEMPLATES) {
      if (
        !TEMPLATES.hasOwnProperty(propertyName)
        || propertyName == "preloadHandlebarsTemplates"
      ) continue;

      templateArr.push(TEMPLATES[propertyName]);
    }
    return loadTemplates(templateArr);
  }
};
