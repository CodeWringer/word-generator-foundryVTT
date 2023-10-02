import ObservableField from "../../../common/observables/observable-field.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InfoBubble from "../info-bubble/info-bubble.mjs";

/**
 * This presenter handles a generator strategy and its settings. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {ObservableWordGeneratorItem} entity The represented entity.  
 * 
 * @property {String} localizedLabel Localized text of the strategy. 
 * @property {Array<DropDownOption>} strategyOptions A list of strategy options. 
 * @property {ObservableField} activeStrategy The currently selected and active strategy. 
 * * Must be an `ObservableField` on the given `entity`. This object is used to synchronize 
 * the herein made selection and changes. Must expose the following members: 
 * * `settings: Array<StrategySetting>`- the corresponding list of settings. 
 * * `localizedInfoText: String` - an info text explaining the strategy and its settings. 
 * @property {Array<Object>} strategies A list of strategy-representing objects, that correspond 
 * to the choices of `strategyOptions`. 
 * @property {Array<StrategySetting>} strategySettings The list of stratgy settings of the 
 * currently active strategy, if there is one. 
 * * Read-only
 */
export default class WordGeneratorStrategyPresenter extends AbstractEntityPresenter {
  get template() { return TEMPLATES.WORD_GENERATOR_STRATEGY; }

  get id() { return this.entity.id; }

  get elementId() { return `#${id}-strategy`; }

  get strategySettings() {
    if (this.activeStrategy.value === undefined) {
      return [];
    } else {
      return this.activeStrategy.value.settings;
    }
  }

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {ObservableWordGeneratorItem} args.entity The represented entity.  
   * @param {Array<DropDownOption>} args.strategyOptions A list of strategy options. 
   * @param {ObservableField} args.activeStrategyField The currently selected and active strategy. 
   * * Must be an `ObservableField` on the given `entity`. This object is used to synchronize 
   * the herein made selection and changes. 
   * @param {Array<Object>} args.strategies A list of strategy-representing objects, that correspond 
   * to the choices of `strategyOptions`. These must expose the following members: 
   * * `settings: Array<StrategySetting>`
   */
  constructor(args = {}) {
    super(args);

    this.strategyOptions = args.strategyOptions;
    this.activeStrategy = args.activeStrategyField;
    this.strategies = args.strategies;
  }

  activateListeners(html) {
    const id = this.entity.id;

    this._infoBubble = new InfoBubble({
      html: html,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      map: [
        {
          element: html.find(`#${id}-strategy-info`),
          text: ((this.activeStrategy.value ?? {}).localizedInfoText ?? ""),
        },
      ]
    });

    html.find(this.elementId).change((data) => {
      const strategyId = $(data.target).val();
      const strategy = this.strategies.find(it => it.id === strategyId);
      this.activeStrategy.value = strategy;
    });

    this.syncDropDownValue(html, this.elementId, this.entity.sequencingStrategyId.value);
  }
}
