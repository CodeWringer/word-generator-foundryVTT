import DialogUtility from "../../util/dialog-utility.mjs";
import { StrategySettingValueTypes } from "../../../business/generator/strategy-setting.mjs";
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../info-bubble/info-bubble.mjs";
import WordGeneratorApplication from "../../application/word-generator-application/word-generator-application.mjs";
import WordGeneratorSamplesApplication from "../../application/word-generator-samples-application/word-generator-samples-application.mjs";
import { TEMPLATES } from "../../templates.mjs";
import DropDownOption from "../../drop-down-option.mjs";
import WordGeneratorItem from "../../../business/model/word-generator-item.mjs";
import AbstractSequencingStrategy from "../../../business/generator/sequencing/abstract-sequencing-strategy.mjs";
import AbstractSpellingStrategy from "../../../business/generator/postprocessing/abstract-spelling-strategy.mjs";
import AbstractEntityPresenter from "../../abstract-entity-presenter.mjs";

/**
 * This presenter handles a singular generator. 
 * 
 * @property {String} template Path to the Handlebars template that represents the entity. 
 * * Read-only
 * @property {WordGeneratorApplication} application The parent application. 
 * @property {ObservableWordGeneratorItem} entity The represented entity.  
 * 
 * @property {Array<AbstractSequencingStrategy>} sequencingStrategies
 * @property {Array<DropDownOption>} sequencingStrategyOptions
 * 
 * @property {Array<AbstractSpellingStrategy>} spellingStrategies
 * @property {Array<DropDownOption>} spellingStrategyOptions
 */
export default class WordGeneratorItemPresenter extends AbstractEntityPresenter {
  get template() { return TEMPLATES.WORD_GENERATOR_LIST_ITEM; }

  get id() { return this.entity.id; }

  get name() { return this.entity.name.value; }

  get isExpanded() { return this.entity.isExpanded.value; }

  /**
   * @param {Object} args
   * @param {WordGeneratorApplication} args.application The parent application. 
   * @param {ObservableWordGeneratorItem} args.entity The represented entity.  
   */
  constructor(args = {}) {
    super(args);

    this.sequencingStrategies = WordGeneratorApplication.registeredSequencingStrategies.getAll();
    this.sequencingStrategyOptions = this.sequencingStrategies
      .map(it => new DropDownOption({
        value: it.getDefinitionID(),
        localizedTitle: it.getHumanReadableName(),
      }));

    this.spellingStrategies = WordGeneratorApplication.registeredSpellingStrategies.getAll();
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
        content: game.i18n.localize("wg.general.confirmDeletionOf").replace("%s", this.entity.name.value),
      }).then(result => {
        if (result.confirmed === true) {
          // this.application._removeGenerator(id);
        }
      });
    });

    html.find(`#${id}-edit-sample-set`).click(() => {
      // new WordGeneratorSamplesApplication(this.entity, (data) => {
      //   if (data.confirmed === true) {
      //     this.entity.sampleSet.value = data.sampleSet;
      //     this.entity.sampleSetSeparator.value = data.sampleSetSeparator;
      //     this._updateRender()
      //   }
      // }).render(true);
    });

    html.find(`#${id}-name`).change((data) => {
      this.entity.name.value = $(data.target).val();
    });
    html.find(`#${id}-targetLengthMin`).change((data) => {
      this.entity.targetLengthMin.value = this.parseEmptyToGiven(data, 1);
    });
    html.find(`#${id}-targetLengthMax`).change((data) => {
      this.entity.targetLengthMax.value = this.parseEmptyToGiven(data, 7);
    });
    html.find(`#${id}-entropy`).change((data) => {
      this.entity.entropy.value = this.parseEmptyToGiven(data, 0.0);
    });
    html.find(`#${id}-entropyStart`).change((data) => {
      this.entity.entropyStart.value = this.parseEmptyToGiven(data, 0.0);
    });
    html.find(`#${id}-entropyMiddle`).change((data) => {
      this.entity.entropyMiddle.value = this.parseEmptyToGiven(data, 0.0);
    });
    html.find(`#${id}-entropyEnd`).change((data) => {
      this.entity.entropyEnd.value = this.parseEmptyToGiven(data, 0.0);
    });
    html.find(`#${id}-seed`).change((data) => {
      this.entity.seed.value = this.parseEmptyToUndefined(data);
    });

    // Sequencing settings
    html.find(`#${id}-sequencing-settings > li > input`).change(data => {
      const id = $(data.target)[0].id;
      const setting = this.entity.sequencingStrategySettings.getAll().find(it => it.name === id);
      setting.value = this._parseSettingValue(setting, data.target);
    });

    // Spelling settings
    html.find(`#${id}-spelling-settings > li > input`).change(data => {
      const id = $(data.target)[0].id;
      const setting = this.entity.spellingStrategySettings.getAll().find(it => it.name === id);
      setting.value = this._parseSettingValue(setting, data.target);
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
      this.entity.isExpanded.value = !this.entity.isExpanded.value;
    });

    // Drop-Downs
    const idEndingPickMode = `${id}-endingPickMode`;
    html.find(`#${idEndingPickMode}`).change((data) => {
      this.entity.endingPickMode.value = $(data.target).val();
    });
    this.syncDropDownValue(html, idEndingPickMode, this.entity.endingPickMode.value);

    const idSequencingStrategy = `${id}-sequencingStrategy`;
    html.find(`#${idSequencingStrategy}`).change((data) => {
      const strategyId = $(data.target).val();
      this.entity.sequencingStrategyId.value = strategyId;
      
      const strategyDefinition = this.sequencingStrategies.find(it => it.id === strategyId);
      this.entity.sequencingStrategySettings.clear();
      this.entity.sequencingStrategySettings.addAll(strategyDefinition.getSettings());
    });
    this.syncDropDownValue(html, idSequencingStrategy, this.entity.sequencingStrategyId.value);

    const idSpellingStrategy = `${id}-spellingStrategy`;
    html.find(`#${idSpellingStrategy}`).change((data) => {
      const strategyId = $(data.target).val();
      this.entity.spellingStrategyId.value = strategyId === "undefined" ? undefined : strategyId;

      if (strategyId !== undefined) {
        const strategyDefinition = this.spellingStrategies.find(it => it.id === strategyId);
        thiz.entity.spellingStrategySettings.clear();
        if (strategyDefinition !== undefined) {
          thiz.entity.spellingStrategySettings.addAll(strategyDefinition.getSettings());
        }
      }
    });
    this.syncDropDownValue(html, idSpellingStrategy, this.entity.spellingStrategyId.value);

    // Generate
    html.find(`#${id}-generate`).click(() => {
      const generator = this.entity.toGenerator();
      this.application._generate(generator);
    });
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