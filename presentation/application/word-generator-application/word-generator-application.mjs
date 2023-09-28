import WordGeneratorItem from "../generator/data/word-generator-settings.mjs";
import WordGenerator from "../generator/generator.mjs";
import TypeRegistrar from "../generator/type-registrar.mjs";
import AddFolderUseCase from "../use_case/add-folder-use-case.mjs";
import AddGeneratorUseCase from "../use_case/add-generator-use-case.mjs";
import LoadApplicationSettingsUseCase from "../use_case/load-application-settings-use-case.mjs";
import LoadGeneratorsUseCase from "../use_case/load-generators-use-case.mjs";
import RemoveGeneratorUseCase from "../use_case/remove-generator-use-case.mjs";
import SetApplicationSettingsUseCase from "../use_case/set-application-settings-use-case.mjs";
import SetGeneratorsUseCase from "../use_case/set-generators-use-case.mjs";
import SortGeneratorsUseCase from "../use_case/sort-generators-use-case.mjs";
import WordGeneratorFolder from "./data/word-generator-folder.mjs";
import DropDownOption from "../../drop-down-option.mjs";
import InfoBubble from "./info-bubble.mjs";
import { InfoBubbleAutoHidingTypes } from "./info-bubble.mjs";
import { WordGeneratorListItemPresenter } from "../../list-item-presenter.mjs";
import { SORTING_ORDERS } from "../../sorting-orders.mjs";
import { TEMPLATES } from "../../templates.mjs";

/**
 * Houses the presentation layer logic of the word generator. 
 * 
 * In other words, this is the `Application` to instantiate in order to 
 * interact with word generators. This `Application` is the point of entry. 
 * 
 * @example
 * ```
 * new WordGeneratorApplication().render(true);
 * ```
 */
export default class WordGeneratorApplication extends Application {
  /** @override */
  static get defaultOptions() {
    const defaults = super.defaultOptions;
  
    const overrides = {
      height: 'auto',
      id: 'word-generator-application',
      template: TEMPLATES.WORD_GENERATOR_APPLICATION,
      title: game.i18n.localize("wg.application.title"),
      userId: game.userId,
      width: 700,
      height: 700,
      resizable: true,
    };
  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    
    return mergedOptions;
  }

  /**
   * Holds all registered sequencing strategy definitons. 
   * @type {TypeRegistrar}
   * @static
   */
  static registeredSequencingStrategies = new TypeRegistrar();

  /**
   * Holds all registered spelling strategy definitons. 
   * @type {TypeRegistrar}
   * @static
   */
  static registeredSpellingStrategies = new TypeRegistrar();

  /**
   * @type {Array<WordGeneratorItem>}
   * @private
   */
  _generators = [];

  /**
   * @type {Array<WordGeneratorListItemPresenter>}
   * @private
   */
  _generatorPresenters = [];

  /**
   * An array of the last generated words. 
   * @type {Array<String>}
   * @private
   */
  _generatedWords = [];

  /**
   * The application level settings. 
   * @type {WordGeneratorApplicationSettings}
   * @private
   */
  _applicationSettings = undefined;

  /**
   * @type {Jquery}
   * @private
   */
  _generatorListElement = undefined;

  /**
   * @type {Jquery}
   * @private
   */
  _resultListElement = undefined;

  /**
   * Current scroll value of the generators list.
   * @type {Number}
   * @private
   */
  _currentScrollGeneratorList = 0;
  
  /**
   * Current scroll value of the resulting words list.
   * @type {Number}
   * @private
   */
  _currentScrollResultList = 0;

  /**
   * The list of folders. 
   * @type {Array<Object>}
   * @private
   */
  _folders = [];

