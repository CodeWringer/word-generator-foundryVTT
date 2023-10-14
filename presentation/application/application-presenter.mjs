import TypeRegistrar from "../../business/model/type-registrar/type-registrar.mjs"
import InfoBubble, { InfoBubbleAutoHidingTypes } from "../component/info-bubble/info-bubble.mjs"
import { SORTING_ORDERS } from "../sorting-orders.mjs"
import { TEMPLATES } from "../templates.mjs"
import DialogUtility from "../dialog/dialog-utility.mjs"
import WgFolderContentsPresenter from "../component/folder/contents/folder-contents-presenter.mjs"
import ApplicationDataDataSource from "../../data/datasource/application-data-datasource.mjs"
import WgApplicationData from "../../business/model/wg-application-data.mjs"
import WgGenerator from "../../business/model/wg-generator.mjs"
import WgFolder from "../../business/model/wg-folder.mjs"
import { SEARCH_MODES, Search, SearchItem } from "../../business/search/search.mjs"
import ClipboardHandler from "../util/clipboard-handler.mjs"

/**
 * Houses the presentation layer logic of the word generator. 
 * 
 * In other words, this is the `Application` to instantiate in order to 
 * interact with word generators. This `Application` is the point of entry. 
 * 
 * @example
 * ```
 * new WgApplication().render(true);
 * ```
 */
