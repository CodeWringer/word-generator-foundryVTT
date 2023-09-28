import WordGenerator from "../../../business/generator/generator.mjs"
import WordGeneratorApplicationData from "../../../business/generator/model/word-generator-application-data.mjs"
import WordGeneratorFolder from "../../../business/generator/model/word-generator-folder.mjs"
import WordGeneratorItem from "../../../business/generator/model/word-generator-item.mjs"
import TypeRegistrar from "../../../business/generator/type-registrar.mjs"
import WordGeneratorApplicationDataDataSource from "../../../data/datasource/word-generator-application-data-datasource.mjs"
import InfoBubble, { InfoBubbleAutoHidingTypes } from "../../component/info-bubble/info-bubble.mjs"
import { WordGeneratorListItemPresenter } from "../../component/word-generator-item/word-generator-list-item-presenter.mjs"
import DropDownOption from "../../drop-down-option.mjs"
import { SORTING_ORDERS } from "../../sorting-orders.mjs"
import { TEMPLATES } from "../../templates.mjs"

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
   * Path to the generator list item template. 
   * 
   * @type {String}
   * @readonly
   * @static
   */
  static generatorListItemTemplate = TEMPLATES.WORD_GENERATOR_LIST_ITEM;

  /**
   * The application working data. 
   * 
   * @type {WordGeneratorApplicationData}
   * @private
   */
  _data = new WordGeneratorApplicationData();

  /**
   * The array of generator list item presenters. 
   * 
   * @type {Array<WordGeneratorListItemPresenter>}
   * @private
   */
  _generatorItemPresenters = [];

  /**
   * An array of the last generated words. 
   * 
   * @type {Array<String>}
   * @private
   */
  _generatedWords = [];

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
   * 
   * @type {Number}
   * @private
   */
  _currentScrollGeneratorList = 0;
  
  /**
   * Current scroll value of the resulting words list.
   * 
   * @type {Number}
   * @private
   */
  _currentScrollResultList = 0;

  constructor() {
    super();

    const dataSource = new WordGeneratorApplicationDataDataSource();
    this._data = dataSource.get(game.userId);

    this._regenerateGeneratorItemPresenters();
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
      this._data.amountToGenerate = amountToGenerate;
      this._persistData();
    });

    // Sorting result list
    const resultsSortDescButtonElement = html.find("#results-move-sort-alpha-desc");
    resultsSortDescButtonElement.click(() => {
      this._data.resultsSortMode = SORTING_ORDERS.DESC;
      this._persistData();
      this._generatedWords = this._getResultsSorted(this._generatedWords, this._data.resultsSortMode);
    });
    if (this._data.resultsSortMode === SORTING_ORDERS.DESC) {
      resultsSortDescButtonElement.addClass("active");
    }

    const resultsSortAscButtonElement = html.find("#results-move-sort-alpha-asc");
    resultsSortAscButtonElement.click(() => {
      this._data.resultsSortMode = SORTING_ORDERS.ASC;
      this._persistData();
      this._generatedWords = this._getResultsSorted(this._generatedWords, this._data.resultsSortMode);
    });
    if (this._data.resultsSortMode === SORTING_ORDERS.ASC) {
      resultsSortAscButtonElement.addClass("active");
    }

    // List item event handling. 
    for (const presenter of this._generatorItemPresenters) {
      presenter.activateListeners(html);
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
      data: this._data,
      generatedWords: this._generatedWords,
      sequencingStrategies: sequencingStrategies,
      spellingStrategies: spellingStrategies,
      generatorListItemTemplate: WordGeneratorApplication.generatorListItemTemplate,
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
   * Persists the current working data. 
   * 
   * @private
   */
  _persistData() {
    const dataSource = new WordGeneratorApplicationDataDataSource();
    dataSource.set(game.userId, this._data.toDto());
  }

  /**
   * Re-generates the word generator item presenters
   * 
   * @private
   */
  _regenerateGeneratorItemPresenters() {
    this._generatorItemPresenters = [];
    for (let i = 0; i < this._data.generatorItems.length; i++) {
      const generator = this._data.generatorItems[i];

      this._generatorItemPresenters.push(
        new WordGeneratorListItemPresenter({
          listItem: generator,
          listIndex: i,
          userId: game.userId,
          application: this,
        })
      );
    }
  }

  /**
   * Click-handler to create a new generator. 
   */
  _createGenerator() {
    // Add a new generator item. 
    const newGeneratorItem = new WordGeneratorItem({
      name: game.i18n.localize("wg.generator.defaultName"),
    });
    this._data.generatorItems.push(newGeneratorItem);

    // Add a new presenter for the item. 
    this._generatorItemPresenters.push(new WordGeneratorListItemPresenter({
      listItem: newGeneratorItem,
      listIndex: this._generatorItemPresenters.length,
      userId: game.userId,
      application: this,
    }));

    this._persistData();

    this.render();
  }
  
  /**
   * Click-handler to remove a generator. 
   * 
   * @param {String} id Id of a generator to remove. 
   */
  _removeGenerator(id) {
    // Remove generator item.
    const index = this._data.generatorItems.findIndex(it => it.id === id);
    if (index >= 0) {
      this._data.generatorItems.splice(index, 1);
    }
    
    // Remove generator item presenter.
    const indexPresenter = this._generatorItemPresenters.findIndex(it => it.listItem.id === generator.id);
    if (indexPresenter >= 0) {
      this._generatorItemPresenters.splice(indexPresenter, 1);
    }

    this._persistData();

    this.render();
  }

  /**
   * Click-handler to update the given generator. 
   * 
   * @param {WordGenerator} generator The generator instance to update. 
   */
  _updateGenerator(generator) {
    // Update generator item.
    const indexGenerator = this._data.generatorItems.find(it => it.id === generator.id);
    if (indexGenerator >= 0) {
      this._data.generatorItems[indexGenerator] = generator;
    }

    // Update generator item presenter.
    const indexPresenter = this._generatorItemPresenters.findIndex(it => it.listItem.id === generator.id);
    if (indexPresenter >= 0) {
      this._generatorItemPresenters.splice(indexPresenter, 1, new WordGeneratorListItemPresenter({
        listItem: generator,
        listIndex: indexPresenter,
        userId: game.userId,
        application: this,
      }));
    }

    this._persistData();

    this.render();
  }

  /**
   * Click-handler to sort generators. 
   * 
   * @param {SORTING_ORDERS} sortingOrder Determines the sorting order. 
   */
  _sortGenerators(sortingOrder = SORTING_ORDERS.DESC) {
    // Sort the generator items.
    const sorted = this._data.generatorItems.concat([]); // Safe-copy
    if (sortingOrder === SORTING_ORDERS.DESC) {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    this._data.generatorItems = sorted;

    // Re-generate the presenters. 
    this._regenerateGeneratorItemPresenters();

    this._persistData();
    
    this.render();
  }

  /**
   * Returns the current list of generated words, sorted by the corresponding application 
   * setting's sorting mode. 
   * 
   * @param {Array<String>} results The list of words to sort. 
   * @param {SORTING_ORDERS} sortingOrder Determines the sorting order. 
   * 
   * @returns {Array<String>} The sorted list of generated words. 
   * 
   * @private
   */
  _getResultsSorted(results, sortingOrder = SORTING_ORDERS.DESC) {
    let sorted = results.concat([]); // Safe-copy
    if (sortingOrder === SORTING_ORDERS.DESC) {
      sorted = sorted.sort();
    } else {
      sorted = sorted.sort().reverse();
    }
    return sorted;
  }

  /**
   * Click-handler to generate words, using a given generator. 
   * 
   * @param {WordGenerator} generator The generator instance to utilize. 
   */
  _generate(generator) {
    try {
      const generatedWords = generator.generate(this._data.amountToGenerate);
      this._generatedWords = this._getResultsSorted(generatedWords, this._data.resultsSortMode);
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
    await new Dialog({
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

    this._data.folders.push(newFolder);
    
    this._persistData();

    this.render();
  }
}
