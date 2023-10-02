import { NoneSpellingStrategyDefinition } from "./business/generator/postprocessing/none-spelling-strategy.mjs";
import { BeginningCapitalsSpellingStrategyDefinition } from "./business/generator/postprocessing/beginning-capitals-strategy.mjs"
import { CharDepthSequencingStrategyDefinition } from "./business/generator/sequencing/char-depth-sequencing-strategy.mjs"
import { DelimiterSequencingStrategyDefinition } from "./business/generator/sequencing/delimiter-sequencing-strategy.mjs"
import UserFlagGeneratorSettingsDataSource from "./data/datasource/user-flag-generator-settings-datasource.mjs";
import CustomUserSettings from "./data/settings/custom-user-settings.mjs";
import WordGeneratorApplication from "./presentation/application/word-generator-application/word-generator-application.mjs";
import HandlebarsGlobals from "./presentation/handlebars-globals.mjs";
import { TEMPLATES } from "./presentation/templates.mjs";
import { WordListSamplingStrategyDefinition } from "./business/generator/sampling/word-list-sampling-strategy.mjs";
import ObservableWordGeneratorApplicationDataDataSource from "./data/datasource/observable-word-generator-application-data-datasource.mjs";
import ObservableWordGeneratorApplicationData from "./business/model/observable-word-generator-application-data.mjs";

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

  // Ensure default sampling strategy definitions are registered. 
  WordGeneratorApplication.registeredSamplingStrategies.register(new WordListSamplingStrategyDefinition());

  // Ensure default sequencing strategy definitions are registered. 
  WordGeneratorApplication.registeredSequencingStrategies.register(new CharDepthSequencingStrategyDefinition());
  WordGeneratorApplication.registeredSequencingStrategies.register(new DelimiterSequencingStrategyDefinition());
  
  // Ensure default spelling strategy definitions are registered. 
  WordGeneratorApplication.registeredSpellingStrategies.register(new NoneSpellingStrategyDefinition());
  WordGeneratorApplication.registeredSpellingStrategies.register(new BeginningCapitalsSpellingStrategyDefinition());
  
  // Migrate data as needed.
  const oldDataSource = new UserFlagGeneratorSettingsDataSource();
  const generatorItems = oldDataSource.getAll(game.userId);
  if (generatorItems.length > 0) {
    const dataSource = new ObservableWordGeneratorApplicationDataDataSource();
    const migratedData = new ObservableWordGeneratorApplicationData({
      generatorItems: generatorItems,
    });
    dataSource.set(game.userId, migratedData);

    // Finally, clear out old data. 
    oldDataSource.clear(game.userId);
  }

  // Register globals. 
  window.WordGeneratorApplication = WordGeneratorApplication;
});
