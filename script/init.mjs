import { preloadHandlebarsTemplates } from "./presentation/templates.mjs";
import WordGeneratorApplication from "./presentation/word-generator-application.mjs";

Hooks.once('init', async function() {
  preloadHandlebarsTemplates();
});

Hooks.once("ready", async function() {
  console.log("Init word generator");
  showWordGeneratorDialog();
});

function showWordGeneratorDialog() {
  const dialog = new WordGeneratorApplication();
  dialog.render(true, { userId: game.userId });
}