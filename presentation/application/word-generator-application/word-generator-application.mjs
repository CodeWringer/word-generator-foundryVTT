import TypeRegistrar from "../../../business/model/type-registrar/type-registrar.mjs"
import InfoBubble, { InfoBubbleAutoHidingTypes } from "../../component/info-bubble/info-bubble.mjs"
import WordGeneratorFolderPresenter from "../../component/folder/word-generator-folder-presenter.mjs"
import WordGeneratorItemPresenter from "../../component/word-generator-item/word-generator-item-presenter.mjs"
import { SORTING_ORDERS } from "../../sorting-orders.mjs"
import { TEMPLATES } from "../../templates.mjs"
import DialogUtility from "../../util/dialog-utility.mjs"
import WordGeneratorListPresenter from "../../component/word-generator-list/word-generator-list-presenter.mjs"
import ObservableWordGeneratorApplicationDataDataSource from "../../../data/datasource/observable-word-generator-application-data-datasource.mjs"
import ObservableWordGeneratorApplicationData from "../../../business/model/observable-word-generator-application-data.mjs"
import ObservableWordGeneratorItem from "../../../business/model/observable-word-generator-item.mjs"
import ObservableWordGeneratorFolder from "../../../business/model/observable-word-generator-folder.mjs"

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
   * Holds all registered sampling strategy definitons. 
   * @type {TypeRegistrar}
   * @static
   */
  static registeredSamplingStrategies = new TypeRegistrar();

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
   * @type {ObservableWordGeneratorApplicationData}
   * @private
   */
  _data = new ObservableWordGeneratorApplicationData();

  /**
   * The presenter of the folders and generators.
   * 
   * @type {WordGeneratorListPresenter}
   * @private
   */
  _contentListPresenter = undefined;

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

  /**
   * If true, will not re-render the application when the data changes. 
   * 
   * Useful to avoid frequent re-renders or even render calls being dropped, 
   * when performing bulk data modifications. 
   * 
   * @type {Boolean}
   */
  suspendRendering = false;

  constructor() {
    super();

    this._data = new ObservableWordGeneratorApplicationDataDataSource().get(game.userId);

    this._regeneratePresenters();

    // Observe data changes. 
    this._data.amountToGenerate.onChange((_, oldValue, newValue) => {
      this._persistData();
      this.render();
    });

    this._data.generatedResults.onChange(() => {
      this._persistData();
      this.render();
    });

    this._data.resultsSortMode.onChange((_, oldValue, newValue) => {
      if (newValue === SORTING_ORDERS.DESC) {
        this._data.generatedResults.sort((a, b) => a.localeCompare(b));
      } else {
        this._data.generatedResults.sort((a, b) => b.localeCompare(a));
      }

      this._persistData();
      this.render();
    });

    this._data.folders.onChange((_, change, args) => {
      this._persistData();
      this.render();
    });

    this._data.generators.onChange((_, change, args) => {
      this._persistData();
      this.render();
    });
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
      const newGenerator = new ObservableWordGeneratorItem({
        name: game.i18n.localize("wg.generator.defaultName"),
      });
      this._data.generators.add(newGenerator);
    });

    // Folder creation
    html.find("#create-folder").click(async () => {
      const dialog = await new DialogUtility().showSingleInputDialog({
        localizedTitle: game.i18n.localize("wg.folder.create"),
        localizedInputLabel: game.i18n.localize("wg.folder.name"),
      });
  
      if (dialog.confirmed !== true) return;
  
      // Create the folder. 
      const newFolder = new ObservableWordGeneratorFolder({
        name: dialog.input,
      });
      this._data.folders.add(newFolder);
    });

    // Sorting word generators
    html.find("#move-sort-alpha-desc").click(() => {
      this._sort(SORTING_ORDERS.DESC);
    });
    html.find("#move-sort-alpha-asc").click(() => {
      this._sort(SORTING_ORDERS.ASC);
    });

    // Generator search
    html.find("#search-generators").change((data) => {
      this._data.generatorFilter.value = $(data.target).val();
    });
    // Collapse all folders
    html.find("#collapse-all-folders").click(() => {
      this.suspendRendering = true;
      for (const folder of this._data.folders.getAll()) {
        folder.collapse(true);
      }
      for (const generator of this._data.generators.getAll()) {
        generator.isExpanded.value = false;
      }
      this.suspendRendering = false;
      this.render();
    });

    // Generation count
    html.find("#amountToGenerate").change((data) => {
      const amountToGenerate = parseInt($(data.target).val());
      this._data.amountToGenerate.value = amountToGenerate;
    });

    // Sorting result list
    const resultsSortDescButtonElement = html.find("#results-move-sort-alpha-desc");
    resultsSortDescButtonElement.click(() => {
      this._data.resultsSortMode.value = SORTING_ORDERS.DESC;
    });
    if (this._data.resultsSortMode.value === SORTING_ORDERS.DESC) {
      resultsSortDescButtonElement.addClass("active");
    }

    const resultsSortAscButtonElement = html.find("#results-move-sort-alpha-asc");
    resultsSortAscButtonElement.click(() => {
      this._data.resultsSortMode.value = SORTING_ORDERS.ASC;
    });
    if (this._data.resultsSortMode.value === SORTING_ORDERS.ASC) {
      resultsSortAscButtonElement.addClass("active");
    }

    // Generated word event handling.
    this._activateListenersClipboardButtons(html);

    // Child event handlers
    
    this._contentListPresenter.activateListeners(html);
  }

  /** @override */
  async getData(options) {
    this._regeneratePresenters();
    return {
      data: this._data,
      generatedResults: this._data.generatedResults.getAll(),
      contentListPresenter: this._contentListPresenter,
    }
  }

  /** @override */
  render(args) {
    if (this.suspendRendering === true) return;

    if (this._contentAreaElement1 !== undefined) {
      this._currentScrollGeneratorList = this._contentAreaElement1.scrollTop();
    }
    if (this._contentAreaElement2 !== undefined) {
      this._currentScrollResultList = this._contentAreaElement2.scrollTop();
    }

    super.render(args);
  }
  
  /**
   * Returns the folder with the given ID, if possible. 
   * 
   * Automatically recurses children to find the desired instance. 
   * 
   * @param {String} id ID of the folder to find. 
   * 
   * @returns {ObservableWordGeneratorFolder | undefined}
   */
  getFolderById(id) {
    for (const folder of this._data.folders.getAll()) {
      const r = folder.getFolderById(id);
      if (r !== undefined) {
        return r;
      }
    }
    return undefined;
  }
  
  /**
   * Returns the generator with the given ID, if possible. 
   * 
   * Automatically recurses children to find the desired instance. 
   * 
   * @param {String} id ID of the generator to find. 
   * 
   * @returns {ObservableWordGeneratorItem | undefined}
   */
  getGeneratorById(id) {
    for (const generator of this._data.generators.getAll()) {
      if (generator.id === id) {
        return generator;
      }
    }
    for (const folder of this._data.folders.getAll()) {
      const r = folder.getGeneratorById(id);
      if (r !== undefined) {
        return r;
      }
    }
    return undefined;
  }

  /**
   * Re-generates all child presenters. 
   * 
   * @private
   */
  _regeneratePresenters() {
    const folderPresenters = this._data.folders.getAll().map(folder => 
      new WordGeneratorFolderPresenter({
        application: this,
        entity: folder
      })
    );

    const generatorPresenters = this._data.generators.getAll().map(generator => 
      new WordGeneratorItemPresenter({
        application: this,
        entity: generator
      })
    );
    
    this._contentListPresenter = new WordGeneratorListPresenter({
      application: this,
      folders: folderPresenters,
      generators: generatorPresenters,
    });
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

  /**
   * Persists the current working data. 
   * 
   * @private
   */
  _persistData() {
    new ObservableWordGeneratorApplicationDataDataSource().set(game.userId, this._data);
  }

  /**
   * Click-handler to sort generators and folders. 
   * 
   * @param {SORTING_ORDERS} sortingOrder Determines the sorting order. 
   */
  _sort(sortingOrder = SORTING_ORDERS.DESC) {
    const sortByNameAsc = (a, b) => b.name.value.localeCompare(a.name.value);
    const sortByNameDesc = (a, b) => a.name.value.localeCompare(b.name.value);

    if (sortingOrder === SORTING_ORDERS.ASC) {
      this._data.folders.sort(sortByNameAsc);
      this._data.generators.sort(sortByNameAsc);
    } else {
      this._data.folders.sort(sortByNameDesc);
      this._data.generators.sort(sortByNameDesc);
    }
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
