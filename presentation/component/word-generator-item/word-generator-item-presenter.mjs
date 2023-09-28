import DialogUtility from "../../util/dialog-utility.mjs";
import { StrategySettingValueTypes } from "../../../business/generator/strategy-setting.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../info-bubble/info-bubble.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import WordGeneratorSamplesApplication from "../../application/word-generator-samples-application/word-generator-samples-application.mjs";
import AbstractPresenter from "../../abstract-presenter.mjs";
import { TEMPLATES } from "../../templates.mjs";
import DropDownOption from "../../drop-down-option.mjs";
import WordGeneratorItem from "../../../business/model/word-generator-item.mjs";
import AbstractSequencingStrategy from "../../../business/generator/sequencing/abstract-sequencing-strategy.mjs";
import AbstractSpellingStrategy from "../../../business/generator/postprocessing/abstract-spelling-strategy.mjs";

/**
 * This presenter handles a singular generator. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {WordGeneratorItem} entity The represented entity.  
 * @property {Boolean} isExpanded
 * 
 * @property {Array<AbstractSequencingStrategy>} sequencingStrategies
 * @property {Array<DropDownOption>} sequencingStrategyOptions
 * 
 * @property {Array<AbstractSpellingStrategy>} spellingStrategies
 * @property {Array<DropDownOption>} spellingStrategyOptions
 */
export default class WordGeneratorItemPresenter extends AbstractPresenter {
  get template() { return TEMPLATES.WORD_GENERATOR_LIST_ITEM; }

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {WordGeneratorItem} args.entity The represented entity.  
   * @param {Boolean | undefined} args.isExpanded
   * * default `false`
   * @param {Array<AbstractSequencingStrategy>} args.sequencingStrategies
   * @param {Array<AbstractSpellingStrategy>} args.spellingStrategies
   */
  constructor(args = {}) {
    super(args);

    this.isExpanded = args.isExpanded ?? false;

    this.sequencingStrategies = args.sequencingStrategies;
    this.sequencingStrategyOptions = this.sequencingStrategies
      .map(it => new DropDownOption({
        value: it.getDefinitionID(),
        localizedTitle: it.getHumanReadableName(),
      }));

    this.spellingStrategies = args.spellingStrategies;
    this.spellingStrategyOptions = this.spellingStrategies
      .map(it => new DropDownOption({
        value: it.getDefinitionID(),
        localizedTitle: it.getHumanReadableName(),
      }));
  }

