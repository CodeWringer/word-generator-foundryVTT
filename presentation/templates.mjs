/**
 * Provides access to the template (= Handlebars) file paths. 
 * 
 * @constant
 */
export const TEMPLATES = {
  WORD_GENERATOR_APPLICATION: "presentation/word-generator-application/word-generator-application.hbs",
  WORD_GENERATOR_SAMPLES_APPLICATION: "presentation/word-generator-samples-application/word-generator-samples-application.hbs",
  WORD_GENERATOR_LIST_ITEM: "presentation/template/word-generator-list-item.hbs",
  MOVE_CONTROLS: "presentation/template/move-controls.hbs",
  SETTING_LIST_ITEM: "presentation/template/setting-list-item.hbs",
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
    for (const propertyName in this) {
      if (
        !this.hasOwnProperty(propertyName)
        || propertyName == "preloadHandlebarsTemplates"
      ) continue;

      templateArr.push(this[propertyName]);
    }
    return loadTemplates(templateArr);
  }
};
