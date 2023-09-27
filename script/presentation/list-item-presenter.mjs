import { StrategySettingValueTypes } from "../generator/strategy-setting.mjs";
import * as DialogUtil from "../util/dialog-utility.mjs";
import InfoBubble from "./info-bubble.mjs";
import { InfoBubbleAutoShowingTypes, InfoBubbleAutoHidingTypes } from "./info-bubble.mjs";
import WordGeneratorApplication from "./word-generator-application.mjs";
import WordGeneratorSamplesApplication from "./word-generator-samples-application.mjs";

/**
 * This presenter handles a singular list item. 
 * 
 * It activates event listeners, sets initial states and performs other such presentation logic. 
 */
export class WordGeneratorListItemPresenter {
  /**
   * @param {WordGeneratorSettings} args.listItem The represented item. 
   * @param {Number} args.listIndex Index of this item in the list. 
   * @param {String} args.userId ID of the user that owns the list. 
   * @param {WordGeneratorApplication} application 
   */
  constructor(args) {
    this.listItem = args.listItem;
    this.listIndex = args.listIndex;
    this.userId = args.userId;
    this.application = args.application;
  }

  /**
   * @param {HTMLElement} html 
   */
  activateListeners(html, ) {
    const thiz = this;
    const id = this.listItem.id;

    html.find(`#${id}-delete`).click(() => {
      DialogUtil.showConfirmationDialog({
        localizableTitle: "wg.generator.confirmDeletion",
      }).then(result => {
        if (result.confirmed === true) {
          this.application._removeGenerator(id);
        }
      });
    });

    html.find(`#${id}-edit-sample-set`).click(() => {
      new WordGeneratorSamplesApplication(this.listItem, (data) => {
        if (data.confirmed === true) {
          this.listItem.sampleSet = data.sampleSet;
          this.listItem.sampleSetSeparator = data.sampleSetSeparator;
          this._updateRender()
        }
      }).render(true);
    });

    html.find(`#${id}-name`).change((data) => {
      thiz.listItem.name = $(data.target).val();
      this._updateRender()
    });
    html.find(`#${id}-targetLengthMin`).change((data) => {
      thiz.listItem.targetLengthMin = this._parseEmptyToGiven(data, 1);
      this._updateRender()
    });
    html.find(`#${id}-targetLengthMax`).change((data) => {
      thiz.listItem.targetLengthMax = this._parseEmptyToGiven(data, 7);
      this._updateRender()
    });
    html.find(`#${id}-entropy`).change((data) => {
      thiz.listItem.entropy = this._parseEmptyToGiven(data, 0.0);
      this._updateRender()
    });
    html.find(`#${id}-entropyStart`).change((data) => {
      thiz.listItem.entropyStart = this._parseEmptyToGiven(data, 0.0);
      this._updateRender()
    });
    html.find(`#${id}-entropyMiddle`).change((data) => {
      thiz.listItem.entropyMiddle = this._parseEmptyToGiven(data, 0.0);
      this._updateRender()
    });
    html.find(`#${id}-entropyEnd`).change((data) => {
      thiz.listItem.entropyEnd = this._parseEmptyToGiven(data, 0.0);
      this._updateRender()
    });
    html.find(`#${id}-seed`).change((data) => {
      thiz.listItem.seed = this._parseEmptyToUndefined(data);
      this._updateRender()
    });

    // Sequencing settings
    html.find(`#${id}-sequencing-settings > li > input`).change(data => {
      const id = $(data.target)[0].id;
      const setting = this.listItem.sequencingStrategySettings.find(it => it.name === id);
      setting.value = this._parseSettingValue(setting, data.target);
      this._updateRender();
    });

    // Spelling settings
    html.find(`#${id}-spelling-settings > li > input`).change(data => {
      const id = $(data.target)[0].id;
      const setting = this.listItem.spellingStrategySettings.find(it => it.name === id);
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
      thiz.listItem.collapsed = !(thiz.listItem.collapsed ?? false);
      this._updateRender()
    });

    // Drop-Downs
    const idEndingPickMode = `${id}-endingPickMode`;
    html.find(`#${idEndingPickMode}`).change((data) => {
      thiz.listItem.endingPickMode = $(data.target).val();
      this._updateRender()
    });
    this._syncDropDownValue(html, idEndingPickMode, this.listItem.endingPickMode);

    const idSequencingStrategy = `${id}-sequencingStrategy`;
    html.find(`#${idSequencingStrategy}`).change((data) => {
      const strategyId = $(data.target).val();
      thiz.listItem.sequencingStrategyId = strategyId;
      
      const strategyDefinition = WordGeneratorApplication.registeredSequencingStrategies.get(strategyId);
      thiz.listItem.sequencingStrategySettings = strategyDefinition.getSettings();

      this._updateRender()
    });
    this._syncDropDownValue(html, idSequencingStrategy, this.listItem.sequencingStrategyId);

    const idSpellingStrategy = `${id}-spellingStrategy`;
    html.find(`#${idSpellingStrategy}`).change((data) => {
      const strategyId = $(data.target).val();
      thiz.listItem.spellingStrategyId = strategyId === "undefined" ? undefined : strategyId;

      if (strategyId !== undefined) {
        const strategyDefinition = WordGeneratorApplication.registeredSpellingStrategies.get(strategyId);
        if (strategyDefinition !== undefined) {
          thiz.listItem.spellingStrategySettings = strategyDefinition.getSettings();
        } else {
          thiz.listItem.spellingStrategySettings = undefined;
        }
      }

      this._updateRender()
    });
    this._syncDropDownValue(html, idSpellingStrategy, this.listItem.spellingStrategyId);

    // Generate
    html.find(`#${id}-generate`).click(() => {
      const generator = this.listItem.toGenerator();
      this.application._generate(generator);
    });
  }

  /**
   * Ensures the current value is correctly reflected by the drop-down identified via the given id. 
   * @param {JQuery} html FormApplication root element. 
   * @param {String} id The id of the drop-down to synchronize. 
   * @param {Any} currentValue The current value of the field represented by the drop-down. 
   * 
   * @private
   */
  _syncDropDownValue(html, id, currentValue) {
    const selectElement = html.find(`#${id}`);
    const optionElements = selectElement.find('option');
    const currentValueAsString = "" + currentValue;
    for(let i = 0; i < optionElements.length; i++) {
      const optionElement = optionElements[i];
      if (optionElement.value == currentValueAsString) {
        selectElement[0].selectedIndex = i;
        break;
      }
    }
  }

  /**
   * Triggers a re-render of the parent application. 
   * 
   * @private
   */
  _updateRender() {
    this.application._setGenerator(this.listItem);
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

  /**
   * Returns either the value of the given 'change' event handler's context object 
   * or `undefined`, if the trimmed value is equal to an empty string. 
   * 
   * @param {Object} data Context object of a JQuery 'change' event handler. 
   * 
   * @returns {Any | undefined}
   * 
   * @private
   */
  _parseEmptyToUndefined(data) {
    const newVal = $(data.target).val().trim();
    return newVal === "" ? undefined : newVal;
  }

  /**
   * Returns either the value of the given 'change' event handler's context object 
   * or the given value, if the trimmed value is equal to an empty string. 
   * 
   * @param {Object} data Context object of a JQuery 'change' event handler. 
   * @param {Any} emptyValue The value to return, in case of an 'empty' value. 
   * 
   * @returns {Any | undefined}
   * 
   * @private
   */
  _parseEmptyToGiven(data, emptyValue) {
    const newVal = $(data.target).val().trim();
    return newVal === "" ? emptyValue : newVal;
  }
}