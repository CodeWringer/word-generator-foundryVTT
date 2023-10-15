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
 * @property {WgApplication} application The parent application. 
 * @property {WgGenerator} entity The represented entity.  
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
export default class WgStrategyPresenter extends AbstractEntityPresenter {
  get template() { return TEMPLATES.STRATEGY; }

  get id() { return this._id; }

  /**
   * @param {Object} args
   * @param {String} args.id ID of the presenter. 
   * @param {WgApplication} args.application The parent application. 
   * @param {WgGenerator} args.entity The represented entity.  
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

    this._id = args.id ?? this.entity.id;
    this.localizedLabel = args.localizedLabel;
    this.strategyOptions = args.strategyOptions;
    this.activeStrategyField = args.activeStrategyField;
    this.strategyDefinitions = args.strategyDefinitions;

    this.strategySettingsPresenter = this.activeStrategyField.value.settingsPresenter;
    this.strategySettingsPresenter.application = args.application;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._infoBubble = new InfoBubble({
      html: html,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      map: [
        {
          element: html.find(`i#${this.id}-info`),
          text: ((this.activeStrategyField.value ?? {}).localizedInfoText ?? ""),
        },
      ]
    });

    html.find(`select#${this.id}`).change((data) => {
      const strategyId = $(data.target).val();
      const strategy = this.strategyDefinitions.find(it => it.id === strategyId);
      this.activeStrategyField.value = strategy.newInstance({
        id: this.entity.id,
        application: this.application,
      });
    });

    this.syncDropDownValue(html, this.id, this.activeStrategyField.value.definitionId);

    // Children

    this.strategySettingsPresenter.activateListeners(html);
  }
}
