import WordGeneratorApplicationData from "./business/model/word-generator-application-data.mjs";
import BeginningCapitalsSpellingStrategy from "./business/generator/postprocessing/beginning-capitals-strategy.mjs"
import CharDepthSequencingStrategy from "./business/generator/sequencing/char-depth-sequencing-strategy.mjs"
import DelimiterSequencingStrategy from "./business/generator/sequencing/delimiter-sequencing-strategy.mjs"
import UserFlagGeneratorSettingsDataSource from "./data/datasource/user-flag-generator-settings-datasource.mjs";
import WordGeneratorApplicationDataDataSource from "./data/datasource/word-generator-application-data-datasource.mjs";
import CustomUserSettings from "./data/settings/custom-user-settings.mjs";
import WordGeneratorApplication from "./presentation/application/word-generator-application/word-generator-application.mjs";
import HandlebarsGlobals from "./presentation/handlebars-globals.mjs";
import { TEMPLATES } from "./presentation/templates.mjs";

/* -------------------------------------------- */
/*  Initialization                              */
/* -------------------------------------------- */

Hooks.once('init', function() {
  // Register Handlebars helpers and partials. 
  new HandlebarsGlobals().init();
  
  // Preload Handlebars templates.
  return TEMPLATES.preloadHandlebarsTemplates();
});

Hooks.once('ready', function() {
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
});
