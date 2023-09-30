import WordGenerator from "../../../business/generator/generator.mjs"
import WordGeneratorApplicationData from "../../../business/model/word-generator-application-data.mjs"
import WordGeneratorFolder from "../../../business/model/word-generator-folder.mjs"
import WordGeneratorItem from "../../../business/model/word-generator-item.mjs"
import TypeRegistrar from "../../../business/model/type-registrar/type-registrar.mjs"
import WordGeneratorApplicationDataDataSource from "../../../data/datasource/word-generator-application-data-datasource.mjs"
import InfoBubble, { InfoBubbleAutoHidingTypes } from "../../component/info-bubble/info-bubble.mjs"
import WordGeneratorFolderPresenter from "../../component/folder/word-generator-folder-presenter.mjs"
import WordGeneratorItemPresenter from "../../component/word-generator-item/word-generator-item-presenter.mjs"
import { SORTING_ORDERS } from "../../sorting-orders.mjs"
import { TEMPLATES } from "../../templates.mjs"
import DialogUtility from "../../util/dialog-utility.mjs"
import WordGeneratorListPresenter from "../../component/word-generator-list/word-generator-list-presenter.mjs"

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
      id: 'word-generator-application',
      template: TEMPLATES.WORD_GENERATOR_APPLICATION,
      title: game.i18n.localize("wg.application.title"),
      userId: game.userId,
      width: 700,
      height: 700,
      resizable: true,
      classes: ["wg-application"]
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
   * The application working data. 
   * 
   * @type {WordGeneratorApplicationData}
   * @private
   */
  _data = new WordGeneratorApplicationData();

  /**
   * The presenter of the folders and generators.
   * 
   * @type {WordGeneratorListPresenter}
   * @private
   */
  _contentListPresenter = undefined;

  /**
   * The array of generator list item presenters. 
   * 
   * @type {Array<WordGeneratorItemPresenter>}
   * @private
   */
  _generatorItemPresenters = [];

  /**
   * The array of generator list item presenters. 
   * 
   * @type {Array<WordGeneratorFolderPresenter>}
   * @private
   */
  _folderPresenters = [];

  /**
   * An array of the last generated words. 
   * 
   * @type {Array<String>}
   * @private
   */
  _generatedWords = [];

  /**
   * The DOM element for the scrollable content area of folders and generators.
   * This is needed to preserve the current scroll value. 
   * 
   * @type {Jquery}
   * @private
   */
  _contentAreaElement1 = undefined;

  /**
   * The DOM element for the scrollable content area of generated results.
   * This is needed to preserve the current scroll value. 
   * 
   * @type {Jquery}
   * @private
   */
  _contentAreaElement2 = undefined;

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

    this._generateChildPresenters();
    // The list presenter must be generated **after** the folders and generators 
    // presenters have been generated, as it depends on them. 
    this._regenerateContentListPresenter();
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const thiz = this;

    this._contentAreaElement1 = html.find('#content-area-1');
    this._contentAreaElement1.scrollTop(this._currentScrollGeneratorList);
    
    this._contentAreaElement2 = html.find('#content-area-2');
    this._contentAreaElement2.scrollTop(this._currentScrollResultList);

    // General event handling. 

    // Word generator creation
    html.find("#create-generator").click(() => {
      thiz.createGenerator();
    });

    // Folder creation
    html.find("#create-folder").click(async () => {
      await thiz.createFolder();
    });

    // Sorting word generators
    html.find("#move-sort-alpha-desc").click(() => {
      thiz._sort(SORTING_ORDERS.DESC);
    });
    html.find("#move-sort-alpha-asc").click(() => {
      thiz._sort(SORTING_ORDERS.ASC);
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
      this.render();
    });
    if (this._data.resultsSortMode === SORTING_ORDERS.DESC) {
      resultsSortDescButtonElement.addClass("active");
    }

    const resultsSortAscButtonElement = html.find("#results-move-sort-alpha-asc");
    resultsSortAscButtonElement.click(() => {
      this._data.resultsSortMode = SORTING_ORDERS.ASC;
      this._persistData();
      this._generatedWords = this._getResultsSorted(this._generatedWords, this._data.resultsSortMode);
      this.render();
    });
    if (this._data.resultsSortMode === SORTING_ORDERS.ASC) {
      resultsSortAscButtonElement.addClass("active");
    }

    // Generated word event handling.
    this._activateListenersClipboardButtons(html);

    // Child event handlers
    
    this._contentListPresenter.activateListeners(html);
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
    return {
      data: this._data,
      generatedWords: this._generatedWords,
      contentListPresenter: this._contentListPresenter,
    }
  }

  /** @override */
  render(args) {
    if (this._contentAreaElement1 !== undefined) {
      this._currentScrollGeneratorList = this._contentAreaElement1.scrollTop();
    }
    if (this._contentAreaElement2 !== undefined) {
      this._currentScrollResultList = this._contentAreaElement2.scrollTop();
    }

    super.render(args);
  }

  /**
   * Click-handler to create a new generator. 
   * 
   * @param {WordGeneratorFolder | undefined} parentFolder A folder to assign the 
   * newly created generator to. 
   */
  createGenerator(parentFolder) {
    // Create the generator. 
    const newGenerator = new WordGeneratorItem({
      name: game.i18n.localize("wg.generator.defaultName"),
    });
    this._data.generatorItems.push(newGenerator);

    // Create the generator presenter. 
    const newGeneratorPresenter = new WordGeneratorItemPresenter({
      application: this,
      entity: newGenerator,
      sequencingStrategies: WordGeneratorApplication.registeredSequencingStrategies.getAll(),
      spellingStrategies: WordGeneratorApplication.registeredSpellingStrategies.getAll(),
    });

    if (parentFolder === undefined) {
      // Assign the generator presenter to the root level. 
      this._generatorItemPresenters.push(newGeneratorPresenter);
    } else {
      // Assign the generator to the folder. 
      parentFolder.itemIds.push(newGenerator.id);
      
      // Assign the generator presenter to the parent folder presenter. 
      const folderPresenter = this.getFolderPresenterById(parentFolder.id);
      folderPresenter.items.push(newGeneratorPresenter);
    }

    this._persistData();
    this.render();
  }

  /**
   * Prompts the user to enter a folder name and then creates a new folder with 
   * that name. 
   * 
   * @param {WordGeneratorFolder | undefined} parentFolder A folder to assign the 
   * newly created folder to. 
   * 
   * @async
   */
  async createFolder(parentFolder) {
    const dialog = await new DialogUtility().showSingleInputDialog({
      localizedTitle: game.i18n.localize("wg.folder.create"),
      localizedInputLabel: game.i18n.localize("wg.folder.name"),
    });

    if (dialog.confirmed !== true) return;

    // Create the folder. 
    const newFolder = new WordGeneratorFolder({
      name: dialog.input,
    });
    this._data.folders.push(newFolder);

    // Create the folder presenter. 
    const newFolderPresenter = new WordGeneratorFolderPresenter({
      application: this,
      entity: newFolder,
    });

    if (parentFolder === undefined) {
      this._folderPresenters.push(newFolderPresenter);
    } else {
      const parentFolderPresenter = this.getFolderPresenterById(parentFolder.id);
      parentFolderPresenter.children.push(newFolderPresenter);
    }

    this._persistData();
    this.render();
  }

  /**
   * Moves a folder with the given ID into another folder with another given ID. 
   * 
   * @param {String} idOfFolderToMove ID of the folder to move. 
   * @param {String} idOfDestinationFolder ID of the folder to move the other 
   * into. 
   * @param {Number | undefined} index The new index to move it to. 
   * * By default, adds to the end of the list. 
   */
  moveFolder(idOfFolderToMove, idOfDestinationFolder, index) {
    if (idOfFolderToMove === idOfDestinationFolder) {
      // Illegal operation - ignore.
      return;
    }

    const subjectPresenter = this.getFolderPresenterById(idOfFolderToMove);
    const destinationPresenter = this.getFolderPresenterById(idOfDestinationFolder);

    if (subjectPresenter.parent === undefined) {
      // Remove from root level. 
      const i = this._folderPresenters.findIndex(it => it.entity.id === subjectPresenter.entity.id);
      this._folderPresenters.splice(i, 1);
    } else {
      // Remove subject from its current parent. 
      subjectPresenter.parent.removeChild(subjectPresenter);
    }

    destinationPresenter.addChild(subjectPresenter, index);

    this._persistData();
    this.render();
  }
  
  /**
   * Returns the folder presenter whose entity ID matches with the given.
   * 
   * @param {String} id ID of the folder presenter to get. 
   * 
   * @returns {WordGeneratorFolderPresenter | undefined} The found folder presenter. 
   */
  getFolderPresenterById(id) {
    let result;
    for (let i = 0; i < this._folderPresenters.length; i++) {
      const presenter = this._folderPresenters[i];

      result = presenter.getPresenterByFolderId(id);
      if (result !== undefined) {
        break;
      }
    }
    return result
  }
  
  
  /**
   * Returns the generator presenter whose entity ID matches with the given.
   * 
   * @param {String} id ID of the generator presenter to get. 
   * 
   * @returns {WordGeneratorItemPresenter | undefined} The found generator presenter. 
   */
  getGeneratorPresenterById(id) {
    let result;
    for (let i = 0; i < this._generatorItemPresenters.length; i++) {
      const presenter = this._generatorItemPresenters[i];

      if (presenter.entity.id === id) {
        result = presenter.entity.id;
        break;
      }
    }
    return result
  }
  
  /**
   * Persists the current working data. 
   * 
   * @private
   */
  _persistData() {
    const dataSource = new WordGeneratorApplicationDataDataSource();
    dataSource.set(game.userId, this._data);
  }

  /**
   * @private
   */
  _generateChildPresenters() {
    this._folderPresenters = [];
    this._generatorItemPresenters = [];
    
    // This is a flat list that contains **all** generator presenters, 
    // regardless of hierarchy. Used for easy look-ups. 
    const generatorPresenters = [];

    // Generate a presenter for every generator. 
    this._data.generatorItems.forEach(generator => {
      generatorPresenters.push(
        new WordGeneratorItemPresenter({
          application: this,
          entity: generator,
          sequencingStrategies: WordGeneratorApplication.registeredSequencingStrategies.getAll(),
          spellingStrategies: WordGeneratorApplication.registeredSpellingStrategies.getAll(),
        })
      );
    });

    // This is a flat list that contains **all** folder presenters, 
    // regardless of hierarchy. Used for easy look-ups. 
    const folderPresenters = [];

    // Generate a presenter for every folder. 
    this._data.folders.forEach(folder => {
      folderPresenters.push(
        new WordGeneratorFolderPresenter({
          application: this,
          entity: folder,
        })
      );
    });

    // Build the reference hierarchy. 
    folderPresenters.forEach(folderPresenter => {
      // Assign child folders. 
      folderPresenter.entity.childIds.forEach(childId => {
        const childPresenter = folderPresenters.find(it => it.entity.id === childId);
        folderPresenter.children.push(childPresenter);
        childPresenter.parent = folderPresenter;
      });

      // Assign generators. 
      folderPresenter.entity.itemIds.forEach(itemId => {
        const generatorPresenter = generatorPresenters.find(it => it.entity.id === itemId);
        folderPresenter.items.push(generatorPresenter);
        generatorPresenter.parent = folderPresenter;
      });
      
      // Ensure folder content list presenter is up to speed.
      // TODO: This is a HACK! Refactor it so the content list presenter updates itself, as necessary. 
      folderPresenter.contentListPresenter = new WordGeneratorListPresenter({
        application: this,
        folders: folderPresenter.children,
        generators: folderPresenter.items,
      });
    });

    // Assign the root-level presenters. 
    this._folderPresenters = folderPresenters.filter(it => 
      it.parent === undefined
    );
    this._generatorItemPresenters = generatorPresenters.filter(it => 
      it.parent === undefined
    );
  }

  /**
   * Re-generates the folder and generator list presenter. 
   * 
   * @private
   */
  _regenerateContentListPresenter() {
    this._contentListPresenter = new WordGeneratorListPresenter({
      application: this,
      folders: this._folderPresenters,
      generators: this._generatorItemPresenters,
    });
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
    const indexPresenter = this._generatorItemPresenters.findIndex(it => it.entity.id === id);
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
    const indexGenerator = this._data.generatorItems.findIndex(it => it.id === generator.id);
    if (indexGenerator >= 0) {
      this._data.generatorItems[indexGenerator] = generator;
    }

    // Update generator item presenter.
    const presenter = this._generatorItemPresenters.find(it => it.entity.id === generator.id);
    if (presenter !== undefined) {
      presenter.entity = generator;
    }

    this._persistData();

    this.render();
  }

  /**
   * Click-handler to sort generators and folders. 
   * 
   * @param {SORTING_ORDERS} sortingOrder Determines the sorting order. 
   */
  _sort(sortingOrder = SORTING_ORDERS.DESC) {
    // This function does the actual sorting, by name. 
    const sortByName = function(entities, sortingOrder) {
      const sorted = entities.concat([]); // Safe-copy
      if (sortingOrder === SORTING_ORDERS.DESC) {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
      }
      return sorted;
    };

    // This function sorts the given presenters, by id, based on the 
    // order of ids of the given entities in their array. 
    const sortPresentersByReference = function(presenters, entities) {
      const sorted = entities
        .map(entity => entity.id) // Fetch only the ids of the entities. 
        .map(entityId => 
          presenters.find(presenter => 
            presenter.entity.id === entityId
          )
        );
      return sorted;
    };

    // Sort the folders.
    this._data.folders = sortByName(this._data.folders, sortingOrder);
    // Sort the folder presenters.
    this._folderPresenters = sortPresentersByReference(this._folderPresenters, this._data.folders);

    // Sort the generator items.
    this._data.generatorItems = sortByName(this._data.generatorItems, sortingOrder);
    // Sort the generator item presenters.
    this._generatorItemPresenters = sortPresentersByReference(this._generatorItemPresenters, this._data.generatorItems);

    // Update list presenter.
    this._contentListPresenter.folders = this._folderPresenters;
    this._contentListPresenter.generators = this._generatorItemPresenters;

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
}
