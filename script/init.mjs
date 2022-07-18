import { preloadHandlebarsTemplates } from "./presentation/templates.mjs";
import CustomUserSettings from "./settings/custom-user-settings.mjs";

Hooks.once('init', async function() {
  // Settings initialization.
  new CustomUserSettings().ensureAllSettings();

  preloadHandlebarsTemplates();
});
