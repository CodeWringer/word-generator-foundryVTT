export const TEMPLATES = {
  WORD_GENERATOR_APPLICATION: "modules/word-generator/template/word-generator-application.hbs",
  LIST_DIALOG: "modules/word-generator/template/dialog-plain.hbs",
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