  constructor() {
    super();

    this._applicationSettings = new LoadApplicationSettingsUseCase().invoke(game.userId);

    this._generators = new LoadGeneratorsUseCase().invoke(game.userId);
    this._generatorPresenters = [];

    for (let i = 0; i < this._generators.length; i++) {
      const generator = this._generators[i];

      this._generatorPresenters.push(
        new WordGeneratorListItemPresenter({
          listItem: generator,
          listIndex: i,
          userId: game.userId,
          application: this,
        })
      );
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const thiz = this;

    this._generatorListElement = html.find('#generators-list');
    this._resultListElement = html.find('#results-list');

    this._generatorListElement.scrollTop(this._currentScrollGeneratorList);
    this._resultListElement.scrollTop(this._currentScrollResultList);

    // General event handling. 

    // Word generator creation
    html.find("#create-generator").click(() => {
      thiz._createGenerator();
    });

    // Folder creation
    html.find("#create-folder").click(() => {
      thiz._createFolder();
    });

    // Sorting word generators
    html.find("#move-sort-alpha-desc").click(() => {
      thiz._sortGenerators(SORTING_ORDERS.DESC);
    });
    html.find("#move-sort-alpha-asc").click(() => {
      thiz._sortGenerators(SORTING_ORDERS.ASC);
    });

    // Generation count
    html.find("#amountToGenerate").change((data) => {
      const amountToGenerate = parseInt($(data.target).val());
      this._applicationSettings.amountToGenerate = amountToGenerate;
      new SetApplicationSettingsUseCase().invoke({
        userId: game.userId,
        value: this._applicationSettings,
      });
    });

    // Sorting result list
    const resultsSortDescButtonElement = html.find("#results-move-sort-alpha-desc");
    resultsSortDescButtonElement.click(() => {
      this._applicationSettings.resultsSortMode = SORTING_ORDERS.DESC;
      new SetApplicationSettingsUseCase().invoke({
        userId: game.userId,
        value: this._applicationSettings,
      });
      
      thiz._sortResults();
    });
    if (this._applicationSettings.resultsSortMode === SORTING_ORDERS.DESC) {
      resultsSortDescButtonElement.addClass("active");
    }

    const resultsSortAscButtonElement = html.find("#results-move-sort-alpha-asc");
    resultsSortAscButtonElement.click(() => {
      this._applicationSettings.resultsSortMode = SORTING_ORDERS.ASC;
      new SetApplicationSettingsUseCase().invoke({
        userId: game.userId,
        value: this._applicationSettings,
      });

      thiz._sortResults();
    });
    if (this._applicationSettings.resultsSortMode === SORTING_ORDERS.ASC) {
      resultsSortAscButtonElement.addClass("active");
    }

    // List item event handling. 
    for (const generator of this._generatorPresenters) {
      generator.activateListeners(html);
    }

    // Generated word event handling.
    this._activateListenersClipboardButtons(html);
  }

  /**
   * Activates event listeners for the copy to cliboard buttons. 
   * 
   * @param {JQuery} html
   * 
   * @private
   */
  _activateListenersClipboardButtons(html) {
    html.find(".word-generator-generated-word").each((index, element) => {
      const jElement = $(element);
      const cliboardButton = html.find(`#word-generator-clipboard-${index}`);
      const jInput = jElement.find(".word-generator-generated-word-input");
      jElement.mouseenter(() => {
        cliboardButton.removeClass("hidden");
      });
      jElement.mouseleave(() => {
        cliboardButton.addClass("hidden");
      });
      cliboardButton.click(() => {
        this._textToClipboard(html, jInput.val()).then((success) => {
          if (success === true) {
            const infoBubble = new InfoBubble({
              html: html,
              parent: cliboardButton,
              text: game.i18n.localize("wg.general.copy.success"),
              autoHideType: InfoBubbleAutoHidingTypes.ANY_INPUT,
              onHide: () => { infoBubble.remove(); },
            });
            infoBubble.show();
          }
        });
      });
    });
  }

  /** @override */
  async getData(options) {
    const sequencingStrategies = WordGeneratorApplication.registeredSequencingStrategies.getAll()
      .map(it => new DropDownOption({
        value: it.getDefinitionID(),
        localizedTitle: it.getHumanReadableName(),
      }));
      
      const spellingStrategies = WordGeneratorApplication.registeredSpellingStrategies.getAll()
      .map(it => new DropDownOption({
        value: it.getDefinitionID(),
        localizedTitle: it.getHumanReadableName(),
      }));
      spellingStrategies.splice(0, 0, new DropDownOption({
        value: "undefined",
        localizedTitle: game.i18n.localize("wg.generator.spellingStrategies.none"),
      }));

    return {
      settings: this._generators,
      generatedWords: this._generatedWords,
      sequencingStrategies: sequencingStrategies,
      spellingStrategies: spellingStrategies,
      applicationSettings: this._applicationSettings,
    }
  }

  /** @override */
  render(args) {
    if (this._generatorListElement !== undefined) {
      this._currentScrollGeneratorList = this._generatorListElement.scrollTop();
    }
    if (this._resultListElement !== undefined) {
      this._currentScrollResultList = this._resultListElement.scrollTop();
    }

    super.render(args);
  }

  /**
   * Click-handler to create a new generator. 
   */
  _createGenerator() {
    const newSetting = new WordGeneratorItem({
      name: game.i18n.localize("wg.generator.defaultName"),
    });

    this._generators.push(newSetting);
    this._generatorPresenters.push(new WordGeneratorListItemPresenter({
      listItem: newSetting,
      listIndex: this._generatorPresenters.length,
      userId: game.userId,
      application: this,
    }));

    new AddGeneratorUseCase().invoke({
      userId: game.userId,
      generatorSettings: newSetting,
    });

    this.render();
  }
  
  /**
   * Click-handler to remove a generator. 
   * @param {String} id Id of a generator to remove. 
   */
  _removeGenerator(id) {
    const index = this._generators.findIndex(it => it.id === id);
    this._generators.splice(index, 1);

    new RemoveGeneratorUseCase().invoke({
      userId: this.userId,
      generatorId: id,
    });

    this.render();
  }

  /**
   * Click-handler to override/update a generator. 
   * @param {WordGenerator} generator The generator instance to update. 
   */
  _setGenerator(generator) {
    const indexPresenter = this._generatorPresenters.findIndex(it => it.listItem.id === generator.id);
    this._generatorPresenters.splice(indexPresenter, 1, new WordGeneratorListItemPresenter({
      listItem: generator,
      listIndex: indexPresenter,
      userId: game.userId,
      application: this,
    }));

    new SetGeneratorsUseCase().invoke({
      userId: game.userId,
      generatorSettings: this._generators,
    });

    this.render();
  }

  /**
   * Click-handler to sort generators. 
   * @param {SORTING_ORDERS} sortingOrder 
   */
  _sortGenerators(sortingOrder = SORTING_ORDERS.DESC) {
    const sorted = new SortGeneratorsUseCase().invoke({
      userId: game.userId,
      sortingOrder: sortingOrder,
    });
    new SetGeneratorsUseCase().invoke({
      userId: game.userId,
      generatorSettings: sorted,
    });
    
    this._generators = sorted;
    
    this.render();
  }

  /**
   * Returns the current list of generated words, sorted by the corresponding application 
   * setting's sorting mode. 
   * 
   * @returns {Array<String>} The sorted list of generated words. 
   * 
   * @private
   */
  _getResultsSorted() {
    let sorted = this._generatedWords;
    if (this._applicationSettings.resultsSortMode === SORTING_ORDERS.DESC) {
      sorted = sorted.sort();
    } else {
      sorted = sorted.sort().reverse();
    }
    return sorted;
  }

  /**
   * Click-handler to sort generated words. 
   * 
   * @private
   */
  _sortResults() {
    this._generatedWords = this._getResultsSorted();
    
    this.render();
  }
  
  /**
   * Click-handler to generate words, using a given generator. 
   * @param {WordGenerator} generator The generator instance to utilize. 
   */
  _generate(generator) {
    try {
      const generatedWords = generator.generate(this._applicationSettings.amountToGenerate);
      this._generatedWords = generatedWords;
      this._generatedWords = this._getResultsSorted();
    } catch (error) {
      console.error(error);
    }

    this.render();
  }

  /**
   * Copies the given text to the clipboard. 
   * @param {JQuery} html 
   * @param {String} text 
   * 
   * @returns {Boolean} True, if successfully copied. 
   * 
   * @async
   * @private
   */
  async _textToClipboard(html, text) {
    if (!navigator.clipboard) { // This uses a deprecated API as a fallback solution. 
      // A temporary element is created for the sole purpose of holding the text to copy to clipboard. 
      const textArea = html.createElement("textarea");
      textArea.value = text;
      
      // This avoids scrolling to the bottom.
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      // The element must be added and focused. 
      html.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // Try the copy. 
      let success = false;
      try {
        html.execCommand('copy');
        html.removeChild(textArea);
        success = true;
      } catch (err) {
        console.error('Error copying to clipboard: ', err);
      }

      // Ensure the element is removed again. 
      html.removeChild(textArea);
      return success;
    } else {
      try {
        await navigator.clipboard.writeText(text);

        return true;
      } catch (err) {
        console.error('Error copying to clipboard: ', err);

        return false;
      }
    }
  }

  /**
   * Prompts the user to enter a folder name and then creates a new folder with 
   * that name. 
   * 
   * @async
   * @private
   */
  async _createFolder() {
    let name = "";
    const dialog = await new Dialog({
      title: "Create Folder",
      content: '<span>Folder Name</span><input id="inputName" type="text"></input>',
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: "Confirm",
          callback: () => {
            this.confirmed = true; 
            this.close();
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => {
            this.confirmed = false; 
            this.close();
          }
        }
      },
      default: "cancel",
      close: html => {
        name = html.find("#inputName").val();
      }
    }).render(true);

    const newFolder = new WordGeneratorFolder({
      name: name,
    });

    this._folders.push(newFolder);

    new AddFolderUseCase().invoke({
      userId: game.userId,
      data: newFolder,
    });
    
    this.render();
  }
}

window.WordGeneratorApplication = WordGeneratorApplication;
