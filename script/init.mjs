import BeginningCapitalsSpellingStrategy from "./generator/postprocessing/beginning-capitals-strategy.mjs";
import CharDepthSequencingStrategy from "./generator/sequencing/char-depth-sequencing-strategy.mjs";
import DelimiterSequencingStrategy from "./generator/sequencing/delimiter-sequencing-strategy.mjs";
import { preloadHandlebarsTemplates } from "./presentation/templates.mjs";
import WordGeneratorApplication from "./presentation/word-generator-application.mjs";
import CustomUserSettings from "./settings/custom-user-settings.mjs";

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
