import AbstractStrategy from "../../../business/generator/common/abstract-strategy.mjs";
import ObservableField from "../../../common/observables/observable-field.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../info-bubble/info-bubble.mjs";

/**
 * This presenter handles a generator strategy and its settings. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {ObservableWordGeneratorItem} entity The represented entity.  
 * @property {String} localizedLabel A localized text for the strategy section. 
 * @property {Array<DropDownOption>} strategyOptions A list of strategy options. 
 * @property {ObservableField} activeStrategyField The currently selected and active strategy. 
 * * Must be an `ObservableField` on the given `entity`. This object is used to synchronize 
 * the herein made selection and changes. Must expose the following members: 
 * * `settings: Array<StrategySetting>`- the corresponding list of settings. 
 * * `localizedInfoText: String` - an info text explaining the strategy and its settings. 
 * @property {Array<AbstractStrategyDefinition>} strategyDefinitions A list of strategy-representing objects, that correspond 
 * to the choices of `strategyOptions`. 
 */
export default class WordGeneratorStrategyPresenter extends AbstractEntityPresenter {
  get template() { return TEMPLATES.WORD_GENERATOR_STRATEGY; }

  get id() { return this.entity.id; }

  get elementId() { return `${this.id}-strategy`; }

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {ObservableWordGeneratorItem} args.entity The represented entity.  
   * @param {String | undefined} args.localizedLabel A localized text for the strategy section. 
   * @param {Array<DropDownOption>} args.strategyOptions A list of strategy options. 
   * @param {ObservableField<AbstractStrategy>} args.activeStrategyField The currently selected and active strategy. 
   * * Must be an `ObservableField` on the given `entity`. This object is used to synchronize 
   * the herein made selection and changes. 
   * @param {Array<AbstractStrategyDefinition>} args.strategyDefinitions A list of strategy definitions, that correspond 
   * to the choices of `strategyOptions`. 
   */
  constructor(args = {}) {
    super(args);

    this.localizedLabel = args.localizedLabel;
    this.strategyOptions = args.strategyOptions;
    this.activeStrategyField = args.activeStrategyField;
    this.strategyDefinitions = args.strategyDefinitions;

    this.strategySettingsPresenter = this.activeStrategyField.value.settingsPresenter;
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
          text: ((this.activeStrategyField.value ?? {}).localizedInfoText ?? ""),
        },
      ]
    });

    html.find(this.elementId).change((data) => {
      const strategyId = $(data.target).val();
      const strategy = this.strategyDefinitions.find(it => it.id === strategyId);
      this.activeStrategyField.value = strategy.newInstance();
    });

    this.syncDropDownValue(html, this.elementId, this.activeStrategyField.value.id);

    // Children

    this.strategySettingsPresenter.activateListeners(html);
  }
}
