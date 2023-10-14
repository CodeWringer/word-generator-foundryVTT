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
  APPLICATION: `${basePath}/application/application.hbs`,
  GENERATOR: `${basePath}/component/generator/generator.hbs`,
  STRATEGY: `${basePath}/component/strategy/strategy.hbs`,
  FOLDER: `${basePath}/component/folder/folder.hbs`,
  FOLDER_CONTENTS: `${basePath}/component/folder/contents/folder-contents.hbs`,
  MOVE_CONTROLS: `${basePath}/component/move-controls/move-controls.hbs`,
  ORDERED_LIST: `${basePath}/component/ordered-list/ordered-list.hbs`,
  MULTI_SELECT_LIST: `${basePath}/dialog/multi-select-list.hbs`,
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
