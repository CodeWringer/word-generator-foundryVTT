const templatesRoot = "modules/word-generator/template";
export const TEMPLATES = {
  WORD_GENERATOR_APPLICATION: `${templatesRoot}/word-generator-application.hbs`,
  WORD_GENERATOR_LIST_ITEM: `${templatesRoot}/word-generator-list-item.hbs`,
  WORD_GENERATOR_SAMPLES_DIALOG: `${templatesRoot}/word-generator-samples-dialog.hbs`,
  MOVE_CONTROLS: `${templatesRoot}/move-controls.hbs`,
  SETTING_LIST_ITEM: `${templatesRoot}/setting-list-item.hbs`,
};

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  const templateArr = [];
  for (const propertyName in TEMPLATES) {
    templateArr.push(TEMPLATES[propertyName]);
  }
  return loadTemplates(templateArr);
};