  activateListeners(html) {
    const thiz = this;
    const id = this.entity.id;

    html.find(`#${id}-delete`).click(() => {
      new DialogUtility().showConfirmationDialog({
        localizedTitle: game.i18n.localize("wg.generator.confirmDeletion"),
        content: game.i18n.localize("wg.general.confirmDeletionOf").replace("%s", this.entity.name),
      }).then(result => {
        if (result.confirmed === true) {
          this.application._removeGenerator(id);
        }
      });
    });

    html.find(`#${id}-edit-sample-set`).click(() => {
      new WordGeneratorSamplesApplication(this.entity, (data) => {
        if (data.confirmed === true) {
          this.entity.sampleSet = data.sampleSet;
          this.entity.sampleSetSeparator = data.sampleSetSeparator;
          this._updateRender()
        }
      }).render(true);
    });

    html.find(`#${id}-name`).change((data) => {
      thiz.entity.name = $(data.target).val();
      this._updateRender()
    });
    html.find(`#${id}-targetLengthMin`).change((data) => {
      thiz.entity.targetLengthMin = this.parseEmptyToGiven(data, 1);
      this._updateRender()
    });
    html.find(`#${id}-targetLengthMax`).change((data) => {
      thiz.entity.targetLengthMax = this.parseEmptyToGiven(data, 7);
      this._updateRender()
    });
    html.find(`#${id}-entropy`).change((data) => {
      thiz.entity.entropy = this.parseEmptyToGiven(data, 0.0);
      this._updateRender()
    });
    html.find(`#${id}-entropyStart`).change((data) => {
      thiz.entity.entropyStart = this.parseEmptyToGiven(data, 0.0);
      this._updateRender()
    });
    html.find(`#${id}-entropyMiddle`).change((data) => {
      thiz.entity.entropyMiddle = this.parseEmptyToGiven(data, 0.0);
      this._updateRender()
    });
    html.find(`#${id}-entropyEnd`).change((data) => {
      thiz.entity.entropyEnd = this.parseEmptyToGiven(data, 0.0);
      this._updateRender()
    });
    html.find(`#${id}-seed`).change((data) => {
      thiz.entity.seed = this.parseEmptyToUndefined(data);
      this._updateRender()
    });

    // Sequencing settings
    html.find(`#${id}-sequencing-settings > li > input`).change(data => {
      const id = $(data.target)[0].id;
      const setting = this.entity.sequencingStrategySettings.find(it => it.name === id);
      setting.value = this._parseSettingValue(setting, data.target);
      this._updateRender();
    });

    // Spelling settings
    html.find(`#${id}-spelling-settings > li > input`).change(data => {
      const id = $(data.target)[0].id;
      const setting = this.entity.spellingStrategySettings.find(it => it.name === id);
      setting.value = this._parseSettingValue(setting, data.target);
      this._updateRender();
    });

    // # Info-bubbles
    // ## Sample-Set
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.sample-set#${id}`),
      text: game.i18n.localize("wg.generator.sampleSet.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
    // ## target-length
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.target-length#${id}`),
      text: game.i18n.localize("wg.generator.targetLength.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
    // ## entropy
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.entropy#${id}`),
      text: game.i18n.localize("wg.generator.entropy.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
    // ## entropy-start
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.entropy-start#${id}`),
      text: game.i18n.localize("wg.generator.entropy.start.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
    // ## entropy-middle
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.entropy-middle#${id}`),
      text: game.i18n.localize("wg.generator.entropy.middle.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
    // ## entropy-end
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.entropy-end#${id}`),
      text: game.i18n.localize("wg.generator.entropy.end.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
    // ## ending-pick-mode
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.ending-pick-mode#${id}`),
      text: game.i18n.localize("wg.generator.endingPickMode.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
    // ## sequencing-strategy
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.sequencing-strategy#${id}`),
      text: game.i18n.localize("wg.generator.sequencingStrategy.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
    // ## spelling-strategy
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.spelling-strategy#${id}`),
      text: game.i18n.localize("wg.generator.spellingStrategy.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });
    // ## seed
    new InfoBubble({
      html: html,
      parent: html.find(`.word-generator-info.seed#${id}`),
      text: game.i18n.localize("wg.generator.seed.infoHint"),
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
    });

    // ## collapse button
    html.find(`#${id}-collapse`).click(() => {
      thiz.isExpanded = !(thiz.isExpanded ?? false);
      this._updateRender()
    });

    // Drop-Downs
    const idEndingPickMode = `${id}-endingPickMode`;
    html.find(`#${idEndingPickMode}`).change((data) => {
      thiz.entity.endingPickMode = $(data.target).val();
      this._updateRender()
    });
    this.syncDropDownValue(html, idEndingPickMode, this.entity.endingPickMode);

    const idSequencingStrategy = `${id}-sequencingStrategy`;
    html.find(`#${idSequencingStrategy}`).change((data) => {
      const strategyId = $(data.target).val();
      thiz.entity.sequencingStrategyId = strategyId;
      
      const strategyDefinition = this.sequencingStrategies.find(it => it.id === strategyId);
      thiz.entity.sequencingStrategySettings = strategyDefinition.getSettings();

      this._updateRender()
    });
    this.syncDropDownValue(html, idSequencingStrategy, this.entity.sequencingStrategyId);

    const idSpellingStrategy = `${id}-spellingStrategy`;
    html.find(`#${idSpellingStrategy}`).change((data) => {
      const strategyId = $(data.target).val();
      thiz.entity.spellingStrategyId = strategyId === "undefined" ? undefined : strategyId;

      if (strategyId !== undefined) {
        const strategyDefinition = this.spellingStrategies.find(it => it.id === strategyId);
        if (strategyDefinition !== undefined) {
          thiz.entity.spellingStrategySettings = strategyDefinition.getSettings();
        } else {
          thiz.entity.spellingStrategySettings = undefined;
        }
      }

      this._updateRender()
    });
    this.syncDropDownValue(html, idSpellingStrategy, this.entity.spellingStrategyId);

    // Generate
    html.find(`#${id}-generate`).click(() => {
      const generator = this.entity.toGenerator();
      this.application._generate(generator);
    });
  }

  /**
   * Triggers a re-render of the parent application. 
   * 
   * @private
   */
  _updateRender() {
    this.application._updateGenerator(this.entity);
  }

  /**
   * Returns a value that the given `StrategySetting` instance would accept,
   * based on the given DOM element's current value. 
   * @param {StrategySetting} setting 
   * @param {JQuery | HTMLElement} element 
   * 
   * @returns {String | Number | Boolean}
   * 
   * @private
   */
  _parseSettingValue(setting, element) {
    const jElement = $(element);

    switch (setting.valueType) {
      case StrategySettingValueTypes.INTEGER:
        return parseInt($(jElement).val());
      case StrategySettingValueTypes.FLOAT:
        return parseFloat($(jElement).val());
      case StrategySettingValueTypes.BOOLEAN:
        return $(jElement)[0].checked;
      default:
        return $(jElement).val();
    }
  }
}