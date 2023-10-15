import { NoneSpellingStrategyDefinition } from "./business/generator/postprocessing/none-spelling-strategy.mjs";
import { BeginningCapitalsSpellingStrategyDefinition } from "./business/generator/postprocessing/beginning-capitals-strategy.mjs"
import { CharDepthSequencingStrategyDefinition } from "./business/generator/sequencing/char-depth-sequencing-strategy.mjs"
import { DelimiterSequencingStrategyDefinition } from "./business/generator/sequencing/delimiter-sequencing-strategy.mjs"
import CustomUserSettings from "./data/settings/custom-user-settings.mjs";
import WgApplication from "./presentation/application/application-presenter.mjs";
import HandlebarsGlobals from "./presentation/handlebars-globals.mjs";
import { TEMPLATES } from "./presentation/templates.mjs";
import { WordListSamplingStrategyDefinition } from "./business/generator/sampling/word-list-sampling-strategy.mjs";
import DialogUtility from "./presentation/dialog/dialog-utility.mjs";

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
  WgApplication.registeredSamplingStrategies.register(new WordListSamplingStrategyDefinition());

  // Ensure default sequencing strategy definitions are registered. 
  WgApplication.registeredSequencingStrategies.register(new CharDepthSequencingStrategyDefinition());
  WgApplication.registeredSequencingStrategies.register(new DelimiterSequencingStrategyDefinition());
  
  // Ensure default spelling strategy definitions are registered. 
  WgApplication.registeredSpellingStrategies.register(new NoneSpellingStrategyDefinition());
  WgApplication.registeredSpellingStrategies.register(new BeginningCapitalsSpellingStrategyDefinition());
  
  // Register globals. 
  window.WgApplication = WgApplication;
  window.WgDialogUtility = DialogUtility;
});
