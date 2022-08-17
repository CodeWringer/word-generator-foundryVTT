import GeneratorSettings from "../generator/data/generator-settings.mjs";
import AddGeneratorUseCase from "../use_case/add-generator-use-case.mjs";
import LoadGeneratorsUseCase from "../use_case/load-generators-use-case.mjs";
import RemoveGeneratorUseCase from "../use_case/remove-generator-use-case.mjs";
import SetGeneratorsUseCase from "../use_case/set-generators-use-case.mjs";
import SortGeneratorsUseCase from "../use_case/sort-generators-use-case.mjs";
import { ListItemPresenter } from "./list-item-presenter.mjs";
import { SORTING_ORDERS } from "./sorting-orders.mjs";
import { TEMPLATES } from "./templates.mjs";

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
      width: 500,
      height: 700,
      resizable: true,
    };
  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    
    return mergedOptions;
  }

  /**
   * @type {Array<GeneratorSettings>}
   * @private
   */
  _generators = [];

  /**
   * @type {Array<ListItemPresenter>}
   * @private
   */
  _generatorPresenters = [];

  constructor() {
    super();

    this._generators = new LoadGeneratorsUseCase().invoke(game.userId);
    this._generatorPresenters = this._generators.map(it => new ListItemPresenter({
      listItem: it,
      userId: game.userId,
    }));
  }

  activateListeners(html) {
    super.activateListeners(html);

    const thiz = this;

    // General event handling. 

    html.find("#create-generator").click(() => {
      thiz._createGenerator();
    });
    html.find("#move-sort-alpha-desc").click(() => {
      thiz._sort(SORTING_ORDERS.DESC);
    });
    html.find("#move-sort-alpha-asc").click(() => {
      thiz._sort(SORTING_ORDERS.ASC);
    });

    // List item event handling. 
    for (const generator of this._generatorPresenters) {
      generator.activateListeners(html, thiz);
    }
  }

  /** @override */
  async getData(options) {
    return {
      settings: this._generators,
    }
  }

  /**
   * Click-Handler to create a new generator. 
   * @private
   */
  _createGenerator() {
    const newSetting = new GeneratorSettings();

    this._generators.push(newSetting);
    this._generatorPresenters.push(new ListItemPresenter({
      listItem: newSetting,
      userId: game.userId,
    }));

    new AddGeneratorUseCase().invoke({
      userId: game.userId,
      generatorSettings: newSetting,
    });

    this.render();
  }
  
  
  /**
   * Click-Handler to remove a generator. 
   * @private
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
   * Click-Handler to override/update a generator. 
   * @private
   */
  _setGenerator(generator) {
    const indexGenerator = this._generators.findIndex(it => it.id === generator.id);
    this._generators.splice(indexGenerator, 1, generator);
    
    const indexPresenter = this._generatorPresenters.findIndex(it => it.listItem.id === generator.id);
    this._generators.splice(indexPresenter, 1, new ListItemPresenter({
      listItem: newSetting,
      userId: game.userId,
    }));

    this.render();
  }

  /**
   * Click-Handler to sort generators. 
   * @param {SORTING_ORDERS} sortingOrder 
   * @private
   */
  _sort(sortingOrder = SORTING_ORDERS.DESC) {
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
}

window.WordGeneratorApplication = WordGeneratorApplication;