export default class WgApplication extends Application {
  /** @override */
  static get defaultOptions() {
    const defaults = super.defaultOptions;
  
    const overrides = {
      id: 'word-generator-application',
      template: TEMPLATES.APPLICATION,
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
   * @type {WgApplicationData}
   */
  data = undefined;

  /**
   * The presenter of the folders and generators.
   * 
   * @type {WgFolderContentsPresenter}
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

    this.data = new ApplicationDataDataSource().get(game.userId);

    this._regeneratePresenters();

    // Observe data changes. 
    this.data.resultsSortMode.onChange((_, oldValue, newValue) => {
      if (newValue === SORTING_ORDERS.DESC) {
        this.data.generatedResults.sort((a, b) => a.localeCompare(b));
      } else {
        this.data.generatedResults.sort((a, b) => b.localeCompare(a));
      }

      this._persistData();
      this.render();
    });

    // On **any** data change, persist data and re-render. 
    this.data.onChange(() => {
      this._persistData();
      this.render();
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._contentAreaElement1 = html.find('#content-area-1');
    this._contentAreaElement1.scrollTop(this._currentScrollGeneratorList);
    
    this._contentAreaElement2 = html.find('#content-area-2');
    this._contentAreaElement2.scrollTop(this._currentScrollResultList);

    // General event handling. 

    // Word generator creation
    html.find("#create-generator").click(() => {
      const newGenerator = new WgGenerator({
        name: game.i18n.localize("wg.generator.defaultName"),
      });
      this.data.rootFolder.generators.add(newGenerator);
    });

    // Folder creation
    html.find("#create-folder").click(async () => {
      const dialog = await new DialogUtility().showSingleInputDialog({
        localizedTitle: game.i18n.localize("wg.folder.create"),
        localizedInputLabel: game.i18n.localize("wg.folder.name"),
        modal: true,
      });
  
      if (dialog.confirmed !== true) return;
  
      // Create the folder. 
      const newFolder = new WgFolder({
        name: dialog.input,
      });
      this.data.rootFolder.folders.add(newFolder);
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
      this.data.generatorSearchTerm.value = $(data.target).val();
    });
    // Collapse all folders
    html.find("#collapse-all-folders").click(() => {
      this.suspendRendering = true;
      for (const folder of this.data.rootFolder.folders.getAll()) {
        folder.collapse(true);
      }
      for (const generator of this.data.rootFolder.generators.getAll()) {
        generator.isExpanded.value = false;
      }
      this.suspendRendering = false;
      this.render();
    });

    // Generation count
    html.find("#amountToGenerate").change((data) => {
      const amountToGenerate = parseInt($(data.target).val());
      this.data.amountToGenerate.value = amountToGenerate;
    });

    // Sorting result list
    const resultsSortDescButtonElement = html.find("#results-move-sort-alpha-desc");
    resultsSortDescButtonElement.click(() => {
      this.data.resultsSortMode.value = SORTING_ORDERS.DESC;
    });
    if (this.data.resultsSortMode.value === SORTING_ORDERS.DESC) {
      resultsSortDescButtonElement.addClass("active");
    }

    const resultsSortAscButtonElement = html.find("#results-move-sort-alpha-asc");
    resultsSortAscButtonElement.click(() => {
      this.data.resultsSortMode.value = SORTING_ORDERS.ASC;
    });
    if (this.data.resultsSortMode.value === SORTING_ORDERS.ASC) {
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
      TEMPLATES: TEMPLATES,
      data: this.data,
      generatedResults: this.data.generatedResults.getAll(),
      contentListPresenter: this._contentListPresenter,
      generatorSearchTerm: this.data.generatorSearchTerm.value ?? "",
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
   * Re-generates all child presenters. 
   * 
   * @private
   */
  _regeneratePresenters() {
    let foldersToShow = [];
    let generatorsToShow = [];

    const searchTerm = this.data.generatorSearchTerm.value.trim();
    if (searchTerm.length > 0) {
      // Show only filtered generators. 

      let flatGeneratorList = this.data.rootFolder.generators.getAll();
      for (const folder of this.data.rootFolder.folders.getAll()) {
        flatGeneratorList = flatGeneratorList.concat(folder.getGenerators());
      }

      const searchItems = flatGeneratorList.map(generator => 
        new SearchItem({
          id: generator.id,
          term: generator.name.value,
        })
      );

      const searchResults = new Search().search(searchItems, searchTerm, SEARCH_MODES.FUZZY);
      const relevantSearchResults = searchResults.filter(it => it.score > 0);
      generatorsToShow = relevantSearchResults.map(result => 
        flatGeneratorList.find(generator => generator.id === result.id)
      );
    } else {
      // Show all folders and generators. 

      foldersToShow = this.data.rootFolder.folders.getAll();
      generatorsToShow = this.data.rootFolder.generators.getAll();
    }

    this._contentListPresenter = new WgFolderContentsPresenter({
      application: this,
      folders: foldersToShow,
      generators: generatorsToShow,
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
    this._infoBubbleCopyToClipboard = new InfoBubble({
      html: html,
      parent: html,
      autoHideType: InfoBubbleAutoHidingTypes.ANY_INPUT,
    });

    html.find(".word-generator-generated-word").each((index, element) => {
      const jElement = $(element);
      const jCliboardButton = html.find(`#generated-word-${index}-copy-to-clipboard`);
      const jInput = jElement.find(`input#generated-word-${index}-word`);
      jElement.mouseenter(() => {
        jCliboardButton.removeClass("hidden");
      });
      jElement.mouseleave(() => {
        jCliboardButton.addClass("hidden");
      });
      jCliboardButton.click(async () => {
        const success = await new ClipboardHandler().textToClipboard(jInput.val());

        if (success === true) {
          this._infoBubbleCopyToClipboard.show(jCliboardButton, game.i18n.localize("wg.general.copy.success"));
        } else {
          throw new Error("Failed to copy to clipboard. Functionality unsupported by browser?");
        }
      });
    });
  }

  /**
   * Persists the current working data. 
   * 
   * @private
   */
  _persistData() {
    new ApplicationDataDataSource().set(game.userId, this.data);
  }

  /**
   * Click-handler to sort folders and their contents. 
   * 
   * @param {SORTING_ORDERS} sortingOrder Determines the sorting order. 
   */
  _sort(sortingOrder = SORTING_ORDERS.DESC) {
    this.data.rootFolder.sort(sortingOrder);
  }
}