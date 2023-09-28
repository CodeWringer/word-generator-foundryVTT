import BeginningCapitalsSpellingStrategy from "./business/generator/postprocessing/beginning-capitals-strategy.mjs"
import CharDepthSequencingStrategy from "./business/generator/sequencing/char-depth-sequencing-strategy.mjs"
import DelimiterSequencingStrategy from "./business/generator/sequencing/delimiter-sequencing-strategy.mjs"
import CustomUserSettings from "./data/settings/custom-user-settings.mjs";
import WordGeneratorApplication from "./presentation/application/word-generator-application/word-generator-application.mjs";
import { TEMPLATES } from "./presentation/templates.mjs";

/* -------------------------------------------- */
/*  Initialization                              */
/* -------------------------------------------- */

Hooks.once('init', function() {
  // Register globals. 
  window.WordGeneratorApplication = WordGeneratorApplication;

  // Preload Handlebars templates.
  return TEMPLATES.preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

/**
 * Returns `true`, if the given parameters are considered equal. Otherwise, returns `false`. 
 * @param {Any} a
 * @param {Any} b
 * 
 * @returns {Boolean}
 */
Handlebars.registerHelper('eq', function(a, b) {
  return a == b;
});

/**
 * Returns `true`, if the given parameters are *not* considered equal. Otherwise, returns `false`. 
 * @param {Any} a
 * @param {Any} b
 * 
 * @returns {Boolean}
 */
Handlebars.registerHelper('neq', function(a, b) {
  return a != b;
});

Hooks.once('init', async function() {
  // Settings initialization.
  new CustomUserSettings().ensureAllSettings();

  // Ensure default sequencing strategy definitions are registered. 
  WordGeneratorApplication.registeredSequencingStrategies.register(new CharDepthSequencingStrategy());
  WordGeneratorApplication.registeredSequencingStrategies.register(new DelimiterSequencingStrategy(","));
  
  // Ensure default spelling strategy definitions are registered. 
  WordGeneratorApplication.registeredSpellingStrategies.register(new BeginningCapitalsSpellingStrategy());
  
  // Pre-load Handlebars templates. 
  preloadHandlebarsTemplates();
});
