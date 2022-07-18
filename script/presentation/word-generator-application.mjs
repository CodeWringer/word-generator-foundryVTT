import GeneratorSettings from "../generator/data/generator-settings.mjs";
import AddGeneratorUseCase from "../use_case/add-generator-use-case.mjs";
import LoadGeneratorsUseCase from "../use_case/load-generators-use-case.mjs";
import SetGeneratorsUseCase from "../use_case/set-generators-use-case.mjs";
import SortGeneratorsUseCase from "../use_case/sort-generators-use-case.mjs";
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
    };
  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    
    return mergedOptions;
  }

  constructor() {
    super();
  }

  activateListeners(html) {
    super.activateListeners(html);

    const thiz = this;

    html.find("#create-generator").click(() => {
      thiz._createGenerator();
    });
    html.find("#move-sort-alpha-desc").click(() => {
      thiz._sort(SORTING_ORDERS.DESC);
    });
    html.find("#move-sort-alpha-asc").click(() => {
      thiz._sort(SORTING_ORDERS.ASC);
    });
  }

  /** @override */
  async getData(options) {
    return {
      settings: new LoadGeneratorsUseCase().invoke(game.userId),
    }
  }

  /**
   * Click-Handler to create a new generator. 
   * @private
   */
  _createGenerator() {
    const newSetting = new GeneratorSettings();
    new AddGeneratorUseCase().invoke({
      userId: game.userId,
      generatorSettings: newSetting,
    });
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
  }
}

window.WordGeneratorApplication = WordGeneratorApplication;
