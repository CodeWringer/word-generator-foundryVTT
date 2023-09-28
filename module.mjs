import WordGeneratorApplicationData from "./business/generator/model/word-generator-application-data.mjs";
import BeginningCapitalsSpellingStrategy from "./business/generator/postprocessing/beginning-capitals-strategy.mjs"
import CharDepthSequencingStrategy from "./business/generator/sequencing/char-depth-sequencing-strategy.mjs"
import DelimiterSequencingStrategy from "./business/generator/sequencing/delimiter-sequencing-strategy.mjs"
import UserFlagGeneratorSettingsDataSource from "./data/datasource/user-flag-generator-settings-datasource.mjs";
import WordGeneratorApplicationDataDataSource from "./data/datasource/word-generator-application-data-datasource.mjs";
import CustomUserSettings from "./data/settings/custom-user-settings.mjs";
import WordGeneratorApplication from "./presentation/application/word-generator-application/word-generator-application.mjs";
import { TEMPLATES } from "./presentation/templates.mjs";

/* -------------------------------------------- */
/*  Initialization                              */
/* -------------------------------------------- */

Hooks.once('init', function() {
  // Settings initialization.
  new CustomUserSettings().ensureAllSettings();

  // Ensure default sequencing strategy definitions are registered. 
  WordGeneratorApplication.registeredSequencingStrategies.register(new CharDepthSequencingStrategy());
  WordGeneratorApplication.registeredSequencingStrategies.register(new DelimiterSequencingStrategy(","));
  
  // Ensure default spelling strategy definitions are registered. 
  WordGeneratorApplication.registeredSpellingStrategies.register(new BeginningCapitalsSpellingStrategy());
  
  // Migrate data as needed.
  const oldDataSource = new UserFlagGeneratorSettingsDataSource();
  const generatorItems = oldDataSource.getAll(game.userId);
  if (generatorItems.length > 0) {
    const dataSource = new WordGeneratorApplicationDataDataSource();
    const migratedData = new WordGeneratorApplicationData({
      generatorItems: generatorItems,
    });
    dataSource.set(game.userId, migratedData);

    // Finally, clear out old data. 
    oldDataSource.clear(game.userId);
  }

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
